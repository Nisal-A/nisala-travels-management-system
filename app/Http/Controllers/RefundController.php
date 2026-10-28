<?php

namespace App\Http\Controllers;

use App\Enums\Currency;
use App\Enums\PaymentMethod;
use App\Enums\RefundStatus;
use App\Enums\UserRole;
use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\Refund;
use App\Models\User;
use App\Notifications\RefundStatusNotification;
use App\Services\Currency\ExchangeRateService;
use App\Services\NotificationRecipients;
use Brick\Math\BigDecimal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class RefundController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Refund::class);

        $query = Refund::with(['booking', 'customer', 'requestedBy', 'approvedBy'])
            ->filterAndSort($request->all());

        $refunds = $query->paginate(15)->withQueryString();

        return Inertia::render('Refunds/Index', [
            'refunds' => $refunds,
            'filters' => (object) $request->all(),
            'statuses' => array_map(fn (RefundStatus $s) => ['value' => $s->value, 'label' => $s->label()], RefundStatus::cases()),
        ]);
    }

    public function create(Request $request)
    {
        Gate::authorize('create', Refund::class);

        $selectedBooking = null;
        if ($request->filled('booking_id')) {
            $selectedBooking = Booking::with(['customer', 'payments' => function ($q) {
                $q->where('status', '!=', 'failed');
            }])->find($request->input('booking_id'));
        }

        $bookings = Booking::with('customer')
            ->where('paid_amount', '>', 0)
            ->orderBy('id', 'desc')
            ->take(50)
            ->get();

        return Inertia::render('Refunds/Create', [
            'bookings' => $bookings,
            'selectedBooking' => $selectedBooking,
            'selectedBookingId' => $request->input('booking_id') ? (int) $request->input('booking_id') : null,
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Refund::class);

        $validated = $request->validate([
            'booking_id' => ['required', 'exists:bookings,id'],
            'payment_id' => ['nullable', 'exists:payments,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'cancellation_charge' => ['nullable', 'numeric', 'min:0'],
            'reason' => ['required', 'string', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $booking = Booking::with('customer')->findOrFail($validated['booking_id']);

        // Check over-refund: The refund amount cannot exceed the booking's paid amount minus refunds already approved or paid.
        $approvedOrPaidRefunds = Refund::where('booking_id', $booking->id)
            ->whereIn('status', [RefundStatus::Approved->value, RefundStatus::Paid->value])
            ->get();

        $alreadyRefunded = BigDecimal::zero();
        foreach ($approvedOrPaidRefunds as $existingRefund) {
            $alreadyRefunded = $alreadyRefunded->plus((string) $existingRefund->amount);
        }

        $bookingPaid = BigDecimal::of((string) $booking->paid_amount);
        $maxRefundable = $bookingPaid->minus($alreadyRefunded);
        $requestedAmount = BigDecimal::of((string) $validated['amount']);

        if ($requestedAmount->isGreaterThan($maxRefundable)) {
            $maxStr = (string) $maxRefundable;
            throw ValidationException::withMessages([
                'amount' => "Refund amount cannot exceed the booking's remaining paid amount of {$maxStr} {$booking->currency}.",
            ]);
        }

        $currency = $booking->currency ?? 'LKR';
        $currencyEnum = Currency::tryFrom($currency) ?? Currency::LKR;

        $exchangeService = app(ExchangeRateService::class);
        $rate = $exchangeService->latest($currencyEnum);
        $amountLkr = $exchangeService->convertToLkr((string) $validated['amount'], $currencyEnum);

        $cancellationCharge = $validated['cancellation_charge'] ?? 0;

        $refund = Refund::create([
            'booking_id' => $booking->id,
            'payment_id' => $validated['payment_id'] ?? null,
            'customer_id' => $booking->customer_id,
            'amount' => $validated['amount'],
            'cancellation_charge' => $cancellationCharge,
            'currency' => $currency,
            'exchange_rate_to_lkr' => (string) $rate,
            'amount_lkr' => (string) $amountLkr,
            'reason' => $validated['reason'],
            'status' => RefundStatus::Requested,
            'requested_by' => $request->user()->id,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Write Activity Log
        ActivityLog::create([
            'log_name' => 'refund',
            'description' => "Refund {$refund->refund_number} requested for {$refund->amount} {$refund->currency}",
            'subject_type' => Refund::class,
            'subject_id' => $refund->id,
            'causer_type' => User::class,
            'causer_id' => $request->user()->id,
            'properties' => [
                'refund_number' => $refund->refund_number,
                'booking_id' => $booking->id,
                'amount' => (string) $refund->amount,
                'currency' => $refund->currency,
                'status' => 'requested',
            ],
        ]);

        // Send in-app notification to the approvers (managers and super admins)
        $approvers = NotificationRecipients::getStaffByRole([UserRole::SuperAdmin, UserRole::Manager]);
        if ($approvers->isNotEmpty()) {
            Notification::send($approvers, new RefundStatusNotification($refund, 'requested'));
        }

        return redirect()->route('refunds.show', $refund)->with('success', "Refund request {$refund->refund_number} submitted successfully.");
    }

    public function show(Refund $refund, Request $request)
    {
        Gate::authorize('view', $refund);

        $refund->load([
            'booking.customer',
            'booking.payments' => function ($q) {
                $q->where('status', '!=', 'failed');
            },
            'customer',
            'requestedBy',
            'approvedBy',
            'payment',
            'activityLogs.causer',
        ]);

        $user = $request->user();

        return Inertia::render('Refunds/Show', [
            'refund' => $refund,
            'canApprove' => $user->can('approve', $refund),
            'canReject' => $user->can('reject', $refund),
            'canMarkPaid' => $user->can('markPaid', $refund),
            'paymentMethods' => array_map(fn (PaymentMethod $m) => ['value' => $m->value, 'label' => ucwords(str_replace('_', ' ', $m->value))], PaymentMethod::cases()),
        ]);
    }

    public function approve(Request $request, Refund $refund)
    {
        Gate::authorize('approve', $refund);

        $refund->load('booking');

        // Check if approval exceeds paid amount
        $approvedOrPaidRefunds = Refund::where('booking_id', $refund->booking_id)
            ->where('id', '!=', $refund->id)
            ->whereIn('status', [RefundStatus::Approved->value, RefundStatus::Paid->value])
            ->get();

        $alreadyRefunded = BigDecimal::zero();
        foreach ($approvedOrPaidRefunds as $existing) {
            $alreadyRefunded = $alreadyRefunded->plus((string) $existing->amount);
        }

        $bookingPaid = BigDecimal::of((string) $refund->booking->paid_amount);
        $maxRefundable = $bookingPaid->minus($alreadyRefunded);
        if (BigDecimal::of((string) $refund->amount)->isGreaterThan($maxRefundable)) {
            throw ValidationException::withMessages([
                'error' => 'Cannot approve: refund amount exceeds the remaining refundable paid amount.',
            ]);
        }

        $refund->update([
            'status' => RefundStatus::Approved,
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        ActivityLog::create([
            'log_name' => 'refund',
            'description' => "Refund {$refund->refund_number} approved",
            'subject_type' => Refund::class,
            'subject_id' => $refund->id,
            'causer_type' => User::class,
            'causer_id' => $request->user()->id,
            'properties' => [
                'refund_number' => $refund->refund_number,
                'status' => 'approved',
                'approved_by' => $request->user()->id,
            ],
        ]);

        // Send in-app notification to the approvers
        $approvers = NotificationRecipients::getStaffByRole([UserRole::SuperAdmin, UserRole::Manager, UserRole::Finance]);
        if ($approvers->isNotEmpty()) {
            Notification::send($approvers, new RefundStatusNotification($refund, 'approved'));
        }

        return back()->with('success', "Refund {$refund->refund_number} approved.");
    }

    public function reject(Request $request, Refund $refund)
    {
        Gate::authorize('reject', $refund);

        $validated = $request->validate([
            'rejection_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $notes = $refund->notes;
        if (! empty($validated['rejection_reason'])) {
            $notes = trim($notes . "\nRejection reason: " . $validated['rejection_reason']);
        }

        $refund->update([
            'status' => RefundStatus::Rejected,
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'notes' => $notes,
        ]);

        ActivityLog::create([
            'log_name' => 'refund',
            'description' => "Refund {$refund->refund_number} rejected",
            'subject_type' => Refund::class,
            'subject_id' => $refund->id,
            'causer_type' => User::class,
            'causer_id' => $request->user()->id,
            'properties' => [
                'refund_number' => $refund->refund_number,
                'status' => 'rejected',
                'rejected_by' => $request->user()->id,
                'reason' => $validated['rejection_reason'] ?? null,
            ],
        ]);

        // Send in-app notification to the approvers
        $approvers = NotificationRecipients::getStaffByRole([UserRole::SuperAdmin, UserRole::Manager, UserRole::Finance]);
        if ($approvers->isNotEmpty()) {
            Notification::send($approvers, new RefundStatusNotification($refund, 'rejected'));
        }

        return back()->with('success', "Refund {$refund->refund_number} rejected.");
    }

    public function markPaid(Request $request, Refund $refund)
    {
        Gate::authorize('markPaid', $refund);

        $validated = $request->validate([
            'paid_on' => ['required', 'date'],
            'payment_method' => ['required', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $notes = $refund->notes;
        if (! empty($validated['notes'])) {
            $notes = trim($notes . "\nPayment notes: " . $validated['notes']);
        }

        $refund->update([
            'status' => RefundStatus::Paid,
            'paid_on' => $validated['paid_on'],
            'payment_method' => $validated['payment_method'],
            'notes' => $notes,
        ]);

        ActivityLog::create([
            'log_name' => 'refund',
            'description' => "Refund {$refund->refund_number} marked as paid",
            'subject_type' => Refund::class,
            'subject_id' => $refund->id,
            'causer_type' => User::class,
            'causer_id' => $request->user()->id,
            'properties' => [
                'refund_number' => $refund->refund_number,
                'status' => 'paid',
                'paid_on' => $validated['paid_on'],
                'payment_method' => $validated['payment_method'],
            ],
        ]);

        // Send in-app notification to the approvers
        $approvers = NotificationRecipients::getStaffByRole([UserRole::SuperAdmin, UserRole::Manager, UserRole::Finance]);
        if ($approvers->isNotEmpty()) {
            Notification::send($approvers, new RefundStatusNotification($refund, 'paid'));
        }

        return back()->with('success', "Refund {$refund->refund_number} marked as paid.");
    }
}
