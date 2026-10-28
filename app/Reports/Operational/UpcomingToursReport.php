<?php

namespace App\Reports\Operational;

use App\Enums\BookingStatus;
use App\Models\Destination;
use App\Models\TourPackage;
use App\Reports\BaseReport;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Upcoming Tours Report
 *
 * Overview of upcoming active tour departures with booked travelers, seat availability,
 * and confirmation counts.
 * Implements RPT-05 requirements with threshold badges and zero N+1 eager loading.
 */
class UpcomingToursReport extends BaseReport
{
    public function key(): string
    {
        return 'upcoming-tours';
    }

    public function title(): string
    {
        return 'Upcoming Tours';
    }

    public function description(): string
    {
        return 'Overview of upcoming active tour departures with booked travelers, seat availability, and confirmation counts.';
    }

    public function category(): string
    {
        return 'operational';
    }

    public function permission(): string
    {
        return 'reports.upcoming-tours';
    }

    /**
     * Filter definitions for the report UI.
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
                'default' => 'active',
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
     * Columns matching RPT-05 specification.
     */
    public function columns(): array
    {
        return [
            [
                'key' => 'package_name',
                'label' => 'Tour Package',
                'sortable' => true,
            ],
            [
                'key' => 'destination',
                'label' => 'Destination',
                'sortable' => false,
            ],
            [
                'key' => 'start_date',
                'label' => 'Start Date',
                'sortable' => true,
                'format' => 'date',
            ],
            [
                'key' => 'end_date',
                'label' => 'End Date',
                'sortable' => true,
                'format' => 'date',
            ],
            [
                'key' => 'duration_days',
                'label' => 'Duration (Days)',
                'sortable' => true,
                'format' => 'number',
                'align' => 'right',
            ],
            [
                'key' => 'capacity',
                'label' => 'Capacity',
                'sortable' => true,
                'format' => 'number',
                'align' => 'right',
            ],
            [
                'key' => 'booked_travelers',
                'label' => 'Booked Travelers',
                'sortable' => false,
                'format' => 'number',
                'align' => 'right',
            ],
            [
                'key' => 'seats_left',
                'label' => 'Seats Left',
                'sortable' => false,
                'format' => 'number',
                'align' => 'right',
            ],
            [
                'key' => 'confirmed_count',
                'label' => 'Confirmed Count',
                'sortable' => false,
                'format' => 'number',
                'align' => 'right',
            ],
            [
                'key' => 'pending_count',
                'label' => 'Pending Count',
                'sortable' => false,
                'format' => 'number',
                'align' => 'right',
            ],
            [
                'key' => 'highlight',
                'label' => 'Alert',
                'sortable' => false,
                'format' => 'badge',
            ],
        ];
    }

    /**
     * Build the filtered query with subqueries to guarantee zero N+1 query execution.
     */
    protected function buildQuery(array $filters)
    {
        $query = TourPackage::query()
            ->with(['destination:id,country,city_region'])
            ->withSum(['bookings as booked_travelers' => function ($q) {
                $q->where('booking_status', '!=', BookingStatus::Cancelled->value);
            }], 'number_of_travelers')
            ->withCount(['bookings as confirmed_count' => function ($q) {
                $q->where('booking_status', BookingStatus::Confirmed->value);
            }])
            ->withCount(['bookings as pending_count' => function ($q) {
                $q->where('booking_status', BookingStatus::Pending->value);
            }]);

        // Date range filter: default is today forward to next 90 days
        $dateFrom = $filters['date_from'] ?? now()->toDateString();
        $dateTo = $filters['date_to'] ?? now()->addDays(90)->toDateString();

        if (! empty($dateFrom)) {
            $query->whereDate('start_date', '>=', $dateFrom);
        }

        if (! empty($dateTo)) {
            $query->whereDate('start_date', '<=', $dateTo);
        }

        // Status filter: default is 'active'
        $status = $filters['status'] ?? 'active';
        if (! empty($status)) {
            $query->where('status', $status);
        }

        // Destination filter
        if (! empty($filters['destination_id'])) {
            $query->where('destination_id', $filters['destination_id']);
        }

        // Tier filter
        if (! empty($filters['tier'])) {
            $query->where('tier', $filters['tier']);
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
            'duration_days',
            'capacity',
            'status',
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
     * Transform a single TourPackage record into report table row array.
     */
    public function transformRow(mixed $record): array
    {
        /** @var TourPackage $package */
        $package = $record;

        $capacity = (int) ($package->capacity ?? 0);
        $bookedTravelers = (int) ($package->booked_travelers ?? 0);
        $seatsLeft = max(0, $capacity - $bookedTravelers);
        $confirmedCount = (int) ($package->confirmed_count ?? 0);
        $pendingCount = (int) ($package->pending_count ?? 0);

        $lowSeatsThreshold = (float) config('travel.reports.upcoming_tours.low_seats_threshold_percentage', 20.0);
        $startingSoonDays = (int) config('travel.reports.upcoming_tours.starting_soon_days', 7);

        $isLowSeats = $capacity > 0 && (($seatsLeft / $capacity) * 100 <= $lowSeatsThreshold);

        $startDate = $package->start_date instanceof Carbon
            ? $package->start_date
            : ($package->start_date ? Carbon::parse($package->start_date) : null);

        $today = now()->startOfDay();
        $isStartingSoon = false;
        if ($startDate) {
            $startDay = $startDate->copy()->startOfDay();
            $diffInDays = $today->diffInDays($startDay, false);
            // Starting within the next 7 days (including today)
            $isStartingSoon = ($diffInDays >= 0 && $diffInDays <= $startingSoonDays);
        }

        // Determine highlight badge string
        $highlight = 'Available';
        $seatsBadge = null;

        if ($seatsLeft <= 0 && $capacity > 0) {
            $highlight = 'Sold Out';
            $seatsBadge = 'Sold Out';
        } elseif ($isLowSeats) {
            $highlight = 'Limited Seats';
            $seatsBadge = 'Limited Seats';
        } elseif ($isStartingSoon) {
            $highlight = 'Starting Soon';
        }

        $destName = $package->destination
            ? ($package->destination->city_region ? "{$package->destination->city_region}, {$package->destination->country}" : $package->destination->country)
            : '—';

        return [
            'id' => $package->id,
            'package_name' => $package->package_name,
            'destination' => $destName,
            'start_date' => $startDate?->format('Y-m-d') ?? '—',
            'end_date' => $package->end_date?->format('Y-m-d') ?? '—',
            'duration_days' => (int) ($package->duration_days ?? 0),
            'capacity' => $capacity,
            'booked_travelers' => $bookedTravelers,
            'seats_left' => $seatsLeft,
            'confirmed_count' => $confirmedCount,
            'pending_count' => $pendingCount,
            'highlight' => $highlight,
            'seats_badge' => $seatsBadge,
            'is_limited_seats' => $isLowSeats,
            'is_starting_soon' => $isStartingSoon,
        ];
    }

    public function query(array $filters): LengthAwarePaginator
    {
        $query = $this->queryBuilder($filters);

        $perPage = (int) ($filters['per_page'] ?? 15);
        $paginator = $query->paginate(max(1, min($perPage, 100)));

        $paginator->through(fn ($package) => $this->transformRow($package));

        return $paginator;
    }

    /**
     * Calculate summary metric tiles for Upcoming Tours.
     */
    public function summary(array $filters): array
    {
        $query = $this->buildQuery($filters);

        $totalUpcomingTours = (clone $query)->count();
        $totalCapacity = (int) ((clone $query)->sum('capacity') ?? 0);

        // Fetch aggregate booked travelers and booking counts
        $packages = (clone $query)->get();

        $totalBookedTravelers = 0;
        $totalConfirmed = 0;
        $totalPending = 0;

        foreach ($packages as $pkg) {
            $totalBookedTravelers += (int) ($pkg->booked_travelers ?? 0);
            $totalConfirmed += (int) ($pkg->confirmed_count ?? 0);
            $totalPending += (int) ($pkg->pending_count ?? 0);
        }

        $totalSeatsAvailable = max(0, $totalCapacity - $totalBookedTravelers);

        return [
            [
                'key' => 'total_upcoming_tours',
                'label' => 'Upcoming Tours',
                'value' => $totalUpcomingTours,
                'format' => 'number',
            ],
            [
                'key' => 'total_capacity',
                'label' => 'Total Capacity',
                'value' => $totalCapacity,
                'format' => 'number',
            ],
            [
                'key' => 'total_booked_travelers',
                'label' => 'Booked Travelers',
                'value' => $totalBookedTravelers,
                'format' => 'number',
            ],
            [
                'key' => 'seats_available',
                'label' => 'Seats Available',
                'value' => $totalSeatsAvailable,
                'format' => 'number',
            ],
            [
                'key' => 'confirmed_bookings',
                'label' => 'Confirmed Bookings',
                'value' => $totalConfirmed,
                'format' => 'number',
            ],
            [
                'key' => 'pending_bookings',
                'label' => 'Pending Bookings',
                'value' => $totalPending,
                'format' => 'number',
            ],
        ];
    }
}
