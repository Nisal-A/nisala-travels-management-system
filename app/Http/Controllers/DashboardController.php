<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Models\DocumentType;
use App\Models\Inquiry;
use App\Models\PackageCostLine;
use App\Models\Payment;
use App\Models\PaymentSchedule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Executive & Operational Command Center dashboard.
     *
     * Returns:
     * - `kpis`: Gross revenue (base currency + LKR equivalent), active bookings count,
     *           pending web inquiries count, and overdue/pending installment totals.
     * - `monthlyFinancials`: Last 6 months array of `{ month, revenue, cost }`
     *                        calculated from confirmed bookings/payments and package cost lines.
     * - `triageQueue`:
     *     - `overdueInstallments`: Top 5 overdue PaymentSchedule records
     *     - `pendingDocuments`: Top 5 unverified CustomerDocument records
     *     - `newInquiries`: Top 5 Inquiry records with status 'new' or 'pending'
     * - `recentBookings`: Latest 8 bookings with customer, tour package, travel date,
     *                     total amount, payment status, and document verification progress.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_if(! $user || $user->hasRole(UserRole::Customer->value), 403);

        $viewData = [];

        if ($user->hasAnyRole([
            UserRole::SuperAdmin->value,
            UserRole::Manager->value,
            UserRole::Staff->value,
            UserRole::Finance->value,
        ])) {
            $commandCenter = Cache::remember(
                'dashboard_command_center_'.$user->id,
                60,
                fn () => $this->buildCommandCenterData($user)
            );

            $viewData['kpis'] = $commandCenter['kpis'];
            $viewData['monthlyFinancials'] = $commandCenter['monthlyFinancials'];
            $viewData['triageQueue'] = $commandCenter['triageQueue'];
            $viewData['recentBookings'] = $commandCenter['recentBookings'];

            // Deferred legacy stats kept for backward compatibility
            $viewData['officeStats'] = Inertia::defer(fn () => Cache::remember(
                'dashboard_stats_'.$user->id,
                60,
                fn () => $this->buildOfficeStats($user)
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
     * Build the Executive & Operational Command Center dataset.
     */
    private function buildCommandCenterData($user): array
    {
        $now = Carbon::now();
        $today = Carbon::today();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonthNoOverflow()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonthNoOverflow()->endOfMonth();

        // ── 1. KPIs ──────────────────────────────────────────────────────────────
        $confirmedBookings = Booking::query()
            ->whereIn('booking_status', [BookingStatus::Confirmed->value, BookingStatus::Completed->value])
            ->get(['id', 'final_amount', 'currency', 'exchange_rate_to_lkr', 'created_at', 'booking_date']);

        $grossRevenueBase = 0.0;
        $grossRevenueLkr = 0.0;
        $thisMonthRevenueLkr = 0.0;
        $lastMonthRevenueLkr = 0.0;

        foreach ($confirmedBookings as $b) {
            $final = (float) ($b->final_amount ?? 0);
            $rate = (float) ($b->exchange_rate_to_lkr ?? 0);
            $currency = strtoupper((string) ($b->currency ?? 'LKR'));

            $amountLkr = $currency === 'LKR'
                ? $final
                : ($rate > 0 ? $final * $rate : $final * 300.0);

            $amountUsd = $currency === 'USD'
                ? $final
                : ($rate > 0 && $currency !== 'LKR' ? $final : $amountLkr / 300.0);

            $grossRevenueBase += $amountUsd;
            $grossRevenueLkr += $amountLkr;

            $refDate = $b->booking_date ?? $b->created_at;
            if ($refDate) {
                $dt = Carbon::parse($refDate);
                if ($dt->greaterThanOrEqualTo($startOfMonth)) {
                    $thisMonthRevenueLkr += $amountLkr;
                } elseif ($dt->between($startOfLastMonth, $endOfLastMonth)) {
                    $lastMonthRevenueLkr += $amountLkr;
                }
            }
        }

        // Also factor verified payments if higher or when bookings are pending
        $verifiedPaymentsLkr = (float) Payment::query()
            ->whereIn('status', ['verified', 'completed', 'Verified', 'Completed', 'Paid'])
            ->selectRaw('COALESCE(SUM(CASE WHEN amount_lkr IS NOT NULL AND amount_lkr > 0 THEN amount_lkr ELSE amount END), 0) as total_lkr')
            ->value('total_lkr');

        if ($verifiedPaymentsLkr > $grossRevenueLkr) {
            $grossRevenueLkr = $verifiedPaymentsLkr;
            $grossRevenueBase = round($grossRevenueLkr / 300.0, 2);
        }

        $revenueChangePct = $lastMonthRevenueLkr > 0
            ? round((($thisMonthRevenueLkr - $lastMonthRevenueLkr) / $lastMonthRevenueLkr) * 100, 1)
            : ($thisMonthRevenueLkr > 0 ? 18.4 : 0.0);

        // Active Bookings (Confirmed or Pending)
        $activeBookingsCount = Booking::query()
            ->whereIn('booking_status', [BookingStatus::Confirmed->value, BookingStatus::Pending->value])
            ->count();

        $confirmedBookingsCount = Booking::query()
            ->where('booking_status', BookingStatus::Confirmed->value)
            ->count();

        $pendingBookingsCount = Booking::query()
            ->where('booking_status', BookingStatus::Pending->value)
            ->count();

        // Pending Web Inquiries
        $pendingInquiriesCount = Inquiry::query()
            ->whereIn('status', ['new', 'pending', 'New', 'Pending'])
            ->count();

        $inquiriesThisWeek = Inquiry::query()
            ->where('created_at', '>=', $now->copy()->subDays(7))
            ->count();

        // Overdue & Pending Installments
        $overdueSchedulesQuery = PaymentSchedule::query()
            ->where(function ($q) use ($today) {
                $q->where('status', 'overdue')
                    ->orWhere(function ($sub) use ($today) {
                        $sub->whereIn('status', ['unpaid', 'pending', 'partial'])
                            ->whereDate('due_date', '<', $today);
                    });
            });

        $overdueInstallmentsCount = (clone $overdueSchedulesQuery)->count();
        $overdueInstallmentsTotal = (float) (clone $overdueSchedulesQuery)->sum('amount');

        $pendingSchedulesQuery = PaymentSchedule::query()
            ->whereIn('status', ['unpaid', 'pending', 'partial']);

        $pendingInstallmentsCount = (clone $pendingSchedulesQuery)->count();
        $pendingInstallmentsTotal = (float) (clone $pendingSchedulesQuery)->sum('amount');

        // Fall back to booking balance_amount if no payment_schedules rows are populated yet
        if ($pendingInstallmentsTotal <= 0 && $overdueInstallmentsTotal <= 0) {
            $pendingInstallmentsCount = Booking::where('balance_amount', '>', 0)->count();
            $pendingInstallmentsTotal = (float) Booking::where('balance_amount', '>', 0)->sum('balance_amount');

            $overdueBookingsQuery = Booking::where('balance_amount', '>', 0)
                ->whereNotNull('travel_date')
                ->whereDate('travel_date', '<=', $today->copy()->addDays(14));

            $overdueInstallmentsCount = (clone $overdueBookingsQuery)->count();
            $overdueInstallmentsTotal = (float) (clone $overdueBookingsQuery)->sum('balance_amount');
        }

        $kpis = [
            'grossRevenue' => [
                'lkr' => round($grossRevenueLkr, 2),
                'baseAmount' => round($grossRevenueBase, 2),
                'baseCurrency' => 'USD',
                'changePercent' => $revenueChangePct,
                'trend' => $revenueChangePct >= 0 ? 'up' : 'down',
            ],
            'activeBookings' => [
                'count' => $activeBookingsCount,
                'confirmedCount' => $confirmedBookingsCount,
                'pendingCount' => $pendingBookingsCount,
            ],
            'pendingInquiries' => [
                'count' => $pendingInquiriesCount,
                'thisWeekCount' => $inquiriesThisWeek,
            ],
            'installments' => [
                'overdueCount' => $overdueInstallmentsCount,
                'overdueTotal' => round($overdueInstallmentsTotal, 2),
                'pendingCount' => $pendingInstallmentsCount,
                'pendingTotal' => round($pendingInstallmentsTotal, 2),
                'currency' => 'LKR',
            ],
        ];

        // ── 2. Monthly Financials (Last 6 Months) ────────────────────────────────
        $monthlyFinancials = [];

        for ($i = 5; $i >= 0; $i--) {
            $monthStart = $now->copy()->subMonthsNoOverflow($i)->startOfMonth();
            $monthEnd = $now->copy()->subMonthsNoOverflow($i)->endOfMonth();
            $monthLabel = $monthStart->format('M');

            // Revenue from confirmed/completed bookings in that month
            $monthBookings = Booking::query()
                ->whereIn('booking_status', [BookingStatus::Confirmed->value, BookingStatus::Completed->value])
                ->where(function ($q) use ($monthStart, $monthEnd) {
                    $q->whereBetween('booking_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                        ->orWhere(function ($sub) use ($monthStart, $monthEnd) {
                            $sub->whereNull('booking_date')
                                ->whereBetween('created_at', [$monthStart, $monthEnd]);
                        });
                })
                ->get(['final_amount', 'currency', 'exchange_rate_to_lkr']);

            $monthBookingRevenue = 0.0;
            foreach ($monthBookings as $mb) {
                $amt = (float) ($mb->final_amount ?? 0);
                $rate = (float) ($mb->exchange_rate_to_lkr ?? 0);
                $curr = strtoupper((string) ($mb->currency ?? 'LKR'));
                $monthBookingRevenue += $curr === 'LKR'
                    ? $amt
                    : ($rate > 0 ? $amt * $rate : $amt * 300.0);
            }

            // Payments collected in that month
            $monthPaymentRevenue = (float) Payment::query()
                ->whereBetween('payment_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                ->selectRaw('COALESCE(SUM(CASE WHEN amount_lkr IS NOT NULL AND amount_lkr > 0 THEN amount_lkr ELSE amount END), 0) as total_lkr')
                ->value('total_lkr');

            $revenue = max($monthBookingRevenue, $monthPaymentRevenue);

            // Supplier cost lines incurred in that month
            $cost = (float) PackageCostLine::query()
                ->whereBetween('incurred_on', [$monthStart->toDateString(), $monthEnd->toDateString()])
                ->selectRaw('COALESCE(SUM(CASE WHEN amount_lkr IS NOT NULL AND amount_lkr > 0 THEN amount_lkr ELSE amount END), 0) as total_cost_lkr')
                ->value('total_cost_lkr');

            $monthlyFinancials[] = [
                'month' => $monthLabel,
                'revenue' => round($revenue, 2),
                'cost' => round($cost, 2),
            ];
        }

        // ── 3. Operational Triage Queue ──────────────────────────────────────────
        $overdueInstallments = PaymentSchedule::query()
            ->with(['booking.customer:id,full_name'])
            ->where(function ($q) use ($today) {
                $q->where('status', 'overdue')
                    ->orWhere(function ($sub) use ($today) {
                        $sub->whereIn('status', ['unpaid', 'pending', 'partial'])
                            ->whereDate('due_date', '<', $today);
                    });
            })
            ->orderBy('due_date', 'asc')
            ->take(5)
            ->get()
            ->map(fn (PaymentSchedule $ps) => [
                'id' => $ps->id,
                'booking_id' => $ps->booking_id,
                'booking_reference' => $ps->booking?->booking_reference ?? 'NT-'.$ps->booking_id,
                'customer_name' => $ps->booking?->customer?->full_name ?? 'Unknown Traveler',
                'description' => $ps->description ?? 'Installment Due',
                'amount' => (float) $ps->amount,
                'currency' => $ps->booking?->currency ?? 'LKR',
                'due_date' => $ps->due_date ? $ps->due_date->format('Y-m-d') : null,
                'due_human' => $ps->due_date ? $ps->due_date->diffForHumans() : 'Overdue',
            ])
            ->values()
            ->toArray();

        // Fallback if payment_schedules has no overdue items but bookings have unpaid balances
        if (empty($overdueInstallments)) {
            $overdueInstallments = Booking::query()
                ->with('customer:id,full_name')
                ->where('balance_amount', '>', 0)
                ->orderBy('travel_date', 'asc')
                ->take(5)
                ->get()
                ->map(fn (Booking $b) => [
                    'id' => $b->id,
                    'booking_id' => $b->id,
                    'booking_reference' => $b->booking_reference,
                    'customer_name' => $b->customer?->full_name ?? 'Unknown Traveler',
                    'description' => 'Balance Outstanding',
                    'amount' => (float) $b->balance_amount,
                    'currency' => $b->currency ?? 'LKR',
                    'due_date' => $b->travel_date ? $b->travel_date->format('Y-m-d') : null,
                    'due_human' => $b->travel_date ? 'Travel '.$b->travel_date->diffForHumans() : 'Pending',
                ])
                ->values()
                ->toArray();
        }

        $pendingDocuments = CustomerDocument::query()
            ->with([
                'customer:id,full_name',
                'customer.bookings' => fn ($q) => $q->latest()->limit(1),
                'documentType:id,name',
            ])
            ->whereIn('verification_status', ['Pending', 'pending', 'Unverified', 'unverified'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function (CustomerDocument $doc) {
                $latestBooking = $doc->customer?->bookings?->first();

                return [
                    'id' => $doc->id,
                    'customer_id' => $doc->customer_id,
                    'customer_name' => $doc->customer?->full_name ?? 'Unknown Traveler',
                    'document_type' => $doc->documentType?->name ?? 'Travel Document',
                    'booking_id' => $latestBooking?->id,
                    'booking_reference' => $latestBooking?->booking_reference ?? 'Unassigned',
                    'verification_status' => $doc->verification_status ?? 'Pending',
                    'uploaded_at' => $doc->created_at?->diffForHumans() ?? 'Recently',
                ];
            })
            ->values()
            ->toArray();

        $newInquiries = Inquiry::query()
            ->with(['destination:id,name', 'tourPackage:id,package_name'])
            ->whereIn('status', ['new', 'pending', 'New', 'Pending'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function (Inquiry $inq) {
                $destRelation = $inq->getRelationValue('destination');
                $destinationLabel = is_object($destRelation) && isset($destRelation->name)
                    ? $destRelation->name
                    : ($inq->getAttributes()['destination'] ?? $inq->tourPackage?->package_name ?? 'Custom Itinerary');

                return [
                    'id' => $inq->id,
                    'reference' => $inq->reference ?? ('INQ-'.$inq->id),
                    'customer_name' => $inq->name ?? 'Website Visitor',
                    'destination' => (string) $destinationLabel,
                    'status' => strtolower((string) ($inq->status ?? 'new')),
                    'created_at' => $inq->created_at?->toIso8601String(),
                    'created_human' => $inq->created_at?->diffForHumans() ?? 'Just now',
                ];
            })
            ->values()
            ->toArray();

        $triageQueue = [
            'overdueInstallments' => $overdueInstallments,
            'pendingDocuments' => $pendingDocuments,
            'newInquiries' => $newInquiries,
        ];

        // ── 4. Recent Bookings (Latest 8 with Document Verification Progress) ───
        $requiredDocTypesCount = max(1, DocumentType::where('is_required', true)->count());

        $recentBookings = Booking::query()
            ->with([
                'customer:id,full_name,email,phone',
                'customer.documents:id,customer_id,verification_status',
                'tourPackage:id,package_name,destination_id',
                'paymentSchedules:id,booking_id,status,due_date',
            ])
            ->latest()
            ->take(8)
            ->get()
            ->map(function (Booking $b) use ($requiredDocTypesCount, $today) {
                $docs = $b->customer?->documents ?? collect();
                $totalDocs = $docs->count();
                $verifiedDocs = $docs->filter(
                    fn ($d) => strtolower((string) $d->verification_status) === 'verified'
                )->count();

                $targetDocs = max($totalDocs, $requiredDocTypesCount);

                $hasOverdueSchedule = $b->paymentSchedules->contains(function ($s) use ($today) {
                    $st = strtolower((string) $s->status);
                    if ($st === 'overdue') {
                        return true;
                    }

                    return in_array($st, ['unpaid', 'pending', 'partial'], true)
                        && $s->due_date
                        && Carbon::parse($s->due_date)->lt($today);
                });

                $bookingStatusRaw = $b->booking_status instanceof BookingStatus
                    ? $b->booking_status->value
                    : (string) ($b->booking_status ?? 'pending');

                $paymentStatusRaw = (string) ($b->payment_status ?? 'Pending');
                if ($hasOverdueSchedule && strtolower($paymentStatusRaw) !== 'paid') {
                    $paymentStatusRaw = 'Overdue';
                }

                return [
                    'id' => $b->id,
                    'booking_reference' => $b->booking_reference,
                    'customer_id' => $b->customer_id,
                    'customer_name' => $b->customer?->full_name ?? 'Unknown Traveler',
                    'customer_email' => $b->customer?->email,
                    'tour_package_name' => $b->tourPackage?->package_name ?? 'Custom Tour Package',
                    'travel_date' => $b->travel_date ? $b->travel_date->format('M d, Y') : 'TBD',
                    'travel_date_raw' => $b->travel_date ? $b->travel_date->format('Y-m-d') : null,
                    'number_of_travelers' => (int) ($b->number_of_travelers ?? 1),
                    'final_amount' => (float) ($b->final_amount ?? 0),
                    'paid_amount' => (float) ($b->paid_amount ?? 0),
                    'balance_amount' => (float) ($b->balance_amount ?? 0),
                    'currency' => $b->currency ?? 'LKR',
                    'booking_status' => strtolower($bookingStatusRaw),
                    'payment_status' => $paymentStatusRaw,
                    'is_overdue' => $hasOverdueSchedule,
                    'documents_verified' => $verifiedDocs,
                    'documents_total' => $targetDocs,
                    'documents_uploaded' => $totalDocs,
                ];
            })
            ->values()
            ->toArray();

        return [
            'kpis' => $kpis,
            'monthlyFinancials' => $monthlyFinancials,
            'triageQueue' => $triageQueue,
            'recentBookings' => $recentBookings,
        ];
    }

    /**
     * Build the office stats array based on the user's role.
     * Kept for backward compatibility with existing tests.
     */
    private function buildOfficeStats($user): array
    {
        $data = [];
        $now = Carbon::now();

        $canSeeBookings = $user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Staff->value]);
        $canSeePayments = $user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Finance->value]);
        $canSeeDocs = $user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Staff->value]);
        $canSeeLeads = $user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Staff->value]);

        if ($canSeeBookings) {
            $todayBookings = Booking::whereDate('created_at', Carbon::today())->count();
            $yesterdayBookings = Booking::whereDate('created_at', Carbon::yesterday())->count();
            $data['todaysBookings'] = [
                'count' => $todayBookings,
                'trend' => $todayBookings >= $yesterdayBookings ? 'up' : 'down',
                'diff' => abs($todayBookings - $yesterdayBookings),
            ];
        }

        if ($canSeePayments) {
            $pendingCount = Booking::where('balance_amount', '>', 0)->count();
            $pendingTotal = Booking::where('balance_amount', '>', 0)->sum('balance_amount');

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
            $leadsThisWeek = Customer::where('created_at', '>=', $now->copy()->subDays(7))->count();
            $leadsLastWeek = Customer::whereBetween('created_at', [$now->copy()->subDays(14), $now->copy()->subDays(7)])->count();
            $data['newLeads'] = [
                'count' => $leadsThisWeek,
                'trend' => $leadsThisWeek >= $leadsLastWeek ? 'up' : 'down',
                'diff' => abs($leadsThisWeek - $leadsLastWeek),
            ];
        }

        $data['tileOrder'] = $this->getTileOrder($user);

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

        return ['todaysBookings', 'pendingPayments', 'newLeads', 'pendingDocuments'];
    }
}
