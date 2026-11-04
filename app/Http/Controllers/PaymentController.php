<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Events\PaymentReceived;
use App\Http\Requests\StorePaymentRequest;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\SavedFilter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Payment::class);

        $perPage = $request->input('per_page', 10);
        $payments = Payment::with(['customer', 'booking', 'recordedBy', 'receipt'])
            ->filterAndSort($request->all())
            ->paginate($perPage)
            ->withQueryString();

        $savedFilters = SavedFilter::where('user_id', $request->user()->id)
            ->where('table_key', 'payments')
            ->get();

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
            'filters' => $request->all(),
            'savedFilters' => $savedFilters,
        ]);
    }

    /**
     * Recalculate a booking's payment_status and synchronize its PaymentSchedule installments.
     */
    protected function syncBookingPaymentState(Booking $booking): void
    {
        $paidAmount = max(0.0, (float) $booking->paid_amount);
        $finalAmount = max(0.0, (float) $booking->final_amount);
        $booking->balance_amount = max(0.0, $finalAmount - $paidAmount);

        if ($paidAmount >= $finalAmount && $finalAmount > 0) {
            $booking->payment_status = 'Paid';
        } elseif ($paidAmount > 0) {
            $booking->payment_status = 'Partial';
        } else {
            $booking->payment_status = 'Unpaid';
        }

        $booking->save();

        // Update PaymentSchedule installment statuses in chronological order
        $remainingPaid = $paidAmount;
        $schedules = $booking->paymentSchedules()->orderBy('due_date', 'asc')->orderBy('id', 'asc')->get();
        foreach ($schedules as $schedule) {
            $schedAmount = (float) $schedule->amount;
            if ($schedAmount > 0 && $remainingPaid >= $schedAmount) {
                $schedule->status = 'paid';
                $remainingPaid -= $schedAmount;
            } else {
                $schedule->status = ($schedule->due_date && $schedule->due_date->isPast()) ? 'overdue' : 'unpaid';
                $remainingPaid = 0.0;
            }
            $schedule->save();
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePaymentRequest $request)
    {
        $this->authorize('create', Payment::class);
        $validated = $request->validated();

        $booking = Booking::findOrFail($validated['booking_id']);

        // Ensure payment amount doesn't exceed balance
        if ($validated['amount'] > $booking->balance_amount) {
            throw ValidationException::withMessages([
                'amount' => 'Payment amount cannot exceed the remaining balance of '.number_format($booking->balance_amount, 2).' '.$booking->currency,
            ]);
        }

        try {
            DB::transaction(function () use ($request, $validated) {
                $booking = Booking::lockForUpdate()->findOrFail($validated['booking_id']);

                if ($validated['amount'] > $booking->balance_amount) {
                    throw ValidationException::withMessages([
                        'amount' => 'Payment amount cannot exceed the remaining balance of '.number_format($booking->balance_amount, 2).' '.$booking->currency,
                    ]);
                }

                $exchangeService = app(\App\Services\Currency\ExchangeRateService::class);
                $currency = \App\Enums\Currency::tryFrom($booking->currency) ?? \App\Enums\Currency::LKR;
                $exchangeRate = $exchangeService->latest($currency);
                $amountLkr = $exchangeService->convertToLkr((string) $validated['amount'], $currency);

                $payment = Payment::create([
                    'booking_id' => $booking->id,
                    'customer_id' => $booking->customer_id,
                    'amount' => $validated['amount'],
                    'currency' => $booking->currency,
                    'exchange_rate_to_lkr' => (string) $exchangeRate,
                    'amount_lkr' => (string) $amountLkr,
                    'payment_method' => $validated['payment_method'],
                    'payment_date' => $validated['payment_date'],
                    'reference_number' => $validated['reference_number'] ?? null,
                    'recorded_by' => $request->user()->id,
                    'notes' => $validated['notes'] ?? null,
                    'status' => PaymentStatus::Completed,
                ]);

                $generator = app(\App\Services\NumberGenerator::class);
                $year = $payment->payment_date ? (int) \Carbon\Carbon::parse($payment->payment_date)->format('Y') : (int) now()->format('Y');
                $receiptNumber = $generator->receipt($year);

                \App\Models\PaymentReceipt::create([
                    'payment_id' => $payment->id,
                    'receipt_number' => $receiptNumber,
                    'generated_by' => $request->user()->id,
                ]);

                // Automatically update the booking's paid, balance, payment_status, and installments
                $booking->paid_amount = (float) $booking->paid_amount + (float) $payment->amount;
                $this->syncBookingPaymentState($booking);

                DB::afterCommit(fn () => event(new PaymentReceived($payment)));
            });

            return back()->with('success', 'Payment recorded successfully.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to record payment.']);
        }
    }

    /**
     * Display the specified payment resource.
     */
    public function show(Payment $payment)
    {
        $this->authorize('view', $payment);

        return response()->json($payment->load(['customer', 'booking', 'recordedBy', 'receipt']));
    }

    /**
     * Update the specified payment resource.
     */
    public function update(Request $request, Payment $payment)
    {
        $this->authorize('update', $payment);

        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:2000'],
            'reference_number' => ['nullable', 'string', 'max:100'],
        ]);

        $payment->update($validated);

        return back()->with('success', 'Payment updated successfully.');
    }

    /**
     * Remove the specified resource from storage (Void payment).
     */
    public function destroy(Payment $payment)
    {
        $this->authorize('delete', $payment);

        if ($payment->status === PaymentStatus::Failed) {
            return back()->withErrors(['error' => 'This payment is already failed/voided.']);
        }

        try {
            DB::transaction(function () use ($payment) {
                $booking = Booking::lockForUpdate()->findOrFail($payment->booking_id);
                $booking->paid_amount = max(0.0, (float) $booking->paid_amount - (float) $payment->amount);
                $this->syncBookingPaymentState($booking);

                $payment->status = PaymentStatus::Failed;
                $payment->save();

                $payment->delete();
            });

            return back()->with('success', 'Payment voided successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to void payment.']);
        }
    }
}
