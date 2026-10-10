<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $range = $request->query('range', 'this_month');
        $tab = $request->query('tab', 'overview');
        $compare = $request->query('compare', '1') === '1';

        [$startDate, $endDate, $compareStartDate, $compareEndDate] = $this->getDateRanges($range);

        $cacheKey = "reports_{$range}_{$tab}_" . $startDate->format('Y-m-d') . '_' . $endDate->format('Y-m-d');

        $data = Cache::remember($cacheKey, 600, function () use ($startDate, $endDate, $compareStartDate, $compareEndDate, $tab) {
            
            // KPIs
            $currentRevenue = Booking::whereBetween('created_at', [$startDate, $endDate])->whereNotIn('booking_status', ['cancelled', 'draft'])->sum('final_amount');
            $prevRevenue = Booking::whereBetween('created_at', [$compareStartDate, $compareEndDate])->whereNotIn('booking_status', ['cancelled', 'draft'])->sum('final_amount');
            
            $currentBookings = Booking::whereBetween('created_at', [$startDate, $endDate])->whereNotIn('booking_status', ['cancelled', 'draft'])->count();
            $prevBookings = Booking::whereBetween('created_at', [$compareStartDate, $compareEndDate])->whereNotIn('booking_status', ['cancelled', 'draft'])->count();
            
            $currentOutstanding = Booking::whereBetween('created_at', [$startDate, $endDate])->whereNotIn('booking_status', ['cancelled', 'draft'])->sum('balance_amount');
            $prevOutstanding = Booking::whereBetween('created_at', [$compareStartDate, $compareEndDate])->whereNotIn('booking_status', ['cancelled', 'draft'])->sum('balance_amount');

            $kpis = [
                'revenue' => [
                    'value' => $currentRevenue,
                    'change' => $this->calculatePercentageChange($prevRevenue, $currentRevenue),
                ],
                'bookings' => [
                    'value' => $currentBookings,
                    'change' => $this->calculatePercentageChange($prevBookings, $currentBookings),
                ],
                'outstanding' => [
                    'value' => $currentOutstanding,
                    'change' => $this->calculatePercentageChange($prevOutstanding, $currentOutstanding),
                ],
                'conversion_rate' => [
                    'value' => 0, // Mock for now until leads module
                    'change' => 0,
                ],
            ];

            // Tab specific data
            $tabData = [];

            if ($tab === 'overview') {
                $tabData['revenue_chart'] = $this->getRevenueChartData($startDate, $endDate);
                $tabData['destination_share'] = $this->getDestinationShare($startDate, $endDate);
            } elseif ($tab === 'bookings') {
                $tabData['bookings_by_status'] = $this->getBookingsByStatus($startDate, $endDate);
                $tabData['top_packages'] = $this->getTopPackages($startDate, $endDate);
                $tabData['departures_chart'] = $this->getDeparturesChartData($startDate, $endDate);
            } elseif ($tab === 'finance') {
                $tabData['receivables_aging'] = $this->getReceivablesAging();
                $tabData['payment_methods'] = $this->getPaymentMethods($startDate, $endDate);
                $tabData['outstanding_balances'] = $this->getOutstandingBalances();
            } elseif ($tab === 'leads') {
                $tabData['funnel'] = []; // Returns empty array to trigger EmptyState
            }

            return [
                'kpis' => $kpis,
                'tabData' => $tabData,
                'dates' => [
                    'start' => $startDate->format('Y-m-d'),
                    'end' => $endDate->format('Y-m-d'),
                ]
            ];
        });

        return Inertia::render('Reports/Index', [
            'kpis' => $data['kpis'],
            'tabData' => Inertia::defer(fn() => $data['tabData']), // defer so we can load tabs dynamically if needed
            'activeTab' => $tab,
            'dateRange' => $range,
            'compare' => $compare,
            'dates' => $data['dates']
        ]);
    }

    private function getDateRanges($range)
    {
        $now = Carbon::now();
        $start = $now->copy()->startOfMonth();
        $end = $now->copy()->endOfMonth();

        switch ($range) {
            case 'today':
                $start = $now->copy()->startOfDay();
                $end = $now->copy()->endOfDay();
                break;
            case '7_days':
                $start = $now->copy()->subDays(6)->startOfDay();
                $end = $now->copy()->endOfDay();
                break;
            case 'this_month':
                $start = $now->copy()->startOfMonth();
                $end = $now->copy()->endOfMonth();
                break;
            case 'last_month':
                $start = $now->copy()->subMonth()->startOfMonth();
                $end = $now->copy()->subMonth()->endOfMonth();
                break;
            case 'this_year':
                $start = $now->copy()->startOfYear();
                $end = $now->copy()->endOfYear();
                break;
            // custom not fully handled in basic switch, default to this month
        }

        $diffInDays = $start->diffInDays($end);
        $compareStart = $start->copy()->subDays($diffInDays + 1);
        $compareEnd = $end->copy()->subDays($diffInDays + 1);

        return [$start, $end, $compareStart, $compareEnd];
    }

    private function calculatePercentageChange($oldValue, $newValue)
    {
        if ($oldValue == 0) {
            return $newValue > 0 ? 100 : 0;
        }
        return round((($newValue - $oldValue) / $oldValue) * 100, 1);
    }

    private function getRevenueChartData($start, $end)
    {
        // Simple daily grouping for demo
        $data = DB::table('bookings')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(final_amount) as revenue'), DB::raw('COUNT(*) as bookings'))
            ->whereBetween('created_at', [$start, $end])
            ->whereNotIn('booking_status', ['cancelled', 'draft'])
            ->groupBy('date')
            ->orderBy('date')
            ->get();
            
        // Map to expected recharts format
        return $data->map(function ($item) {
            return [
                'name' => Carbon::parse($item->date)->format('M d'),
                'revenue' => (float) $item->revenue,
                'bookings' => (int) $item->bookings,
            ];
        });
    }

    private function getDestinationShare($start, $end)
    {
        $data = DB::table('bookings')
            ->join('tour_packages', 'bookings.tour_package_id', '=', 'tour_packages.id')
            ->join('destinations', 'tour_packages.destination_id', '=', 'destinations.id')
            ->select('destinations.country as name', DB::raw('COUNT(*) as value'))
            ->whereBetween('bookings.created_at', [$start, $end])
            ->whereNotIn('bookings.booking_status', ['cancelled', 'draft'])
            ->groupBy('destinations.country')
            ->get();
            
        return $data;
    }

    private function getBookingsByStatus($start, $end)
    {
        return DB::table('bookings')
            ->select('booking_status as name', DB::raw('COUNT(*) as value'))
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('booking_status')
            ->get();
    }

    private function getTopPackages($start, $end)
    {
        return DB::table('bookings')
            ->join('tour_packages', 'bookings.tour_package_id', '=', 'tour_packages.id')
            ->select('tour_packages.package_name as name', DB::raw('COUNT(bookings.id) as total_bookings'), DB::raw('SUM(bookings.final_amount) as revenue'))
            ->whereBetween('bookings.created_at', [$start, $end])
            ->whereNotIn('bookings.booking_status', ['cancelled', 'draft'])
            ->groupBy('tour_packages.id', 'tour_packages.package_name')
            ->orderByDesc('total_bookings')
            ->limit(5)
            ->get();
    }

    private function getDeparturesChartData($start, $end)
    {
        $driver = DB::connection()->getDriverName();
        $dateFormatter = $driver === 'sqlite' ? "strftime('%Y-%m', travel_date)" : 'DATE_FORMAT(travel_date, "%Y-%m")';

        $data = DB::table('bookings')
            ->select(DB::raw($dateFormatter . ' as month'), DB::raw('COUNT(*) as departures'))
            ->whereNotNull('travel_date')
            ->whereNotIn('booking_status', ['cancelled', 'draft'])
            ->groupBy('month')
            ->orderBy('month')
            ->limit(12)
            ->get();
            
        return $data->map(function ($item) {
            return [
                'name' => Carbon::parse($item->month . '-01')->format('M Y'),
                'departures' => (int) $item->departures,
            ];
        });
    }

    private function getReceivablesAging()
    {
        // Calculate aging based on travel date
        // 0-30 days, 31-60 days, 61-90 days, 90+ days
        $now = Carbon::now();
        
        $bookings = Booking::where('balance_amount', '>', 0)
            ->whereNotIn('booking_status', ['cancelled', 'draft'])
            ->get();
            
        $aging = [
            '0_30' => 0,
            '31_60' => 0,
            '61_90' => 0,
            '90_plus' => 0,
        ];
        
        foreach ($bookings as $booking) {
            if (!$booking->travel_date) continue;
            
            $daysPastDue = $now->diffInDays($booking->travel_date, false);
            
            // If daysPastDue is negative, it's not due yet. We'll group them in 0-30 for this basic report
            if ($daysPastDue < 0) {
                $daysPastDue = 0;
            }
            
            if ($daysPastDue <= 30) {
                $aging['0_30'] += $booking->balance_amount;
            } elseif ($daysPastDue <= 60) {
                $aging['31_60'] += $booking->balance_amount;
            } elseif ($daysPastDue <= 90) {
                $aging['61_90'] += $booking->balance_amount;
            } else {
                $aging['90_plus'] += $booking->balance_amount;
            }
        }
        
        return [
            ['name' => '0-30 Days', 'value' => $aging['0_30']],
            ['name' => '31-60 Days', 'value' => $aging['31_60']],
            ['name' => '61-90 Days', 'value' => $aging['61_90']],
            ['name' => '90+ Days', 'value' => $aging['90_plus']],
        ];
    }

    private function getPaymentMethods($start, $end)
    {
        return DB::table('payments')
            ->select('payment_method as name', DB::raw('SUM(amount) as value'))
            ->whereBetween('created_at', [$start, $end])
            ->where('status', 'completed')
            ->groupBy('payment_method')
            ->get();
    }

    private function getOutstandingBalances()
    {
        return Booking::with('customer')
            ->where('balance_amount', '>', 0)
            ->whereNotIn('booking_status', ['cancelled', 'draft'])
            ->orderBy('travel_date', 'asc')
            ->limit(20)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'reference' => $booking->booking_reference,
                    'customer_name' => $booking->customer ? $booking->customer->first_name . ' ' . $booking->customer->last_name : 'Unknown',
                    'total_amount' => $booking->final_amount,
                    'paid_amount' => $booking->paid_amount,
                    'balance_amount' => $booking->balance_amount,
                    'due_date' => $booking->travel_date ? $booking->travel_date->format('Y-m-d') : null,
                ];
            });
    }
}
