<?php

namespace App\Reports\Operational;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Reports\BaseReport;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Placeholder Booking Register report.
 * Proves the report pipeline end-to-end. Full implementation comes in RPT-05.
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

    public function filters(): array
    {
        return [
            [
                'name' => 'date_range',
                'label' => 'Booking Date',
                'type' => 'date_range',
            ],
            [
                'name' => 'status',
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
                'name' => 'search',
                'label' => 'Search',
                'type' => 'text',
                'placeholder' => 'Search reference, customer...',
            ],
        ];
    }

    public function columns(): array
    {
        return [
            [
                'key' => 'booking_reference',
                'label' => 'Reference',
                'sortable' => true,
            ],
            [
                'key' => 'customer_name',
                'label' => 'Customer',
                'sortable' => false,
            ],
            [
                'key' => 'tour_package_name',
                'label' => 'Tour Package',
                'sortable' => false,
            ],
            [
                'key' => 'booking_date',
                'label' => 'Booking Date',
                'sortable' => true,
                'format' => 'date',
            ],
            [
                'key' => 'booking_status',
                'label' => 'Status',
                'sortable' => true,
                'format' => 'badge',
            ],
            [
                'key' => 'final_amount',
                'label' => 'Total Amount',
                'sortable' => true,
                'format' => 'money',
                'currency' => 'LKR',
                'align' => 'right',
            ],
            [
                'key' => 'paid_amount',
                'label' => 'Paid Amount',
                'sortable' => true,
                'format' => 'money',
                'currency' => 'LKR',
                'align' => 'right',
            ],
            [
                'key' => 'balance_amount',
                'label' => 'Balance Due',
                'sortable' => true,
                'format' => 'money',
                'currency' => 'LKR',
                'align' => 'right',
            ],
        ];
    }

    /**
     * Build the base filtered query.
     */
    protected function buildQuery(array $filters)
    {
        $query = Booking::query()
            ->with(['customer', 'tourPackage']);

        if (! empty($filters['date_from'])) {
            $query->whereDate('booking_date', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('booking_date', '<=', $filters['date_to']);
        }

        if (! empty($filters['status'])) {
            $query->where('booking_status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $term = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($term) {
                $q->where('booking_reference', 'like', $term)
                    ->orWhereHas('customer', function ($cq) use ($term) {
                        $cq->where('full_name', 'like', $term)
                            ->orWhere('email', 'like', $term);
                    });
            });
        }

        return $query;
    }

    /**
     * Get the query builder instance with all filters and sorting applied.
     */
    public function queryBuilder(array $filters)
    {
        $query = $this->buildQuery($filters);

        // Sorting
        $sortField = $filters['sort'] ?? 'booking_date';
        $direction = strtolower($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $allowedSorts = ['booking_reference', 'booking_date', 'booking_status', 'final_amount', 'paid_amount', 'balance_amount', 'created_at'];
        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $direction);
        } else {
            $query->orderBy('booking_date', 'desc');
        }

        return $query;
    }

    /**
     * Transform a single Booking model into a report row array.
     */
    public function transformRow(mixed $record): array
    {
        /** @var Booking $booking */
        $booking = $record;

        return [
            'id' => $booking->id,
            'booking_reference' => $booking->booking_reference,
            'customer_name' => $booking->customer?->full_name ?? '—',
            'tour_package_name' => $booking->tourPackage?->package_name ?? '—',
            'booking_date' => $booking->booking_date?->format('Y-m-d') ?? '—',
            'booking_status' => $booking->booking_status instanceof BookingStatus ? $booking->booking_status->value : (string) $booking->booking_status,
            'final_amount' => (string) $booking->final_amount,
            'paid_amount' => (string) $booking->paid_amount,
            'balance_amount' => (string) $booking->balance_amount,
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

    public function summary(array $filters): array
    {
        $query = $this->buildQuery($filters);

        $totalBookings = (clone $query)->count();
        $confirmedBookings = (clone $query)->where('booking_status', BookingStatus::Confirmed)->count();

        // Use database decimal sum and bcmath for server-side precision
        $totalAmountSum = (clone $query)->sum('final_amount') ?? '0.00';
        $balanceAmountSum = (clone $query)->sum('balance_amount') ?? '0.00';
        $paidAmountSum = (clone $query)->sum('paid_amount') ?? '0.00';

        // Normalize using bcadd
        $totalAmount = bcadd((string) $totalAmountSum, '0', 2);
        $balanceAmount = bcadd((string) $balanceAmountSum, '0', 2);
        $paidAmount = bcadd((string) $paidAmountSum, '0', 2);

        return [
            [
                'key' => 'total_bookings',
                'label' => 'Total Bookings',
                'value' => $totalBookings,
                'format' => 'number',
            ],
            [
                'key' => 'confirmed_bookings',
                'label' => 'Confirmed Bookings',
                'value' => $confirmedBookings,
                'format' => 'number',
            ],
            [
                'key' => 'total_revenue',
                'label' => 'Total Revenue',
                'value' => $totalAmount,
                'format' => 'money',
                'currency' => 'LKR',
            ],
            [
                'key' => 'total_balance_due',
                'label' => 'Outstanding Balance',
                'value' => $balanceAmount,
                'format' => 'money',
                'currency' => 'LKR',
            ],
        ];
    }
}
