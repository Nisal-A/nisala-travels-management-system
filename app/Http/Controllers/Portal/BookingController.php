<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Resources\Portal\BookingCardResource;
use App\Http\Resources\Portal\BookingDetailResource;
use App\Models\Booking;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $customer = $request->user()->customer;

        $query = Booking::where('customer_id', $customer->id)
            ->with('tourPackage');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('booking_reference', 'like', "%{$search}%")
                    ->orWhereHas('tourPackage', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $status = $request->input('status');
            if ($status === 'upcoming') {
                $query->whereIn('booking_status', ['pending', 'confirmed'])->where('travel_date', '>=', now());
            } elseif ($status === 'completed') {
                $query->where('booking_status', 'completed')->orWhere(function ($q) {
                    $q->where('booking_status', 'confirmed')->where('travel_date', '<', now());
                });
            } elseif ($status === 'cancelled') {
                $query->where('booking_status', 'cancelled');
            }
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(12)->withQueryString();

        return Inertia::render('Portal/Bookings', [
            'bookings' => BookingCardResource::collection($bookings),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(Booking $booking)
    {
        $this->authorize('view', $booking);

        $booking->load(['tourPackage', 'travelers', 'payments', 'customer.documents.documentType']);

        return Inertia::render('Portal/BookingDetail', [
            'booking' => new BookingDetailResource($booking),
        ]);
    }

    public function itinerary(Booking $booking)
    {
        $this->authorize('view', $booking);
        $booking->load(['tourPackage', 'travelers', 'customer']);

        $pdf = Pdf::loadView('portal.itinerary', compact('booking'));

        return $pdf->download("Itinerary_{$booking->booking_reference}.pdf");
    }
}
