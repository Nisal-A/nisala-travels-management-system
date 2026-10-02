<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     * The stats sent to the frontend are strictly filtered based on the user's role.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $viewData = [];

        // Office Dashboard Data
        if ($user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Staff->value, UserRole::Finance->value])) {
            
            // Cache the heavy queries for 60 seconds
            $viewData['officeStats'] = Inertia::defer(fn() => Cache::remember('dashboard_stats_' . $user->id, 60, function () use ($user) {
                $data = [];
                
                if ($user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Staff->value])) {
                    // Today's bookings vs Yesterday
                    $todayBookings = Booking::whereDate('created_at', Carbon::today())->count();
                    $yesterdayBookings = Booking::whereDate('created_at', Carbon::yesterday())->count();
                    $data['todaysBookings'] = [
                        'count' => $todayBookings,
                        'trend' => $todayBookings >= $yesterdayBookings ? 'up' : 'down',
                        'diff' => abs($todayBookings - $yesterdayBookings)
                    ];

                    // Documents expiring or awaiting verification
                    $data['pendingDocuments'] = CustomerDocument::where('verification_status', 'Pending')
                        ->orWhere('expiry_date', '<', Carbon::now()->addDays(30))
                        ->count();

                    // New leads (last 7 days)
                    $data['newLeads'] = Customer::where('created_at', '>=', Carbon::now()->subDays(7))->count();
                }

                if ($user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Finance->value])) {
                    // Pending payments (Balance > 0)
                    $pendingPaymentsBookings = Booking::where('balance_amount', '>', 0)->get();
                    $data['pendingPayments'] = [
                        'count' => $pendingPaymentsBookings->count(),
                        'total' => $pendingPaymentsBookings->sum('balance_amount')
                    ];
                }
                
                // Fetch recent activity (Mocking from latest created models)
                $recentBookings = Booking::with('customer:id,full_name')->latest()->take(5)->get()->map(fn($b) => [
                    'id' => 'booking_' . $b->id,
                    'type' => 'new_booking',
                    'title' => 'New booking created for ' . ($b->customer->full_name ?? 'Unknown'),
                    'time' => $b->created_at->diffForHumans(),
                    'created_at' => $b->created_at,
                ]);

                $recentPayments = Payment::with('customer:id,full_name')->latest()->take(5)->get()->map(fn($p) => [
                    'id' => 'payment_' . $p->id,
                    'type' => 'payment_received',
                    'title' => 'Payment of LKR ' . number_format((float)$p->amount, 2) . ' received from ' . ($p->customer->full_name ?? 'Unknown'),
                    'time' => $p->created_at->diffForHumans(),
                    'created_at' => $p->created_at,
                ]);

                $recentDocs = CustomerDocument::with('customer:id,full_name')->latest()->take(5)->get()->map(fn($d) => [
                    'id' => 'doc_' . $d->id,
                    'type' => 'document_uploaded',
                    'title' => 'Document uploaded by ' . ($d->customer->full_name ?? 'Unknown'),
                    'time' => $d->created_at->diffForHumans(),
                    'created_at' => $d->created_at,
                ]);

                $activities = collect([...$recentBookings, ...$recentPayments, ...$recentDocs])
                    ->sortByDesc('created_at')
                    ->take(15)
                    ->values()
                    ->toArray();

                $data['recentActivity'] = $activities;

                // Tasks Due
                $tasks = [];
                
                // Upcoming balances (due within next 7 days, assuming due 30 days before travel)
                $upcomingBalances = Booking::with('customer:id,full_name')
                    ->where('balance_amount', '>', 0)
                    ->whereBetween('travel_date', [Carbon::now()->addDays(23), Carbon::now()->addDays(30)])
                    ->take(5)
                    ->get()
                    ->map(fn($b) => [
                        'id' => 'task_bal_' . $b->id,
                        'title' => 'Collect balance from ' . ($b->customer->full_name ?? 'Unknown'),
                        'due' => Carbon::parse($b->travel_date)->subDays(30)->diffForHumans(),
                        'is_overdue' => Carbon::parse($b->travel_date)->subDays(30)->isPast(),
                        'type' => 'payment'
                    ]);
                
                // Visa deadlines (expiring in next 30 days)
                $visaDeadlines = CustomerDocument::with('customer:id,full_name')
                    ->where('document_type_id', 2) // Assuming 2 is visa
                    ->whereBetween('expiry_date', [Carbon::now(), Carbon::now()->addDays(30)])
                    ->take(5)
                    ->get()
                    ->map(fn($d) => [
                        'id' => 'task_visa_' . $d->id,
                        'title' => 'Visa expiring for ' . ($d->customer->full_name ?? 'Unknown'),
                        'due' => Carbon::parse($d->expiry_date)->diffForHumans(),
                        'is_overdue' => Carbon::parse($d->expiry_date)->isPast(),
                        'type' => 'document'
                    ]);

                $data['tasks'] = collect([...$upcomingBalances, ...$visaDeadlines])->take(10)->toArray();

                return $data;
            }));
        }

        // Customer Portal Data
        if ($user->hasRole(UserRole::Customer->value)) {
            $viewData['customerStats'] = [
                'myBookings' => null,
                'myDocuments' => null,
                'myPayments' => null,
            ];
        }

        return Inertia::render('Dashboard', $viewData);
    }
}
