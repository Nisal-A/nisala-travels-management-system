<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\CustomerDocument;
use App\Models\Payment;
use Inertia\Inertia;

class CustomerPortalController extends Controller
{
    /**
     * Get the authenticated customer or abort.
     */
    private function getCustomer()
    {
        $customer = auth()->user()->customer;
        if (! $customer) {
            abort(403, 'No customer profile found.');
        }

        return $customer;
    }

    public function dashboard()
    {
        $this->getCustomer(); // Ensure customer exists

        return Inertia::render('Portal/Dashboard');
    }

    public function bookings()
    {
        $customer = $this->getCustomer();
        $bookings = Booking::where('customer_id', $customer->id)
            ->with('tourPackage')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Portal/Bookings', [
            'bookings' => $bookings,
        ]);
    }

    public function documents()
    {
        $customer = $this->getCustomer();
        $documents = CustomerDocument::where('customer_id', $customer->id)
            ->with('documentType')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Portal/Documents', [
            'documents' => $documents,
        ]);
    }

    public function payments()
    {
        $customer = $this->getCustomer();
        $payments = Payment::where('customer_id', $customer->id)
            ->with('booking.tourPackage')
            ->orderBy('payment_date', 'desc')
            ->paginate(10);

        return Inertia::render('Portal/Payments', [
            'payments' => $payments,
        ]);
    }
}
