<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Booking;
use App\Http\Requests\StorePaymentRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use App\Enums\PaymentStatus;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Payment::class);

        $perPage = $request->input('per_page', 10);
        $payments = Payment::with(['customer', 'booking', 'recordedBy'])
            ->filterAndSort($request->all())
            ->paginate($perPage)
            ->withQueryString();

        $savedFilters = \App\Models\SavedFilter::where('user_id', $request->user()->id)
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
                'amount' => 'Payment amount cannot exceed the remaining balance of ' . number_format($booking->balance_amount, 2) . ' ' . $booking->currency
            ]);
        }

        try {
            DB::beginTransaction();

            $payment = Payment::create([
                'booking_id' => $booking->id,
                'customer_id' => $booking->customer_id,
                'amount' => $validated['amount'],
                'currency' => $booking->currency,
                'payment_method' => $validated['payment_method'],
                'payment_date' => $validated['payment_date'],
                'reference_number' => $validated['reference_number'] ?? null,
                'recorded_by' => $request->user()->id,
                'notes' => $validated['notes'] ?? null,
                'status' => PaymentStatus::Completed,
            ]);

            // Automatically update the booking's paid and balance amounts
            $booking->paid_amount += $payment->amount;
            $booking->balance_amount -= $payment->amount;
            $booking->save();

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
