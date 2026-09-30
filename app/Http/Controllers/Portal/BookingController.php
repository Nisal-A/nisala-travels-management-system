<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Http\Resources\Portal\BookingCardResource;
use App\Http\Resources\Portal\BookingDetailResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class BookingController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $customer = $request->user()->customer;
        
        $bookings = Booking::where('customer_id', $customer->id)
            ->with('tourPackage')
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        return Inertia::render('Portal/Bookings', [
            'bookings' => BookingCardResource::collection($bookings),
        ]);
    }
    
    public function show(Booking $booking)
    {
        $this->authorize('view', $booking);
        
        $booking->load(['tourPackage', 'travelers']);
        
        return Inertia::render('Portal/BookingDetail', [
            'booking' => new BookingDetailResource($booking),
        ]);
    }
    
    public function itinerary(Booking $booking)
    {
        $this->authorize('view', $booking);
        // Stub for PDF download
        return response()->download(storage_path('app/public/stub-itinerary.pdf')); // Stub
    }
}
