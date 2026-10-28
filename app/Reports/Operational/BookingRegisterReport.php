<?php

namespace App\Reports\Operational;

use App\Enums\BookingStatus;
use App\Enums\Currency;
use App\Models\Booking;
use App\Models\Destination;
use App\Models\Employee;
use App\Models\TourPackage;
use App\Reports\BaseReport;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Booking Register Report
 *
 * Chronological register of bookings with customer, tour, status, and payment details.
 * Implements RPT-05 requirements with multi-currency totals and relational filters.
 */
class BookingRegisterReport extends BaseReport
{
    public function key(): string
    {
        return 'booking-register';
    }

    public function title(): string
    {
        return 'Booking Register';
    }

    public function description(): string
    {
        return 'Chronological register of bookings with customer, tour, status, and payment details.';
    }

    public function category(): string
    {
        return 'operational';
    }

    public function permission(): string
    {
        return 'reports.booking-register';
    }

    /**
     * Filter definitions for the report UI.
     */
    public function filters(): array
    {
        // Safe relational option retrieval with fallbacks
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

        $employeeOptions = [['value' => '', 'label' => 'All Staff']];
        try {
            $employees = Employee::with('user:id,name')
                ->orderBy('id')
                ->get();
            foreach ($employees as $emp) {
                $name = $emp->user?->name ?? $emp->employee_id;
                $employeeOptions[] = [
                    'value' => (string) $emp->id,
                    'label' => $name,
                ];
            }
        } catch (\Throwable) {
            // Ignore if DB not ready
        }

        $currencyOptions = [['value' => '', 'label' => 'All Currencies']];
        foreach (Currency::cases() as $curr) {
            $currencyOptions[] = [
                'value' => $curr->value,
                'label' => "{$curr->value} - {$curr->label()}",
            ];
        }

        return [
            [
                'name' => 'booking_date',
                'label' => 'Booking Date',
                'type' => 'date_range',
            ],
            [
                'name' => 'travel_date_from',
                'label' => 'Travel From',
                'type' => 'date',
            ],
            [
                'name' => 'travel_date_to',
                'label' => 'Travel To',
                'type' => 'date',
            ],
            [
                'name' => 'booking_status',
                'label' => 'Booking Status',
                'type' => 'select',
                'options' => [
                    ['value' => '', 'label' => 'All Statuses'],
                    ['value' => BookingStatus::Pending->value, 'label' => 'Pending'],
                    ['value' => BookingStatus::Confirmed->value, 'label' => 'Confirmed'],
                    ['value' => BookingStatus::Completed->value, 'label' => 'Completed'],
                    ['value' => BookingStatus::Cancelled->value, 'label' => 'Cancelled'],
                ],
            ],
            [
                'name' => 'payment_status',
                'label' => 'Payment Status',
                'type' => 'select',
                'options' => [
                    ['value' => '', 'label' => 'All Payment Statuses'],
                    ['value' => 'Paid', 'label' => 'Paid'],
                    ['value' => 'Partial', 'label' => 'Partial'],
                    ['value' => 'Unpaid', 'label' => 'Unpaid'],
                ],
            ],
            [
                'name' => 'tour_package_id',
                'label' => 'Tour Package',
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
                'name' => 'assigned_to',
                'label' => 'Assigned Employee',
                'type' => 'select',
                'options' => $employeeOptions,
            ],
            [
                'name' => 'currency',
                'label' => 'Currency',
                'type' => 'select',
                'options' => $currencyOptions,
            ],
            [
                'name' => 'search',
                'label' => 'Search',
                'type' => 'text',
                'placeholder' => 'Search reference, customer...',
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
                'key' => 'booking_reference',
                'label' => 'Reference',
                'sortable' => true,
            ],
            [
                'key' => 'booking_date',
                'label' => 'Booking Date',
                'sortable' => true,
                'format' => 'date',
            ],
            [
                'key' => 'customer',
                'label' => 'Customer',
                'sortable' => false,
            ],
            [
                'key' => 'package_name',
                'label' => 'Tour Package',
                'sortable' => false,
            ],
            [
                'key' => 'travel_date',
                'label' => 'Travel Date',
                'sortable' => true,
                'format' => 'date',
            ],
            [
                'key' => 'number_of_travelers',
                'label' => 'Travelers',
                'sortable' => true,
                'format' => 'number',
                'align' => 'right',
            ],
            [
                'key' => 'currency',
                'label' => 'Currency',
                'sortable' => true,
                'align' => 'center',
            ],
            [
                'key' => 'final_amount',
                'label' => 'Final Amount',
                'sortable' => true,
                'format' => 'money',
                'align' => 'right',
            ],
            [
                'key' => 'paid_amount',
                'label' => 'Paid Amount',
                'sortable' => true,
                'format' => 'money',
                'align' => 'right',
            ],
            [
                'key' => 'balance_amount',
                'label' => 'Balance Amount',
                'sortable' => true,
                'format' => 'money',
                'align' => 'right',
            ],
            [
                'key' => 'booking_status',
                'label' => 'Booking Status',
                'sortable' => true,
                'format' => 'badge',
            ],
            [
                'key' => 'payment_status',
                'label' => 'Payment Status',
                'sortable' => true,
                'format' => 'badge',
            ],
        ];
    }

    /**
     * Build the filtered query with complete eager loading (No N+1).
     */
    protected function buildQuery(array $filters)
    {
        $query = Booking::query()
            ->with([
                'customer:id,customer_id,full_name,email,phone',
                'tourPackage' => function ($pq) {
                    $pq->select('id', 'package_name', 'destination_id')
                        ->with('destination:id,country,city_region');
                },
                'assignedTo' => function ($eq) {
                    $eq->select('id', 'user_id', 'employee_id')
                        ->with('user:id,name,email');
                },
            ]);

        // 1. Booking Date range filter
        $bookingDateFrom = $filters['booking_date_from'] ?? $filters['date_from'] ?? null;
        if (! empty($bookingDateFrom)) {
            $query->whereDate('booking_date', '>=', $bookingDateFrom);
        }

        $bookingDateTo = $filters['booking_date_to'] ?? $filters['date_to'] ?? null;
        if (! empty($bookingDateTo)) {
            $query->whereDate('booking_date', '<=', $bookingDateTo);
        }

        // 2. Travel Date range filter
        if (! empty($filters['travel_date_from'])) {
            $query->whereDate('travel_date', '>=', $filters['travel_date_from']);
        }
        if (! empty($filters['travel_date_to'])) {
            $query->whereDate('travel_date', '<=', $filters['travel_date_to']);
        }

        // 3. Booking Status filter
        $bookingStatus = $filters['booking_status'] ?? $filters['status'] ?? null;
        if (! empty($bookingStatus)) {
            $query->where('booking_status', $bookingStatus);
        }

        // 4. Payment Status filter
        if (! empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        // 5. Tour Package filter
        if (! empty($filters['tour_package_id'])) {
            $query->where('tour_package_id', $filters['tour_package_id']);
        }

        // 6. Destination filter (through tour package)
        if (! empty($filters['destination_id'])) {
            $destinationId = $filters['destination_id'];
            $query->whereHas('tourPackage', function ($pq) use ($destinationId) {
                $pq->where('destination_id', $destinationId);
            });
        }

        // 7. Assigned Employee filter
        if (! empty($filters['assigned_to'])) {
            $query->where('assigned_to', $filters['assigned_to']);
        }

        // 8. Currency filter
        if (! empty($filters['currency'])) {
            $query->where('currency', $filters['currency']);
        }

        // 9. Search filter
        if (! empty($filters['search'])) {
            $term = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($term) {
                $q->where('booking_reference', 'like', $term)
                    ->orWhereHas('customer', function ($cq) use ($term) {
                        $cq->where('full_name', 'like', $term)
                            ->orWhere('customer_id', 'like', $term)
                            ->orWhere('email', 'like', $term);
                    })
                    ->orWhereHas('tourPackage', function ($pq) use ($term) {
                        $pq->where('package_name', 'like', $term);
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

        $sortField = $filters['sort'] ?? 'booking_date';
        $direction = strtolower($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $allowedSorts = [
            'booking_reference',
            'booking_date',
            'travel_date',
            'number_of_travelers',
            'currency',
            'final_amount',
            'paid_amount',
            'balance_amount',
            'booking_status',
            'payment_status',
            'created_at',
        ];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $direction);
        } else {
            $query->orderBy('booking_date', 'desc');
        }

        return $query;
    }

    /**
     * Transform a single Booking record into report table row array.
     */
    public function transformRow(mixed $record): array
    {
        /** @var Booking $booking */
        $booking = $record;

        $customerText = $booking->customer
            ? "{$booking->customer->full_name} ({$booking->customer->customer_id})"
            : '—';

        $bookingStatusStr = $booking->booking_status instanceof BookingStatus
            ? $booking->booking_status->label()
            : ucfirst((string) $booking->booking_status);

        $paymentStatusStr = ucfirst((string) ($booking->payment_status ?? 'Unpaid'));

        return [
            'id' => $booking->id,
            'booking_reference' => $booking->booking_reference,
            'booking_date' => $booking->booking_date?->format('Y-m-d') ?? '—',
            'customer' => $customerText,
            'customer_name' => $booking->customer?->full_name ?? '—', // backwards compatibility
            'package_name' => $booking->tourPackage?->package_name ?? '—',
            'tour_package_name' => $booking->tourPackage?->package_name ?? '—', // backwards compatibility
            'travel_date' => $booking->travel_date?->format('Y-m-d') ?? '—',
            'number_of_travelers' => (int) ($booking->number_of_travelers ?? 1),
            'currency' => $booking->currency ?? 'LKR',
            'final_amount' => (string) $booking->final_amount,
            'paid_amount' => (string) $booking->paid_amount,
            'balance_amount' => (string) $booking->balance_amount,
            'booking_status' => $bookingStatusStr,
            'payment_status' => $paymentStatusStr,
        ];
    }

    public function query(array $filters): LengthAwarePaginator
    {
        $query = $this->queryBuilder($filters);

        $perPage = (int) ($filters['per_page'] ?? 15);
        $paginator = $query->paginate(max(1, min($perPage, 100)));

        $paginator->through(fn ($booking) => $this->transformRow($booking));

        return $paginator;
    }

    /**
     * Calculate summary metric tiles:
     * - booking count
     * - totals per currency (final, paid, balance) using server-side decimal math (bcmath)
     * - count per status (confirmed, pending, completed, cancelled)
     */
    public function summary(array $filters): array
    {
        $query = $this->buildQuery($filters);

        $totalBookings = (clone $query)->count();

        // Status counts
        $confirmedCount = (clone $query)->where('booking_status', BookingStatus::Confirmed->value)->count();
        $pendingCount = (clone $query)->where('booking_status', BookingStatus::Pending->value)->count();
        $completedCount = (clone $query)->where('booking_status', BookingStatus::Completed->value)->count();
        $cancelledCount = (clone $query)->where('booking_status', BookingStatus::Cancelled->value)->count();

        $tiles = [
            [
                'key' => 'total_bookings',
                'label' => 'Total Bookings',
                'value' => $totalBookings,
                'format' => 'number',
            ],
            [
                'key' => 'confirmed_count',
                'label' => 'Confirmed',
                'value' => $confirmedCount,
                'format' => 'number',
            ],
            [
                'key' => 'pending_count',
                'label' => 'Pending',
                'value' => $pendingCount,
                'format' => 'number',
            ],
            [
                'key' => 'completed_count',
                'label' => 'Completed',
                'value' => $completedCount,
                'format' => 'number',
            ],
            [
                'key' => 'cancelled_count',
                'label' => 'Cancelled',
                'value' => $cancelledCount,
                'format' => 'number',
            ],
        ];

        // Totals per currency using bcmath (server-side decimal math only)
        $currencies = (clone $query)->distinct()->pluck('currency')->filter()->values();
        if ($currencies->isEmpty()) {
            $currencies = collect(['LKR']);
        }

        $overallFinal = '0.00';
        $overallBalance = '0.00';

        foreach ($currencies as $curr) {
            $finalSum = (clone $query)->where('currency', $curr)->sum('final_amount') ?? '0.00';
            $paidSum = (clone $query)->where('currency', $curr)->sum('paid_amount') ?? '0.00';
            $balanceSum = (clone $query)->where('currency', $curr)->sum('balance_amount') ?? '0.00';

            $finalNormalized = bcadd((string) $finalSum, '0', 2);
            $paidNormalized = bcadd((string) $paidSum, '0', 2);
            $balanceNormalized = bcadd((string) $balanceSum, '0', 2);

            $overallFinal = bcadd($overallFinal, $finalNormalized, 2);
            $overallBalance = bcadd($overallBalance, $balanceNormalized, 2);

            $currLabel = $curr;

            $tiles[] = [
                'key' => "total_final_{$curr}",
                'label' => "Total Final ({$currLabel})",
                'value' => $finalNormalized,
                'format' => 'money',
                'currency' => $curr,
            ];
            $tiles[] = [
                'key' => "total_paid_{$curr}",
                'label' => "Total Paid ({$currLabel})",
                'value' => $paidNormalized,
                'format' => 'money',
                'currency' => $curr,
            ];
            $tiles[] = [
                'key' => "total_balance_{$curr}",
                'label' => "Total Balance ({$currLabel})",
                'value' => $balanceNormalized,
                'format' => 'money',
                'currency' => $curr,
            ];
        }

        // Add total_revenue and total_balance_due tiles
        $tiles[] = [
            'key' => 'total_revenue',
            'label' => 'Total Revenue',
            'value' => $overallFinal,
            'format' => 'money',
            'currency' => $currencies->first() ?? 'LKR',
        ];
        $tiles[] = [
            'key' => 'total_balance_due',
            'label' => 'Total Balance Due',
            'value' => $overallBalance,
            'format' => 'money',
            'currency' => $currencies->first() ?? 'LKR',
        ];

        return $tiles;
    }
}
