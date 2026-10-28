<?php

namespace App\Reports\Operational;

use App\Enums\BookingStatus;
use App\Models\Destination;
use App\Models\TourPackage;
use App\Reports\BaseReport;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Passenger Count Report
 *
 * Operational report providing passenger counts broken down by TravelerType (adult, child, infant),
 * grouped by package, travel date, destination, or month, and flagging discrepancies between traveler
 * records and bookings.number_of_travelers.
 */
class PassengerCountReport extends BaseReport
{
    public function key(): string
    {
        return 'passenger-count';
    }

    public function title(): string
    {
        return 'Passenger Count';
    }

    public function description(): string
    {
        return 'Passenger counts by traveler type grouped by package, travel date, destination, or month with booking reconciliation.';
    }

    public function category(): string
    {
        return 'operational';
    }

    public function permission(): string
    {
        return 'reports.passenger-count';
    }

    /**
     * Filter definitions for the report UI.
     */
    public function filters(): array
    {
        $packageOptions = [['value' => '', 'label' => 'All Packages']];
        try {
            $packages = TourPackage::select('id', 'package_name')
                ->orderBy('package_name')
                ->get();
            foreach ($packages as $pkg) {
                $packageOptions[] = [
                    'value' => (string) $pkg->id,
                    'label' => $pkg->package_name,
                ];
            }
        } catch (\Throwable) {
            // Ignore if DB not ready
        }

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

        return [
            [
                'name' => 'group_by',
                'label' => 'Group By',
                'type' => 'select',
                'default' => 'package',
                'options' => [
                    ['value' => 'package', 'label' => 'Package'],
                    ['value' => 'travel_date', 'label' => 'Travel Date'],
                    ['value' => 'destination', 'label' => 'Destination'],
                    ['value' => 'month', 'label' => 'Month'],
                ],
            ],
            [
                'name' => 'date_range',
                'label' => 'Travel Date',
                'type' => 'date_range',
            ],
            [
                'name' => 'tour_package_id',
                'label' => 'Package',
                'type' => 'select',
                'options' => $packageOptions,
            ],
            [
                'name' => 'destination_id',
                'label' => 'Destination',
                'type' => 'select',
                'options' => $destinationOptions,
            ],
            [
                'name' => 'booking_status',
                'label' => 'Booking Status',
                'type' => 'select',
                'options' => [
                    ['value' => '', 'label' => 'All (Non-Cancelled)'],
                    ['value' => BookingStatus::Pending->value, 'label' => 'Pending'],
                    ['value' => BookingStatus::Confirmed->value, 'label' => 'Confirmed'],
                    ['value' => BookingStatus::Completed->value, 'label' => 'Completed'],
                ],
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
                'key' => 'group_label',
                'label' => 'Group',
                'sortable' => true,
                'align' => 'left',
            ],
            [
                'key' => 'adults',
                'label' => 'Adults',
                'sortable' => true,
                'align' => 'right',
                'format' => 'number',
            ],
            [
                'key' => 'children',
                'label' => 'Children',
                'sortable' => true,
                'align' => 'right',
                'format' => 'number',
            ],
            [
                'key' => 'infants',
                'label' => 'Infants',
                'sortable' => true,
                'align' => 'right',
                'format' => 'number',
            ],
            [
                'key' => 'total',
                'label' => 'Total',
                'sortable' => true,
                'align' => 'right',
                'format' => 'number',
            ],
            [
                'key' => 'bookings_count',
                'label' => 'Bookings Count',
                'sortable' => true,
                'align' => 'right',
                'format' => 'number',
            ],
            [
                'key' => 'reconciliation',
                'label' => 'Reconciliation',
                'sortable' => false,
                'align' => 'center',
                'format' => 'badge',
            ],
        ];
    }

    /**
     * Build the aggregated query based on group_by and filters.
     */
    protected function buildQuery(array $filters)
    {
        $groupBy = $filters['group_by'] ?? 'package';
        if (! in_array($groupBy, ['package', 'travel_date', 'destination', 'month'], true)) {
            $groupBy = 'package';
        }

        // Subquery aggregating traveler counts per booking to prevent row duplication
        $travelersSubquery = DB::table('booking_travelers')
            ->select('booking_id')
            ->selectRaw("SUM(CASE WHEN traveler_type = 'adult' THEN 1 ELSE 0 END) as adult_count")
            ->selectRaw("SUM(CASE WHEN traveler_type = 'child' THEN 1 ELSE 0 END) as child_count")
            ->selectRaw("SUM(CASE WHEN traveler_type = 'infant' THEN 1 ELSE 0 END) as infant_count")
            ->selectRaw('COUNT(*) as traveler_records_count')
            ->groupBy('booking_id');

        $query = DB::table('bookings')
            ->join('tour_packages', 'bookings.tour_package_id', '=', 'tour_packages.id')
            ->join('destinations', 'tour_packages.destination_id', '=', 'destinations.id')
            ->leftJoinSub($travelersSubquery, 'bt', function ($join) {
                $join->on('bookings.id', '=', 'bt.booking_id');
            })
            ->whereNull('bookings.deleted_at');

        // Booking status filter
        if (! empty($filters['booking_status'])) {
            $query->where('bookings.booking_status', $filters['booking_status']);
        } else {
            // Source: booking_travelers joined to non-cancelled bookings
            $query->where('bookings.booking_status', '!=', BookingStatus::Cancelled->value);
        }

        // Date range filters
        $dateFrom = $filters['travel_date_from'] ?? $filters['date_from'] ?? null;
        $dateTo = $filters['travel_date_to'] ?? $filters['date_to'] ?? null;

        if (! empty($dateFrom)) {
            $query->whereDate('bookings.travel_date', '>=', $dateFrom);
        }
        if (! empty($dateTo)) {
            $query->whereDate('bookings.travel_date', '<=', $dateTo);
        }

        // Tour package filter
        if (! empty($filters['tour_package_id'])) {
            $query->where('bookings.tour_package_id', $filters['tour_package_id']);
        }

        // Destination filter
        if (! empty($filters['destination_id'])) {
            $query->where('tour_packages.destination_id', $filters['destination_id']);
        }

        // Group by column selection
        switch ($groupBy) {
            case 'travel_date':
                $query->select(
                    DB::raw('DATE(bookings.travel_date) as group_key'),
                    DB::raw('DATE(bookings.travel_date) as group_label')
                )->groupBy(DB::raw('DATE(bookings.travel_date)'));
                break;

            case 'destination':
                $query->select(
                    'destinations.id as group_key',
                    'destinations.country',
                    'destinations.city_region',
                    DB::raw("CASE WHEN destinations.city_region IS NOT NULL AND destinations.city_region != '' THEN destinations.city_region || ', ' || destinations.country ELSE destinations.country END as group_label")
                )->groupBy('destinations.id', 'destinations.country', 'destinations.city_region');
                break;

            case 'month':
                $query->select(
                    DB::raw('SUBSTR(bookings.travel_date, 1, 7) as group_key'),
                    DB::raw('SUBSTR(bookings.travel_date, 1, 7) as group_label')
                )->groupBy(DB::raw('SUBSTR(bookings.travel_date, 1, 7)'));
                break;

            case 'package':
            default:
                $query->select(
                    'tour_packages.id as group_key',
                    'tour_packages.package_name as group_label'
                )->groupBy('tour_packages.id', 'tour_packages.package_name');
                break;
        }

        // Common aggregate calculations
        $query->selectRaw('COALESCE(SUM(bt.adult_count), 0) as adults')
            ->selectRaw('COALESCE(SUM(bt.child_count), 0) as children')
            ->selectRaw('COALESCE(SUM(bt.infant_count), 0) as infants')
            ->selectRaw('COALESCE(SUM(bt.traveler_records_count), 0) as total_travelers')
            ->selectRaw('COUNT(DISTINCT bookings.id) as bookings_count')
            ->selectRaw('COALESCE(SUM(bookings.number_of_travelers), 0) as expected_travelers');

        return $query;
    }

    /**
     * Get the query builder instance with sorting applied.
     */
    public function queryBuilder(array $filters)
    {
        $query = $this->buildQuery($filters);

        $sortField = $filters['sort'] ?? 'group_label';
        $direction = strtolower($filters['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        $allowedSorts = [
            'group_label',
            'adults',
            'children',
            'infants',
            'total',
            'total_travelers',
            'bookings_count',
        ];

        if (in_array($sortField, $allowedSorts, true)) {
            $mappedSort = $sortField === 'total' ? 'total_travelers' : $sortField;
            $query->orderBy($mappedSort, $direction);
        } else {
            $query->orderBy('group_label', 'asc');
        }

        return $query;
    }

    /**
     * Transform a single aggregated database record into report table row array.
     */
    public function transformRow(mixed $record): array
    {
        $rec = (object) $record;

        $adults = (int) ($rec->adults ?? 0);
        $children = (int) ($rec->children ?? 0);
        $infants = (int) ($rec->infants ?? 0);
        $total = (int) ($rec->total_travelers ?? ($adults + $children + $infants));
        $bookingsCount = (int) ($rec->bookings_count ?? 0);
        $expectedTravelers = (int) ($rec->expected_travelers ?? 0);

        $hasDiscrepancy = ($total !== $expectedTravelers);
        $reconciliation = $hasDiscrepancy
            ? "Mismatch ({$total} vs {$expectedTravelers})"
            : 'Matched';

        $groupLabel = (string) ($rec->group_label ?? '—');
        if (preg_match('/^\d{4}-\d{2}-\d{2}/', $groupLabel) && strlen($groupLabel) > 10) {
            $groupLabel = substr($groupLabel, 0, 10);
        }
        // If grouped by destination with separate fields fallback
        if (isset($rec->country) && (empty($groupLabel) || $groupLabel === '—')) {
            $groupLabel = ! empty($rec->city_region) ? "{$rec->city_region}, {$rec->country}" : $rec->country;
        }

        return [
            'group_label' => $groupLabel,
            'adults' => $adults,
            'children' => $children,
            'infants' => $infants,
            'total' => $total,
            'bookings_count' => $bookingsCount,
            'expected_travelers' => $expectedTravelers,
            'has_discrepancy' => $hasDiscrepancy,
            'has_mismatch' => $hasDiscrepancy,
            'is_flagged' => $hasDiscrepancy,
            'reconciliation' => $reconciliation,
        ];
    }

    /**
     * Execute the query for the report table with pagination.
     */
    public function query(array $filters): LengthAwarePaginator
    {
        $query = $this->queryBuilder($filters);

        $perPage = (int) ($filters['per_page'] ?? 15);
        $page = (int) ($filters['page'] ?? 1);

        // Grouped query total rows count via subquery
        $total = DB::query()->fromSub(clone $query, 'sub_total')->count();

        $items = (clone $query)
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get()
            ->map(fn ($r) => $this->transformRow($r));

        return new \Illuminate\Pagination\LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );
    }

    /**
     * Calculate summary metric tiles for Passenger Count.
     */
    public function summary(array $filters): array
    {
        $query = $this->buildQuery($filters);
        $records = $query->get();

        $totalAdults = 0;
        $totalChildren = 0;
        $totalInfants = 0;
        $totalTravelers = 0;
        $totalBookings = 0;
        $discrepancyCount = 0;

        foreach ($records as $r) {
            $adults = (int) ($r->adults ?? 0);
            $children = (int) ($r->children ?? 0);
            $infants = (int) ($r->infants ?? 0);
            $total = (int) ($r->total_travelers ?? ($adults + $children + $infants));
            $expected = (int) ($r->expected_travelers ?? 0);

            $totalAdults += $adults;
            $totalChildren += $children;
            $totalInfants += $infants;
            $totalTravelers += $total;
            $totalBookings += (int) ($r->bookings_count ?? 0);

            if ($total !== $expected) {
                $discrepancyCount++;
            }
        }

        return [
            [
                'key' => 'total_passengers',
                'label' => 'Total Passengers',
                'value' => $totalTravelers,
                'format' => 'number',
                'helpText' => 'Total traveler records across filtered bookings',
            ],
            [
                'key' => 'adults_count',
                'label' => 'Adults',
                'value' => $totalAdults,
                'format' => 'number',
            ],
            [
                'key' => 'children_count',
                'label' => 'Children',
                'value' => $totalChildren,
                'format' => 'number',
            ],
            [
                'key' => 'infants_count',
                'label' => 'Infants',
                'value' => $totalInfants,
                'format' => 'number',
            ],
            [
                'key' => 'total_bookings',
                'label' => 'Total Bookings',
                'value' => $totalBookings,
                'format' => 'number',
                'helpText' => 'Total distinct non-cancelled bookings',
            ],
            [
                'key' => 'discrepancies',
                'label' => 'Discrepancy Groups',
                'value' => $discrepancyCount,
                'format' => 'number',
                'helpText' => 'Groups where traveler records differ from bookings count',
            ],
        ];
    }
}
