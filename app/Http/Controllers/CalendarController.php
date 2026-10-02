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

    /**
     * GET /admin/calendar/events?start=&end=&types[]=
     *
     * Returns events for the visible range only, each with:
     * title, type, date, booking_id, status.
     *
     * Uses eager loading to avoid N+1 queries.
     */
    public function events(Request $request)
    {
        $request->validate([
            'start' => 'required|date',
            'end' => 'required|date|after_or_equal:start',
            'types' => 'nullable|array',
            'types.*' => 'string|in:departures,returns,balance,visa',
        ]);

        $start = Carbon::parse($request->get('start'));
        $end = Carbon::parse($request->get('end'));
        $types = $request->get('types', []);

        $events = [];

        // 1. Departures, Returns, and Balance Due dates
        $needsBookings = empty($types)
            || array_intersect(['departures', 'returns', 'balance'], $types);

        if ($needsBookings) {
            // Single query with eager loading — avoids N+1
            $bookingsQuery = Booking::with(['customer:id,full_name', 'tourPackage:id,name', 'tourPackage.destination:id,name'])
                ->where(function($q) use ($start, $end) {
                    // Departures in range
                    $q->whereBetween('travel_date', [$start, $end])
                      // Returns in range
                      ->orWhereBetween('return_date', [$start, $end]);
                    
                    // Balance due dates (30 days prior to travel) that fall in the visible range
                    // travel_date between (start + 30 days) and (end + 30 days) means due date in range
                    $q->orWhere(function ($sub) use ($start, $end) {
                        $sub->where('balance_amount', '>', 0)
                            ->whereBetween('travel_date', [
                                $start->copy()->addDays(30),
                                $end->copy()->addDays(30),
                            ]);
                    });
                });

            $bookings = $bookingsQuery->get();

            foreach ($bookings as $booking) {
                $customerName = $booking->customer->full_name ?? 'Unknown';

                $bookingData = [
                    'id' => $booking->id,
                    'customer' => $customerName,
                    'destination' => $booking->tourPackage?->destination?->name ?? 'Unknown',
                    'travelers' => $booking->number_of_travelers,
                    'balance' => (float) $booking->balance_amount,
                    'reference' => $booking->booking_reference,
                    'status' => $booking->booking_status?->value ?? $booking->booking_status,
                ];

                // Departures
                if (empty($types) || in_array('departures', $types)) {
                    if ($booking->travel_date >= $start && $booking->travel_date <= $end) {
                        $events[] = [
                            'id' => 'dep_' . $booking->id,
                            'title' => 'Departure: ' . $customerName,
                            'start' => $booking->travel_date->format('Y-m-d'),
                            'allDay' => true,
                            'type' => 'departures',
                            'booking_id' => $booking->id,
                            'status' => $bookingData['status'],
                            'booking' => $bookingData,
                        ];
                    }
                }

                // Returns
                if (empty($types) || in_array('returns', $types)) {
                    if ($booking->return_date && $booking->return_date >= $start && $booking->return_date <= $end) {
                        $events[] = [
                            'id' => 'ret_' . $booking->id,
                            'title' => 'Return: ' . $customerName,
                            'start' => $booking->return_date->format('Y-m-d'),
                            'allDay' => true,
                            'type' => 'returns',
                            'booking_id' => $booking->id,
                            'status' => $bookingData['status'],
                            'booking' => $bookingData,
                        ];
                    }
                }

                // Balance due dates
                if (empty($types) || in_array('balance', $types)) {
                    if ($booking->balance_amount > 0 && $booking->travel_date) {
                        $balanceDueDate = Carbon::parse($booking->travel_date)->subDays(30);
                        if ($balanceDueDate >= $start && $balanceDueDate <= $end) {
                            $events[] = [
                                'id' => 'bal_' . $booking->id,
                                'title' => 'Balance Due: ' . $customerName . ' (LKR ' . number_format((float) $booking->balance_amount, 0) . ')',
                                'start' => $balanceDueDate->format('Y-m-d'),
                                'allDay' => true,
                                'type' => 'balance',
                                'booking_id' => $booking->id,
                                'status' => $bookingData['status'],
                                'booking' => $bookingData,
                            ];
                        }
                    }
                }
            }
        }
        
        // 2. Visa Deadlines
        if (empty($types) || in_array('visa', $types)) {
            $docs = CustomerDocument::with(['customer:id,full_name', 'documentType:id,name'])
                ->whereHas('documentType', function ($q) {
                    $q->where('name', 'like', '%Visa%');
                })
                ->whereBetween('expiry_date', [$start, $end])
                ->get();
            
            // Fallback to document_type_id = 2 if no Visa type found
            if ($docs->isEmpty()) {
                $docs = CustomerDocument::with(['customer:id,full_name'])
                    ->where('document_type_id', 2) 
                    ->whereBetween('expiry_date', [$start, $end])
                    ->get();
            }

            foreach($docs as $doc) {
                $events[] = [
                    'id' => 'doc_' . $doc->id,
                    'title' => 'Visa Expiry: ' . ($doc->customer->full_name ?? 'Unknown'),
                    'start' => $doc->expiry_date->format('Y-m-d'),
                    'allDay' => true,
                    'type' => 'visa',
                    'booking_id' => null,
                    'status' => $doc->verification_status ?? 'unknown',
                    'booking' => null,
                ];
            }
        }

        return response()->json($events);
    }
}
