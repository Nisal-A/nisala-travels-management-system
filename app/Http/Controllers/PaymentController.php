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
        Gate::authorize('viewAny', Payment::class);

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
     * Store a newly created resource in storage.
     */
    public function store(StorePaymentRequest $request)
    {
        Gate::authorize('create', Payment::class);
        $validated = $request->validated();

        $booking = Booking::findOrFail($validated['booking_id']);

        // Ensure payment amount doesn't exceed balance
        if ($validated['amount'] > $booking->balance_amount) {
            throw ValidationException::withMessages([
                'amount' => 'Payment amount cannot exceed the remaining balance of '.number_format($booking->balance_amount, 2).' '.$booking->currency,
            ]);
        }

        try {
            DB::beginTransaction();

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

            // Automatically update the booking's paid and balance amounts
            $booking->paid_amount += $payment->amount;
            $booking->balance_amount -= $payment->amount;
            $booking->save();

            DB::afterCommit(fn () => event(new PaymentReceived($payment)));

            DB::commit();

            return back()->with('success', 'Payment recorded successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Failed to record payment.']);
        }
    }

    /**
     * Remove the specified resource from storage (Void payment).
     */
    public function destroy(Payment $payment)
    {
        Gate::authorize('delete', $payment);

        if ($payment->status === PaymentStatus::Failed) {
            return back()->withErrors(['error' => 'This payment is already failed/voided.']);
        }

        try {
            DB::beginTransaction();

            // Reverse the booking amounts
            $booking = clone $payment->booking;
            $booking->paid_amount -= $payment->amount;
            $booking->balance_amount += $payment->amount;
            $booking->save();

            $payment->status = PaymentStatus::Failed;
            $payment->save();

            $payment->delete();

            DB::commit();

            return back()->with('success', 'Payment voided successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Failed to void payment.']);
        }
    }
}
