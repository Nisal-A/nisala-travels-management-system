<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\TourPackage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class GlobalSearchController extends Controller
{
    /**
     * Search across entities based on user permissions.
     */
    public function search(Request $request)
    {
        $query = $request->input('q');

        if (strlen($query) < 2) {
            return response()->json(['data' => []]);
        }

        $results = [];

        // Customers
        if (Gate::allows('viewAny', Customer::class)) {
            $customers = Customer::where('first_name', 'like', "%{$query}%")
                ->orWhere('last_name', 'like', "%{$query}%")
                ->orWhere('email', 'like', "%{$query}%")
                ->orWhere('phone', 'like', "%{$query}%")
                ->limit(5)
                ->get()
                ->map(fn ($c) => [
                    'id' => $c->id,
                    'title' => "{$c->first_name} {$c->last_name}",
                    'subtitle' => $c->email,
                    'url' => route('customers.show', $c->id),
                    'group' => 'Customers',
                    'icon' => 'Users',
                ]);

            if ($customers->isNotEmpty()) {
                $results = array_merge($results, $customers->toArray());
            }
        }

        // Bookings
        if (Gate::allows('viewAny', Booking::class)) {
            $bookings = Booking::where('booking_reference', 'like', "%{$query}%")
                ->orWhereHas('customer', function ($q) use ($query) {
                    $q->where('first_name', 'like', "%{$query}%")
                        ->orWhere('last_name', 'like', "%{$query}%");
                })
                ->limit(5)
                ->get()
                ->map(fn ($b) => [
                    'id' => $b->id,
                    'title' => $b->booking_reference,
                    'subtitle' => $b->customer ? "{$b->customer->first_name} {$b->customer->last_name}" : '',
                    'url' => route('bookings.show', $b->id),
                    'group' => 'Bookings',
                    'icon' => 'CalendarCheck',
                ]);

            if ($bookings->isNotEmpty()) {
                $results = array_merge($results, $bookings->toArray());
            }
        }

        // Payments
        if (Gate::allows('viewAny', Payment::class)) {
            $payments = Payment::where('receipt_number', 'like', "%{$query}%")
                ->orWhere('reference_number', 'like', "%{$query}%")
                ->limit(5)
                ->get()
                ->map(fn ($p) => [
                    'id' => $p->id,
                    'title' => $p->receipt_number ?: $p->reference_number ?: "RCP-{$p->id}",
                    'subtitle' => number_format($p->amount, 2).' '.$p->currency,
                    // No direct show route for payments yet, but let's assume one or just link to booking
                    'url' => route('bookings.show', $p->booking_id),
                    'group' => 'Payments',
                    'icon' => 'CreditCard',
                ]);

            if ($payments->isNotEmpty()) {
                $results = array_merge($results, $payments->toArray());
            }
        }

        // Tour Packages
        if (Gate::allows('viewAny', TourPackage::class)) {
            $tours = TourPackage::where('name', 'like', "%{$query}%")
                ->limit(5)
                ->get()
                ->map(fn ($t) => [
                    'id' => $t->id,
                    'title' => $t->name,
                    'subtitle' => $t->duration_days.' days',
                    'url' => route('tours.show', $t->id),
                    'group' => 'Tours',
                    'icon' => 'Map',
                ]);

            if ($tours->isNotEmpty()) {
                $results = array_merge($results, $tours->toArray());
            }
        }

        return response()->json(['data' => $results]);
    }
}
