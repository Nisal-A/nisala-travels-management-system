<?php

namespace App\Http\Controllers\Portal;

use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Portal\PaymentResource;
use App\Models\Booking;
use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $customer = $request->user()->customer;

        $query = Payment::where('customer_id', $customer->id)
            ->with(['booking.tourPackage', 'receipt']);

        if ($request->filled('booking_id')) {
            $query->where('booking_id', $request->booking_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('payment_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('payment_date', '<=', $request->date_to);
        }

        $payments = $query->orderBy('payment_date', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Calculate Summary
        $bookings = Booking::where('customer_id', $customer->id)->get();
        $totalPaid = $bookings->sum('paid_amount');
        $totalOutstanding = $bookings->sum('balance_amount');

        // Find next due date (simplistic logic based on active bookings travel_date)
        $nextDueDate = $bookings->where('booking_status', BookingStatus::Confirmed)
            ->where('balance_amount', '>', 0)
            ->where('travel_date', '>', now())
            ->sortBy('travel_date')
            ->first()?->travel_date?->subDays(30)?->format('Y-m-d') ?? null;

        // Generate Installment Schedule
        $installments = [];
        foreach ($bookings as $booking) {
            if ($booking->booking_status === BookingStatus::Cancelled) {
                continue;
            }

            // Dummy logic: Deposit is 20%, balance is 80% due 30 days before travel
            $depositAmount = $booking->final_amount * 0.20;
            $balanceAmount = $booking->final_amount * 0.80;
            $depositDue = $booking->booking_date;
            $balanceDue = $booking->travel_date ? $booking->travel_date->subDays(30) : null;

            $installments[] = [
                'booking_id' => $booking->id,
                'booking_reference' => $booking->booking_reference ?? 'BKG-'.$booking->id,
                'tour_name' => $booking->tourPackage->name ?? 'Custom Tour',
                'description' => 'Deposit',
                'amount' => $depositAmount,
                'due_date' => $depositDue?->format('Y-m-d'),
                'status' => $booking->paid_amount >= $depositAmount ? 'Paid' : 'Unpaid',
            ];

            if ($balanceAmount > 0 && $balanceDue) {
                $installments[] = [
                    'booking_id' => $booking->id,
                    'booking_reference' => $booking->booking_reference ?? 'BKG-'.$booking->id,
                    'tour_name' => $booking->tourPackage->name ?? 'Custom Tour',
                    'description' => 'Final Balance',
                    'amount' => $balanceAmount,
                    'due_date' => $balanceDue->format('Y-m-d'),
                    'status' => $booking->balance_amount <= 0 ? 'Paid' : ($balanceDue < now() ? 'Overdue' : 'Unpaid'),
                ];
            }
        }

        return Inertia::render('Portal/Payments', [
            'payments' => PaymentResource::collection($payments),
            'filters' => $request->only(['booking_id', 'date_from', 'date_to']),
            'summary' => [
                'total_paid' => $totalPaid,
                'total_outstanding' => $totalOutstanding,
                'next_due_date' => $nextDueDate,
            ],
            'installments' => $installments,
            'customerBookings' => $bookings->map(fn ($b) => ['id' => $b->id, 'reference' => $b->booking_reference ?? 'BKG-'.$b->id]),
            'payment_instructions' => config('travel.payment_instructions', [
                'bank' => 'Commercial Bank of Ceylon',
                'account_name' => 'Nisala Travels (Pvt) Ltd',
                'account_number' => '1234567890',
                'branch' => 'Colombo Main',
                'notes' => 'Please mention your Booking Reference in the transfer reference and email the receipt to billing@nisalatravels.com.',
            ]),
        ]);
    }

    public function receipt(Payment $payment)
    {
        // Enforce authorization
        if ($payment->customer_id !== request()->user()->customer->id) {
            abort(403);
        }

        $payment->load('receipt', 'booking.customer', 'booking.tourPackage');

        // Derive receipt number: from receipt relation, falling back to RCP- + id only
        $receiptNumber = $payment->receipt?->receipt_number ?? 'RCP-'.$payment->id;

        $pdf = Pdf::loadView('portal.receipt', [
            'payment' => $payment,
            'customer' => $payment->booking->customer,
            'company' => config('travel.company'),
            'receipt_number' => $receiptNumber,
        ]);

        return $pdf->download('Receipt_'.$receiptNumber.'.pdf');
    }
}
