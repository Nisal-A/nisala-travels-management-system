<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Models\Payment;
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
     *
     * Role-aware ordering:
     * - Finance: payment-focused tiles first
     * - Staff/Sales: leads-focused tiles first
     * - SuperAdmin/Manager: all tiles
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $viewData = [];

        // Office Dashboard Data
        if ($user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Staff->value, UserRole::Finance->value])) {
            
            // Cache the heavy queries for 60 seconds, keyed by user's primary role
            $viewData['officeStats'] = Inertia::defer(fn() => Cache::remember(
                'dashboard_stats_' . $user->id,
                60,
                fn() => $this->buildOfficeStats($user)
            ));
        }

        // Customer Portal Data
        if ($user->hasRole(UserRole::Customer->value)) {
            $customerId = $user->customer?->id;
            $viewData['customerStats'] = [
                'myBookings' => $customerId ? Booking::where('customer_id', $customerId)->count() : null,
                'myDocuments' => $customerId ? CustomerDocument::where('customer_id', $customerId)->count() : null,
                'myPayments' => $customerId ? Payment::where('customer_id', $customerId)->count() : null,
            ];
        }

        return Inertia::render('Dashboard', $viewData);
    }

    /**
     * Build the office stats array based on the user's role.
     * All heavy queries are enclosed in this method for caching.
     */
    private function buildOfficeStats($user): array
    {
        $data = [];
        $now = Carbon::now();

        $canSeeBookings = $user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Staff->value]);
        $canSeePayments = $user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Finance->value]);
        $canSeeDocs = $user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Staff->value]);
        $canSeeLeads = $user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Staff->value]);

        // ── KPI Tiles ──────────────────────────────────────────────

        if ($canSeeBookings) {
            // Today's bookings vs yesterday
            $todayBookings = Booking::whereDate('created_at', Carbon::today())->count();
            $yesterdayBookings = Booking::whereDate('created_at', Carbon::yesterday())->count();
            $data['todaysBookings'] = [
                'count' => $todayBookings,
                'trend' => $todayBookings >= $yesterdayBookings ? 'up' : 'down',
                'diff' => abs($todayBookings - $yesterdayBookings),
            ];
        }

        if ($canSeePayments) {
            // Pending payments (Balance > 0)
            $pendingCount = Booking::where('balance_amount', '>', 0)->count();
            $pendingTotal = Booking::where('balance_amount', '>', 0)->sum('balance_amount');
            
            // Compare with previous 7-day payment collection
            $paymentsThisWeek = Payment::whereBetween('created_at', [$now->copy()->subDays(7), $now])->sum('amount');
            $paymentsLastWeek = Payment::whereBetween('created_at', [$now->copy()->subDays(14), $now->copy()->subDays(7)])->sum('amount');

            $data['pendingPayments'] = [
                'count' => $pendingCount,
                'total' => (float) $pendingTotal,
                'trend' => $paymentsThisWeek >= $paymentsLastWeek ? 'up' : 'down',
                'diff' => abs((float) $paymentsThisWeek - (float) $paymentsLastWeek),
            ];
        }

        if ($canSeeDocs) {
            // Documents expiring (within 30 days) or awaiting verification
            $expiringDocs = CustomerDocument::where('expiry_date', '<', $now->copy()->addDays(30))
                ->where('expiry_date', '>=', $now)
                ->count();
            $pendingVerification = CustomerDocument::where('verification_status', 'Pending')->count();
            $prevPendingDocs = CustomerDocument::where('verification_status', 'Pending')
                ->where('created_at', '<', $now->copy()->subDays(7))
                ->count();
            $totalDocActions = $expiringDocs + $pendingVerification;
            
            $data['pendingDocuments'] = [
                'count' => $totalDocActions,
                'expiring' => $expiringDocs,
                'pendingVerification' => $pendingVerification,
                'trend' => $totalDocActions <= $prevPendingDocs ? 'up' : 'down',
                'diff' => abs($totalDocActions - $prevPendingDocs),
            ];
        }

        if ($canSeeLeads) {
            // New leads (customers created in last 7 days) vs previous 7 days
            $leadsThisWeek = Customer::where('created_at', '>=', $now->copy()->subDays(7))->count();
            $leadsLastWeek = Customer::whereBetween('created_at', [$now->copy()->subDays(14), $now->copy()->subDays(7)])->count();
            $data['newLeads'] = [
                'count' => $leadsThisWeek,
                'trend' => $leadsThisWeek >= $leadsLastWeek ? 'up' : 'down',
                'diff' => abs($leadsThisWeek - $leadsLastWeek),
            ];
        }

        // ── Role ordering ──────────────────────────────────────────
        $data['tileOrder'] = $this->getTileOrder($user);

        // ── Recent Activity Feed (last 15 events) ──────────────────
        $activities = collect();

        if ($canSeeBookings) {
            $recentBookings = Booking::with('customer:id,full_name')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($b) => [
                    'id' => 'booking_' . $b->id,
                    'type' => 'new_booking',
                    'title' => 'New booking created for ' . ($b->customer->full_name ?? 'Unknown'),
                    'time' => $b->created_at->diffForHumans(),
                    'created_at' => $b->created_at,
                    'link' => '/bookings/' . $b->id,
                ]);
            $activities = $activities->merge($recentBookings);
        }

        if ($canSeePayments) {
            $recentPayments = Payment::with('customer:id,full_name')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($p) => [
                    'id' => 'payment_' . $p->id,
                    'type' => 'payment_received',
                    'title' => 'Payment of LKR ' . number_format((float)$p->amount, 2) . ' received from ' . ($p->customer->full_name ?? 'Unknown'),
                    'time' => $p->created_at->diffForHumans(),
                    'created_at' => $p->created_at,
                    'link' => '/payments',
                ]);
            $activities = $activities->merge($recentPayments);
        }

        if ($canSeeDocs) {
            $recentDocs = CustomerDocument::with('customer:id,full_name')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($d) => [
                    'id' => 'doc_' . $d->id,
                    'type' => 'document_uploaded',
                    'title' => 'Document uploaded by ' . ($d->customer->full_name ?? 'Unknown'),
                    'time' => $d->created_at->diffForHumans(),
                    'created_at' => $d->created_at,
                    'link' => '/documents',
                ]);
            $activities = $activities->merge($recentDocs);
        }

        if ($canSeeLeads) {
            $recentLeads = Customer::latest()
                ->take(5)
                ->get()
                ->map(fn($c) => [
                    'id' => 'lead_' . $c->id,
                    'type' => 'lead_submitted',
                    'title' => 'New lead: ' . $c->full_name,
                    'time' => $c->created_at->diffForHumans(),
                    'created_at' => $c->created_at,
                    'link' => '/customers/' . $c->id,
                ]);
            $activities = $activities->merge($recentLeads);
        }

        $data['recentActivity'] = $activities
            ->sortByDesc('created_at')
            ->take(15)
            ->values()
            ->toArray();

        // ── Tasks Due Panel ─────────────────────────────────────────
        $tasks = collect();

        if ($canSeePayments || $canSeeBookings) {
            // Upcoming balance due dates (travel within 30-45 days, balance > 0)
            $upcomingBalances = Booking::with('customer:id,full_name')
                ->where('balance_amount', '>', 0)
                ->whereNotNull('travel_date')
                ->orderBy('travel_date')
                ->take(5)
                ->get()
                ->map(fn($b) => [
                    'id' => 'task_bal_' . $b->id,
                    'title' => 'Collect balance LKR ' . number_format((float) $b->balance_amount, 2) . ' from ' . ($b->customer->full_name ?? 'Unknown'),
                    'due' => Carbon::parse($b->travel_date)->subDays(30)->diffForHumans(),
                    'due_date' => Carbon::parse($b->travel_date)->subDays(30)->toDateString(),
                    'is_overdue' => Carbon::parse($b->travel_date)->subDays(30)->isPast(),
                    'type' => 'payment',
                    'link' => '/bookings/' . $b->id,
                ]);
            $tasks = $tasks->merge($upcomingBalances);
        }

        if ($canSeeDocs) {
            // Visa deadlines (expiring in next 30 days)
            $visaDeadlines = CustomerDocument::with('customer:id,full_name')
                ->whereHas('documentType', fn($q) => $q->where('name', 'like', '%Visa%'))
                ->whereBetween('expiry_date', [$now, $now->copy()->addDays(30)])
                ->orWhere(function ($q) use ($now) {
                    $q->whereHas('documentType', fn($sub) => $sub->where('name', 'like', '%Visa%'))
                      ->where('expiry_date', '<', $now);
                })
                ->take(5)
                ->get()
                ->map(fn($d) => [
                    'id' => 'task_visa_' . $d->id,
                    'title' => 'Visa expiring for ' . ($d->customer->full_name ?? 'Unknown'),
                    'due' => Carbon::parse($d->expiry_date)->diffForHumans(),
                    'due_date' => Carbon::parse($d->expiry_date)->toDateString(),
                    'is_overdue' => Carbon::parse($d->expiry_date)->isPast(),
                    'type' => 'document',
                    'link' => '/documents',
                ]);
            $tasks = $tasks->merge($visaDeadlines);

            // Documents pending verification (follow-ups due today)
            $pendingDocs = CustomerDocument::with('customer:id,full_name')
                ->where('verification_status', 'Pending')
                ->where('created_at', '<=', $now->copy()->subDays(2))
                ->orderBy('created_at')
                ->take(3)
                ->get()
                ->map(fn($d) => [
                    'id' => 'task_verify_' . $d->id,
                    'title' => 'Verify document for ' . ($d->customer->full_name ?? 'Unknown'),
                    'due' => $d->created_at->diffForHumans(),
                    'due_date' => $d->created_at->toDateString(),
                    'is_overdue' => true,
                    'type' => 'follow_up',
                    'link' => '/documents',
                ]);
            $tasks = $tasks->merge($pendingDocs);
        }

        // Sort tasks by overdue first, then by due_date
        $data['tasks'] = $tasks
            ->sortByDesc('is_overdue')
            ->sortBy('due_date')
            ->take(10)
            ->values()
            ->toArray();

        return $data;
    }

    /**
     * Determine the tile ordering based on user role.
     * Finance sees payment tiles first; Sales/Staff sees leads first.
     */
    private function getTileOrder($user): array
    {
        if ($user->hasRole(UserRole::Finance->value)) {
            return ['pendingPayments', 'todaysBookings', 'pendingDocuments', 'newLeads'];
        }

        if ($user->hasAnyRole([UserRole::Staff->value])) {
            return ['newLeads', 'todaysBookings', 'pendingDocuments', 'pendingPayments'];
        }

        // SuperAdmin, Manager — balanced
        return ['todaysBookings', 'pendingPayments', 'newLeads', 'pendingDocuments'];
    }
}
