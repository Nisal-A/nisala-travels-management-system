<?php

namespace App\Reports\Financial;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Enums\RefundStatus;
use App\Enums\SupplierType;
use App\Models\Destination;
use App\Models\TourPackage;
use App\Reports\BaseReport;
use Brick\Math\BigDecimal;
use Brick\Math\RoundingMode;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Tour Profitability Report
 *
 * Financial analysis of tour departures comparing booked revenue against supplier costs.
 * Implements RPT-11 requirements with strict decimal calculations (Brick\Math\BigDecimal).
 */
class TourProfitabilityReport extends BaseReport
{
    public function key(): string
    {
        return 'tour-profitability';
    }

    public function title(): string
    {
        return 'Tour Profitability';
    }

    public function description(): string
    {
        return 'Analyze tour departure financial performance, comparing booked revenue against actual supplier costs with margin and traveler profit metrics.';
    }

    public function category(): string
    {
        return 'financial';
    }

    public function permission(): string
    {
        return 'reports.tour-profitability';
    }

    /**
     * Filter definitions for UI rendering.
     */
    public function filters(): array
    {
        $destinationOptions = [['value' => '', 'label' => 'All Destinations']];
        try {
            $destinations = Destination::select('id', 'country', 'city_region')
                ->orderBy('country')
                ->get();
            foreach ($destinations as $dest) {
                $label = $dest->city_region ? "{$dest->city_region}, {$dest->country}" : $dest->country;
                $destinationOptions[] = [
                    'value' => (string) $dest->id,
                    'label' => $label,
                ];
            }
        } catch (\Throwable) {
            // Ignore if DB not ready
        }

        $tierOptions = [['value' => '', 'label' => 'All Tiers']];
        $tiersConfig = config('tour_tiers.tiers', []);
        foreach ($tiersConfig as $key => $tier) {
            $tierOptions[] = [
                'value' => $key,
                'label' => $tier['label'] ?? ucfirst($key),
            ];
        }

        return [
            [
                'name' => 'date_range',
                'label' => 'Departure Date',
                'type' => 'date_range',
            ],
            [
                'name' => 'destination_id',
                'label' => 'Destination',
                'type' => 'select',
                'options' => $destinationOptions,
            ],
            [
                'name' => 'tier',
                'label' => 'Tier',
                'type' => 'select',
                'options' => $tierOptions,
            ],
            [
                'name' => 'status',
                'label' => 'Status',
                'type' => 'select',
                'options' => [
                    ['value' => '', 'label' => 'All Statuses'],
                    ['value' => 'active', 'label' => 'Active'],
                    ['value' => 'draft', 'label' => 'Draft'],
                    ['value' => 'archived', 'label' => 'Archived'],
                ],
            ],
            [
                'name' => 'only_with_costs',
                'label' => 'Costs Filter',
                'type' => 'select',
                'options' => [
                    ['value' => '', 'label' => 'All Packages'],
                    ['value' => '1', 'label' => 'Only with Costs'],
                    ['value' => '0', 'label' => 'Missing Costs'],
                ],
            ],
            [
                'name' => 'search',
                'label' => 'Search',
                'type' => 'text',
                'placeholder' => 'Search package or destination...',
            ],
        ];
    }

    /**
     * Column definitions for the DataTable.
     */
    public function columns(): array
    {
        return [
            [
                'key' => 'package_name',
                'label' => 'Tour Package',
                'sortable' => true,
                'align' => 'left',
            ],
            [
                'key' => 'destination',
                'label' => 'Destination',
                'sortable' => false,
                'align' => 'left',
            ],
            [
                'key' => 'start_date',
                'label' => 'Departure',
                'sortable' => true,
                'align' => 'left',
                'format' => 'date',
            ],
            [
                'key' => 'travelers',
                'label' => 'Travelers',
                'sortable' => false,
                'align' => 'right',
                'format' => 'number',
            ],
            [
                'key' => 'booked_revenue',
                'label' => 'Booked Revenue',
                'sortable' => false,
                'align' => 'right',
                'format' => 'money',
                'currency' => 'LKR',
            ],
            [
                'key' => 'collected',
                'label' => 'Collected',
                'sortable' => false,
                'align' => 'right',
                'format' => 'money',
                'currency' => 'LKR',
            ],
            [
                'key' => 'total_cost',
                'label' => 'Cost (LKR)',
                'sortable' => false,
                'align' => 'right',
                'format' => 'money',
                'currency' => 'LKR',
            ],
            [
                'key' => 'cost_breakdown',
                'label' => 'Cost by Category',
                'sortable' => false,
                'align' => 'left',
                'format' => 'text',
            ],
            [
                'key' => 'profit',
                'label' => 'Profit (LKR)',
                'sortable' => false,
                'align' => 'right',
                'format' => 'money',
                'currency' => 'LKR',
            ],
            [
                'key' => 'margin_percent',
                'label' => 'Margin',
                'sortable' => false,
                'align' => 'right',
                'format' => 'text',
            ],
            [
                'key' => 'profit_per_traveler',
                'label' => 'Profit / Traveler',
                'sortable' => false,
                'align' => 'right',
                'format' => 'money',
                'currency' => 'LKR',
            ],
        ];
    }

    /**
     * Build the filtered query with eager loading to prevent N+1 queries.
     */
    protected function buildQuery(array $filters)
    {
        $query = TourPackage::query()
            ->with([
                'destination:id,country,city_region',
                'bookings' => function ($q) {
                    $q->where('booking_status', '!=', BookingStatus::Cancelled->value)
                        ->with([
                            'payments' => function ($pq) {
                                $pq->where('status', '!=', PaymentStatus::Failed->value);
                            },
                            'refunds' => function ($rq) {
                                $rq->where('status', RefundStatus::Paid->value);
                            },
                        ]);
                },
                'costLines',
            ]);

        // Date range filter
        $dateFrom = $filters['date_from'] ?? $filters['start_date_from'] ?? null;
        $dateTo = $filters['date_to'] ?? $filters['start_date_to'] ?? null;

        if (! empty($dateFrom)) {
            $query->whereDate('start_date', '>=', $dateFrom);
        }

        if (! empty($dateTo)) {
            $query->whereDate('start_date', '<=', $dateTo);
        }

        // Destination filter
        $destId = $filters['destination_id'] ?? $filters['destination'] ?? null;
        if (! empty($destId)) {
            $query->where('destination_id', $destId);
        }

        // Tier filter
        if (! empty($filters['tier'])) {
            $query->where('tier', $filters['tier']);
        }

        // Status filter
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Only with costs filter
        if (isset($filters['only_with_costs']) && $filters['only_with_costs'] !== '') {
            $owc = strtolower((string) $filters['only_with_costs']);
            if (in_array($owc, ['1', 'true', 'yes', 'with_costs'], true)) {
                $query->has('costLines');
            } elseif (in_array($owc, ['0', 'false', 'no', 'without_costs'], true)) {
                $query->doesntHave('costLines');
            }
        }

        // Search filter
        if (! empty($filters['search'])) {
            $term = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($term) {
                $q->where('package_name', 'like', $term)
                    ->orWhereHas('destination', function ($dq) use ($term) {
                        $dq->where('country', 'like', $term)
                            ->orWhere('city_region', 'like', $term);
                    });
            });
        }

        return $query;
    }

    /**
     * Get the query builder instance with sorting applied.
     */
    public function queryBuilder(array $filters)
    {
        $query = $this->buildQuery($filters);

        $sortField = $filters['sort'] ?? 'start_date';
        $direction = strtolower($filters['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        $allowedSorts = [
            'package_name',
            'start_date',
            'end_date',
            'status',
            'tier',
            'created_at',
        ];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $direction);
        } else {
            $query->orderBy('start_date', 'asc');
        }

        return $query;
    }

    /**
     * Transform a single TourPackage record into a report table row array.
     */
    public function transformRow(mixed $record): array
    {
        /** @var TourPackage $package */
        $package = $record;

        $startDate = $package->start_date instanceof Carbon
            ? $package->start_date
            : ($package->start_date ? Carbon::parse($package->start_date) : null);

        $endDate = $package->end_date instanceof Carbon
            ? $package->end_date
            : ($package->end_date ? Carbon::parse($package->end_date) : null);

        $destName = $package->destination
            ? ($package->destination->city_region ? "{$package->destination->city_region}, {$package->destination->country}" : $package->destination->country)
            : '—';

        // 1. Booked revenue (LKR): sum of final_amount of non-cancelled bookings times exchange_rate_to_lkr (rounded per booking)
        // 2. Collected (LKR): sum of payments amount_lkr minus paid refunds for those bookings
        // 3. Travelers: from non-cancelled bookings
        $packageRevenue = BigDecimal::zero();
        $packageCollected = BigDecimal::zero();
        $travelersCount = 0;

        foreach ($package->bookings as $booking) {
            $isCancelled = $booking->booking_status === BookingStatus::Cancelled
                || $booking->booking_status === 'cancelled'
                || (is_object($booking->booking_status) && $booking->booking_status->value === 'cancelled');

            if ($isCancelled) {
                continue;
            }

            // Travelers from non-cancelled bookings
            $travelersCount += (int) ($booking->number_of_travelers ?: ($booking->travelers?->count() ?: 1));

            // Revenue calculation rounded per booking
            $finalAmount = (string) ($booking->final_amount ?? '0.00');
            $exchangeRate = (string) ($booking->exchange_rate_to_lkr ?: '1');
            $bookingRevenue = BigDecimal::of($finalAmount)
                ->multipliedBy(BigDecimal::of($exchangeRate))
                ->toScale(2, RoundingMode::HALF_UP);

            $packageRevenue = $packageRevenue->plus($bookingRevenue);

            // Payments (excluding soft-deleted and failed/voided)
            foreach ($booking->payments as $payment) {
                if ($payment->trashed()) {
                    continue;
                }

                $isFailed = $payment->status === PaymentStatus::Failed
                    || $payment->status === 'failed'
                    || $payment->status === 'voided'
                    || (is_object($payment->status) && $payment->status->value === 'failed');

                if ($isFailed) {
                    continue;
                }

                if ($payment->amount_lkr !== null && $payment->amount_lkr !== '') {
                    $paymentLkr = BigDecimal::of((string) $payment->amount_lkr)->toScale(2, RoundingMode::HALF_UP);
                } else {
                    $rate = (string) ($payment->exchange_rate_to_lkr ?: '1');
                    $paymentLkr = BigDecimal::of((string) $payment->amount)
                        ->multipliedBy(BigDecimal::of($rate))
                        ->toScale(2, RoundingMode::HALF_UP);
                }

                $packageCollected = $packageCollected->plus($paymentLkr);
            }

            // Refunds (only paid refunds)
            foreach ($booking->refunds as $refund) {
                if ($refund->trashed()) {
                    continue;
                }

                $isPaid = $refund->status === RefundStatus::Paid
                    || $refund->status === 'paid'
                    || (is_object($refund->status) && $refund->status->value === 'paid');

                if (! $isPaid) {
                    continue;
                }

                if ($refund->amount_lkr !== null && $refund->amount_lkr !== '') {
                    $refundLkr = BigDecimal::of((string) $refund->amount_lkr)->toScale(2, RoundingMode::HALF_UP);
                } else {
                    $rate = (string) ($refund->exchange_rate_to_lkr ?: '1');
                    $refundLkr = BigDecimal::of((string) $refund->amount)
                        ->multipliedBy(BigDecimal::of($rate))
                        ->toScale(2, RoundingMode::HALF_UP);
                }

                $packageCollected = $packageCollected->minus($refundLkr);
            }
        }

        $packageRevenue = $packageRevenue->toScale(2, RoundingMode::HALF_UP);
        $packageCollected = $packageCollected->toScale(2, RoundingMode::HALF_UP);

        // 4. Cost (LKR): sum of the package's cost lines amount_lkr; also show cost by category
        $hasCostLines = $package->costLines->isNotEmpty();
        $packageCost = BigDecimal::zero();
        $costsByCategory = [];
        foreach (SupplierType::cases() as $type) {
            $costsByCategory[$type->value] = BigDecimal::zero();
        }

        foreach ($package->costLines as $costLine) {
            if ($costLine->amount_lkr !== null && $costLine->amount_lkr !== '') {
                $costLkr = BigDecimal::of((string) $costLine->amount_lkr)->toScale(2, RoundingMode::HALF_UP);
            } else {
                $rate = (string) ($costLine->exchange_rate_to_lkr ?: '1');
                $costLkr = BigDecimal::of((string) $costLine->amount)
                    ->multipliedBy(BigDecimal::of($rate))
                    ->toScale(2, RoundingMode::HALF_UP);
            }

            $packageCost = $packageCost->plus($costLkr);

            $cat = $costLine->category instanceof SupplierType
                ? $costLine->category->value
                : (string) $costLine->category;

            if (! isset($costsByCategory[$cat])) {
                $costsByCategory[$cat] = BigDecimal::zero();
            }
            $costsByCategory[$cat] = $costsByCategory[$cat]->plus($costLkr);
        }

        $packageCost = $packageCost->toScale(2, RoundingMode::HALF_UP);

        // Build human-readable cost breakdown string
        if ($hasCostLines) {
            $breakdownParts = [];
            foreach ($costsByCategory as $catKey => $catAmount) {
                if ($catAmount->isGreaterThan(BigDecimal::zero())) {
                    $supplierType = SupplierType::tryFrom($catKey);
                    $label = $supplierType ? $supplierType->label() : ucfirst($catKey);
                    $breakdownParts[] = "{$label}: " . number_format((float) (string) $catAmount, 2);
                }
            }
            $costBreakdown = ! empty($breakdownParts) ? implode(' | ', $breakdownParts) : '0.00';
        } else {
            $costBreakdown = 'Costs not entered';
        }

        // 5. Profit, Margin %, Profit per Traveler
        // If a package has no cost lines, show "Costs not entered" instead of a profit figure
        if ($hasCostLines) {
            $profit = $packageRevenue->minus($packageCost)->toScale(2, RoundingMode::HALF_UP);
            $profitStr = (string) $profit;

            if ($packageRevenue->isGreaterThan(BigDecimal::zero())) {
                $marginPercent = $profit->multipliedBy(BigDecimal::of(100))
                    ->dividedBy($packageRevenue, 2, RoundingMode::HALF_UP)
                    ->toScale(2, RoundingMode::HALF_UP);
                $marginPercentStr = (string) $marginPercent . '%';
                $marginValueStr = (string) $marginPercent;
            } else {
                $marginPercent = BigDecimal::zero()->toScale(2);
                $marginPercentStr = '0.00%';
                $marginValueStr = '0.00';
            }

            if ($travelersCount > 0) {
                $profitPerTraveler = $profit->dividedBy(BigDecimal::of($travelersCount), 2, RoundingMode::HALF_UP)
                    ->toScale(2, RoundingMode::HALF_UP);
                $profitPerTravelerStr = (string) $profitPerTraveler;
            } else {
                $profitPerTraveler = BigDecimal::zero()->toScale(2);
                $profitPerTravelerStr = '0.00';
            }
        } else {
            $profitStr = 'Costs not entered';
            $marginPercentStr = 'Costs not entered';
            $marginValueStr = 'Costs not entered';
            $profitPerTravelerStr = 'Costs not entered';
        }

        return [
            'id' => $package->id,
            'package_name' => $package->package_name,
            'destination' => $destName,
            'start_date' => $startDate?->format('Y-m-d') ?? '—',
            'end_date' => $endDate?->format('Y-m-d') ?? '—',
            'tier' => $package->tier_label ?? ucfirst((string) $package->tier),
            'status' => $package->status,
            'travelers' => $travelersCount,
            'booked_travelers' => $travelersCount,
            'booked_revenue' => (string) $packageRevenue,
            'booked_revenue_lkr' => (string) $packageRevenue,
            'collected' => (string) $packageCollected,
            'collected_lkr' => (string) $packageCollected,
            'total_cost' => (string) $packageCost,
            'cost_lkr' => (string) $packageCost,
            'has_costs' => $hasCostLines,
            'has_cost_lines' => $hasCostLines,
            'cost_breakdown' => $costBreakdown,
            'cost_hotel' => (string) ($costsByCategory['hotel'] ?? '0.00'),
            'cost_transport' => (string) ($costsByCategory['transport'] ?? '0.00'),
            'cost_guide' => (string) ($costsByCategory['guide'] ?? '0.00'),
            'cost_air_ticket' => (string) ($costsByCategory['air_ticket'] ?? '0.00'),
            'cost_food' => (string) ($costsByCategory['food'] ?? '0.00'),
            'cost_other' => (string) ($costsByCategory['other'] ?? '0.00'),
            'costs_by_category' => array_map(fn ($v) => (string) $v, $costsByCategory),
            'profit' => $profitStr,
            'profit_lkr' => $profitStr,
            'margin_percent' => $marginPercentStr,
            'margin' => $marginValueStr,
            'margin_value' => $marginValueStr,
            'profit_per_traveler' => $profitPerTravelerStr,
        ];
    }

    /**
     * Execute the query for the report table with pagination.
     */
    public function query(array $filters): LengthAwarePaginator
    {
        $query = $this->queryBuilder($filters);

        $perPage = (int) ($filters['per_page'] ?? 15);
        $paginator = $query->paginate(max(1, min($perPage, 100)));

        $paginator->through(fn ($package) => $this->transformRow($package));

        return $paginator;
    }

    /**
     * Calculate summary metric tiles for Tour Profitability using server-side decimal math.
     * Excludes packages missing cost lines from profit total.
     */
    public function summary(array $filters): array
    {
        $query = $this->buildQuery($filters);
        $packages = (clone $query)->get();

        $totalRevenue = BigDecimal::zero();
        $totalCost = BigDecimal::zero();
        $totalProfit = BigDecimal::zero();
        $totalRevenueWithCosts = BigDecimal::zero();
        $packagesMissingCosts = 0;

        foreach ($packages as $pkg) {
            $hasCostLines = $pkg->costLines->isNotEmpty();

            // Calculate booked revenue for this package (non-cancelled bookings)
            $pkgRevenue = BigDecimal::zero();
            foreach ($pkg->bookings as $booking) {
                $isCancelled = $booking->booking_status === BookingStatus::Cancelled
                    || $booking->booking_status === 'cancelled'
                    || (is_object($booking->booking_status) && $booking->booking_status->value === 'cancelled');

                if ($isCancelled) {
                    continue;
                }

                $rate = (string) ($booking->exchange_rate_to_lkr ?: '1');
                $amt = (string) ($booking->final_amount ?? '0.00');
                $bRev = BigDecimal::of($amt)->multipliedBy(BigDecimal::of($rate))->toScale(2, RoundingMode::HALF_UP);
                $pkgRevenue = $pkgRevenue->plus($bRev);
            }

            $totalRevenue = $totalRevenue->plus($pkgRevenue);

            if (! $hasCostLines) {
                $packagesMissingCosts++;
                // Exclude from profit total!
            } else {
                $pkgCost = BigDecimal::zero();
                foreach ($pkg->costLines as $costLine) {
                    $costLkr = $costLine->amount_lkr !== null && $costLine->amount_lkr !== ''
                        ? BigDecimal::of((string) $costLine->amount_lkr)->toScale(2, RoundingMode::HALF_UP)
                        : BigDecimal::of((string) $costLine->amount)->multipliedBy(BigDecimal::of((string) ($costLine->exchange_rate_to_lkr ?: '1')))->toScale(2, RoundingMode::HALF_UP);
                    $pkgCost = $pkgCost->plus($costLkr);
                }

                $pkgProfit = $pkgRevenue->minus($pkgCost)->toScale(2, RoundingMode::HALF_UP);
                $totalCost = $totalCost->plus($pkgCost);
                $totalProfit = $totalProfit->plus($pkgProfit);
                $totalRevenueWithCosts = $totalRevenueWithCosts->plus($pkgRevenue);
            }
        }

        // Average margin percent across packages with costs
        if ($totalRevenueWithCosts->isGreaterThan(BigDecimal::zero())) {
            $averageMargin = $totalProfit->multipliedBy(BigDecimal::of(100))
                ->dividedBy($totalRevenueWithCosts, 2, RoundingMode::HALF_UP)
                ->toScale(2, RoundingMode::HALF_UP);
        } else {
            $averageMargin = BigDecimal::zero()->toScale(2);
        }

        return [
            [
                'key' => 'total_revenue',
                'label' => 'Total Revenue',
                'value' => (string) $totalRevenue->toScale(2, RoundingMode::HALF_UP),
                'format' => 'money',
                'currency' => 'LKR',
            ],
            [
                'key' => 'total_cost',
                'label' => 'Total Cost',
                'value' => (string) $totalCost->toScale(2, RoundingMode::HALF_UP),
                'format' => 'money',
                'currency' => 'LKR',
            ],
            [
                'key' => 'total_profit',
                'label' => 'Total Profit',
                'value' => (string) $totalProfit->toScale(2, RoundingMode::HALF_UP),
                'format' => 'money',
                'currency' => 'LKR',
            ],
            [
                'key' => 'average_margin',
                'label' => 'Average Margin',
                'value' => (string) $averageMargin,
                'format' => 'percentage',
            ],
            [
                'key' => 'packages_missing_costs',
                'label' => 'Missing Costs',
                'value' => $packagesMissingCosts,
                'format' => 'number',
                'helpText' => 'Packages with no cost lines entered (excluded from profit total)',
            ],
        ];
    }
}
