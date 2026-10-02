<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Carbon;
use App\Models\CustomerDocument;

class CalendarController extends Controller
{
    public function index()
    {
        return Inertia::render('Calendar/Index');
    }

    public function events(Request $request)
    {
        $start = Carbon::parse($request->get('start'));
        $end = Carbon::parse($request->get('end'));
        $types = $request->get('types', []);

        $events = [];

        // 1. Departures and Returns
        if (empty($types) || in_array('departures', $types) || in_array('returns', $types) || in_array('balance', $types)) {
            $bookingsQuery = Booking::with(['customer', 'tourPackage.destination'])
                ->where(function($q) use ($start, $end) {
                    $q->whereBetween('travel_date', [$start, $end])
                      ->orWhereBetween('return_date', [$start, $end]);
                    
                    // Also include for balance due calculation (30 days prior to travel date)
                    $q->orWhereBetween('travel_date', [$start->copy()->addDays(30), $end->copy()->addDays(30)]);
                });

            $bookings = $bookingsQuery->get();

            foreach ($bookings as $booking) {
                $customerName = $booking->customer->full_name ?? 'Unknown';

                $bookingData = [
                    'id' => $booking->id,
                    'customer' => $customerName,
                    'destination' => $booking->tourPackage?->destination?->name ?? 'Unknown',
                    'travelers' => $booking->number_of_travelers,
                    'balance' => $booking->balance_amount,
                    'reference' => $booking->booking_reference,
                ];

                if (empty($types) || in_array('departures', $types)) {
                    if ($booking->travel_date >= $start && $booking->travel_date <= $end) {
                        $events[] = [
                            'id' => 'dep_' . $booking->id,
                            'title' => 'Departure: ' . $customerName,
                            'start' => $booking->travel_date,
                            'allDay' => true,
                            'type' => 'departures',
                            'booking' => $bookingData,
                        ];
                    }
                }

                if (empty($types) || in_array('returns', $types)) {
                    if ($booking->return_date && $booking->return_date >= $start && $booking->return_date <= $end) {
                        $events[] = [
                            'id' => 'ret_' . $booking->id,
                            'title' => 'Return: ' . $customerName,
                            'start' => $booking->return_date,
                            'allDay' => true,
                            'type' => 'returns',
                            'booking' => $bookingData,
                        ];
                    }
                }

                if (empty($types) || in_array('balance', $types)) {
                    if ($booking->balance_amount > 0 && $booking->travel_date) {
                        $balanceDueDate = Carbon::parse($booking->travel_date)->subDays(30);
                        if ($balanceDueDate >= $start && $balanceDueDate <= $end) {
                            $events[] = [
                                'id' => 'bal_' . $booking->id,
                                'title' => 'Balance Due: ' . $customerName,
                                'start' => $balanceDueDate->format('Y-m-d'),
                                'allDay' => true,
                                'type' => 'balance',
                                'booking' => $bookingData,
                            ];
                        }
                    }
                }
            }
        }
        
        // 2. Visa Deadlines
        if (empty($types) || in_array('visa', $types)) {
            $docs = CustomerDocument::with('customer')
                ->whereHas('documentType', function ($q) {
                    $q->where('name', 'like', '%Visa%');
                })
                ->whereBetween('expiry_date', [$start, $end])
                ->get();
            
            // If no type named Visa exists, we fallback to document_type_id = 2 as an example.
            if ($docs->isEmpty()) {
                $docs = CustomerDocument::with('customer')
                    ->where('document_type_id', 2) 
                    ->whereBetween('expiry_date', [$start, $end])
                    ->get();
            }

            foreach($docs as $doc) {
                $events[] = [
                    'id' => 'doc_' . $doc->id,
                    'title' => 'Visa Expiry: ' . ($doc->customer->full_name ?? 'Unknown'),
                    'start' => $doc->expiry_date,
                    'allDay' => true,
                    'type' => 'visa',
                    'booking' => null
                ];
            }
        }

        return response()->json($events);
    }
}
