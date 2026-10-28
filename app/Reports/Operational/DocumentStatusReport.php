<?php

namespace App\Reports\Operational;

use App\Enums\BookingStatus;
use App\Models\DocumentType;
use App\Reports\BaseReport;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Document Status Report
 *
 * Operational report displaying traveler document verification and expiry status,
 * missing document detection for upcoming bookings, and 6-month pre-travel expiry alerts.
 */
class DocumentStatusReport extends BaseReport
{
    public function key(): string
    {
        return 'document-status';
    }

    public function title(): string
    {
        return 'Document Status';
    }

    public function description(): string
    {
        return 'Verification and expiry status of traveler documents including missing and expiring documents.';
    }

    public function category(): string
    {
        return 'operational';
    }

    public function permission(): string
    {
        return 'reports.document-status';
    }

    /**
     * Filter definitions for the report UI.
     */
    public function filters(): array
    {
        $documentTypeOptions = [['value' => '', 'label' => 'All Document Types']];
        try {
            $types = DocumentType::where('is_active', true)
                ->orderBy('name')
                ->get();
            foreach ($types as $type) {
                $documentTypeOptions[] = [
                    'value' => (string) $type->id,
                    'label' => $type->name . ($type->is_required ? ' (Required)' : ''),
                ];
            }
        } catch (\Throwable) {
            // Ignore if DB not ready
        }

        return [
            [
                'name' => 'status',
                'label' => 'Status',
                'type' => 'select',
                'options' => [
                    ['value' => '', 'label' => 'All Statuses'],
                    ['value' => 'Missing', 'label' => 'Missing'],
                    ['value' => 'Pending', 'label' => 'Pending'],
                    ['value' => 'Verified', 'label' => 'Verified'],
                    ['value' => 'Rejected', 'label' => 'Rejected'],
                    ['value' => 'Expired', 'label' => 'Expired'],
                    ['value' => 'Expiring soon', 'label' => 'Expiring Soon'],
                ],
            ],
            [
                'name' => 'document_type_id',
                'label' => 'Document Type',
                'type' => 'select',
                'options' => $documentTypeOptions,
            ],
            [
                'name' => 'date_range',
                'label' => 'Travel Date',
                'type' => 'date_range',
            ],
            [
                'name' => 'expiring_days',
                'label' => 'Expiring Within (Days)',
                'type' => 'select',
                'default' => '30',
                'options' => [
                    ['value' => '15', 'label' => 'Within 15 days'],
                    ['value' => '30', 'label' => 'Within 30 days (Default)'],
                    ['value' => '60', 'label' => 'Within 60 days'],
                    ['value' => '90', 'label' => 'Within 90 days'],
                    ['value' => '180', 'label' => 'Within 180 days'],
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
                'key' => 'customer',
                'label' => 'Customer',
                'sortable' => true,
                'align' => 'left',
            ],
            [
                'key' => 'customer_id',
                'label' => 'Customer ID',
                'sortable' => true,
                'align' => 'left',
            ],
            [
                'key' => 'booking_reference',
                'label' => 'Booking Ref',
                'sortable' => true,
                'align' => 'left',
            ],
            [
                'key' => 'travel_date',
                'label' => 'Travel Date',
                'sortable' => true,
                'align' => 'left',
                'format' => 'date',
            ],
            [
                'key' => 'document_type',
                'label' => 'Document Type',
                'sortable' => true,
                'align' => 'left',
            ],
            [
                'key' => 'status',
                'label' => 'Status',
                'sortable' => true,
                'align' => 'center',
                'format' => 'badge',
            ],
            [
                'key' => 'expiry_date',
                'label' => 'Expiry Date',
                'sortable' => true,
                'align' => 'left',
                'format' => 'date',
            ],
            [
                'key' => 'days_to_expiry',
                'label' => 'Days to Expiry',
                'sortable' => true,
                'align' => 'right',
                'format' => 'number',
            ],
            [
                'key' => 'rejection_reason',
                'label' => 'Rejection Reason',
                'sortable' => false,
                'align' => 'left',
            ],
        ];
    }

    /**
     * Build the unified query combining active existing documents and missing document alerts.
     */
    protected function buildQuery(array $filters)
    {
        $todayStr = now()->toDateString();
        $bufferMonths = (int) config('travel.reports.document_status.travel_date_expiry_buffer_months', 6);
        $expiringDays = ! empty($filters['expiring_days'])
            ? (int) $filters['expiring_days']
            : (int) config('travel.reports.document_status.default_expiring_within_days', 30);
        $expiringDaysThreshold = now()->addDays($expiringDays)->toDateString();

        $driver = DB::connection()->getDriverName();
        $sixMonthsExpr = $driver === 'sqlite'
            ? "date(travel_date, '+{$bufferMonths} months')"
            : "DATE_ADD(travel_date, INTERVAL {$bufferMonths} MONTH)";

        // 1. Upcoming booking lookup for customers without booking_id on customer_documents
        $earliestBookingSubquery = DB::table('bookings')
            ->select('customer_id', 'booking_reference', 'travel_date')
            ->whereNull('deleted_at')
            ->where('booking_status', '!=', BookingStatus::Cancelled->value);

        // 2. Query A: Existing Active Customer Documents (ignoring soft-deleted and replaced)
        $existingDocsQuery = DB::table('customer_documents as cd')
            ->join('customers as c', function ($join) {
                $join->on('cd.customer_id', '=', 'c.id')
                    ->whereNull('c.deleted_at');
            })
            ->join('document_types as dt', 'cd.document_type_id', '=', 'dt.id')
            ->leftJoin('bookings as b', function ($join) {
                $join->on('cd.booking_id', '=', 'b.id')
                    ->whereNull('b.deleted_at');
            })
            ->leftJoinSub($earliestBookingSubquery, 'eb', function ($join) {
                $join->on('cd.customer_id', '=', 'eb.customer_id');
            })
            ->whereNull('cd.deleted_at')
            ->whereNull('cd.replaced_by_id')
            ->where('cd.document_status', 'active')
            ->select(
                'cd.id as record_id',
                'c.id as customer_pk',
                'c.full_name as customer',
                'c.customer_id as customer_id',
                DB::raw("COALESCE(b.booking_reference, eb.booking_reference, '—') as booking_reference"),
                DB::raw('COALESCE(b.travel_date, eb.travel_date) as travel_date'),
                'dt.id as document_type_id',
                'dt.name as document_type',
                'dt.tracks_expiry as tracks_expiry',
                'cd.document_status as document_status',
                'cd.verification_status as verification_status',
                'cd.expiry_date as expiry_date',
                'cd.rejection_reason as rejection_reason',
                DB::raw('0 as is_missing')
            );

        // 3. Query B: Missing Documents (Active required document types missing for customers with future non-cancelled bookings)
        $missingDocsQuery = DB::table('bookings as b')
            ->join('customers as c', function ($join) {
                $join->on('b.customer_id', '=', 'c.id')
                    ->whereNull('c.deleted_at');
            })
            ->crossJoin('document_types as dt')
            ->whereNull('b.deleted_at')
            ->where('b.booking_status', '!=', BookingStatus::Cancelled->value)
            ->whereDate('b.travel_date', '>=', $todayStr)
            ->where('dt.is_active', 1)
            ->where('dt.is_required', 1)
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('customer_documents as cd')
                    ->whereColumn('cd.customer_id', 'c.id')
                    ->whereColumn('cd.document_type_id', 'dt.id')
                    ->whereNull('cd.deleted_at')
                    ->whereNull('cd.replaced_by_id')
                    ->where('cd.document_status', 'active');
            })
            ->select(
                DB::raw('NULL as record_id'),
                'c.id as customer_pk',
                'c.full_name as customer',
                'c.customer_id as customer_id',
                'b.booking_reference as booking_reference',
                'b.travel_date as travel_date',
                'dt.id as document_type_id',
                'dt.name as document_type',
                'dt.tracks_expiry as tracks_expiry',
                DB::raw("'missing' as document_status"),
                DB::raw("'Missing' as verification_status"),
                DB::raw('NULL as expiry_date'),
                DB::raw('NULL as rejection_reason'),
                DB::raw('1 as is_missing')
            );

        // Union both subqueries
        $unionQuery = $existingDocsQuery->unionAll($missingDocsQuery);

        // Computed status expression
        $statusExpr = "CASE
            WHEN is_missing = 1 THEN 'Missing'
            WHEN LOWER(verification_status) = 'rejected' THEN 'Rejected'
            WHEN expiry_date IS NOT NULL AND expiry_date < '{$todayStr}' THEN 'Expired'
            WHEN tracks_expiry = 1 AND expiry_date IS NOT NULL AND (
                (travel_date IS NOT NULL AND expiry_date <= {$sixMonthsExpr})
                OR expiry_date <= '{$expiringDaysThreshold}'
            ) THEN 'Expiring soon'
            WHEN LOWER(verification_status) = 'verified' THEN 'Verified'
            ELSE 'Pending'
        END";

        $mainQuery = DB::query()
            ->fromSub($unionQuery, 'doc_view')
            ->select(
                'doc_view.*',
                DB::raw("{$statusExpr} as status_computed")
            );

        // Apply filters
        // Status filter
        if (! empty($filters['status'])) {
            $mainQuery->where('status_computed', $filters['status']);
        }

        // Document type filter
        if (! empty($filters['document_type_id'])) {
            $mainQuery->where('document_type_id', $filters['document_type_id']);
        }

        // Travel date range filter
        $dateFrom = $filters['travel_date_from'] ?? $filters['date_from'] ?? null;
        $dateTo = $filters['travel_date_to'] ?? $filters['date_to'] ?? null;

        if (! empty($dateFrom)) {
            $mainQuery->whereDate('travel_date', '>=', $dateFrom);
        }
        if (! empty($dateTo)) {
            $mainQuery->whereDate('travel_date', '<=', $dateTo);
        }

        // Filter expiring within N days (explicit filter)
        if (! empty($filters['expiring_within_days'])) {
            $nDays = (int) $filters['expiring_within_days'];
            $nDaysThreshold = now()->addDays($nDays)->toDateString();
            $mainQuery->whereNotNull('expiry_date')
                ->whereDate('expiry_date', '>=', $todayStr)
                ->whereDate('expiry_date', '<=', $nDaysThreshold);
        }

        return $mainQuery;
    }

    /**
     * Get the query builder instance with sorting applied.
     */
    public function queryBuilder(array $filters)
    {
        $query = $this->buildQuery($filters);

        $sortField = $filters['sort'] ?? 'travel_date';
        $direction = strtolower($filters['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        $allowedSorts = [
            'customer',
            'customer_id',
            'booking_reference',
            'travel_date',
            'document_type',
            'status' => 'status_computed',
            'expiry_date',
            'days_to_expiry' => 'expiry_date',
        ];

        if (isset($allowedSorts[$sortField])) {
            $query->orderBy($allowedSorts[$sortField], $direction);
        } elseif (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $direction);
        } else {
            $query->orderBy('travel_date', 'asc')->orderBy('customer', 'asc');
        }

        return $query;
    }

    /**
     * Transform a single database record into report table row array.
     */
    public function transformRow(mixed $record): array
    {
        $rec = (object) $record;
        $today = now()->startOfDay();
        $bufferMonths = (int) config('travel.reports.document_status.travel_date_expiry_buffer_months', 6);
        $expiringDays = (int) config('travel.reports.document_status.default_expiring_within_days', 30);

        $isMissing = (bool) ($rec->is_missing ?? false);
        $verificationStatus = (string) ($rec->verification_status ?? '');
        $tracksExpiry = (bool) ($rec->tracks_expiry ?? false);
        $rejectionReason = $rec->rejection_reason ?? null;

        $expiryDate = null;
        $daysToExpiry = null;
        if (! empty($rec->expiry_date)) {
            $expiryDate = Carbon::parse($rec->expiry_date);
            $daysToExpiry = (int) $today->diffInDays($expiryDate, false);
        }

        $travelDate = ! empty($rec->travel_date) ? Carbon::parse($rec->travel_date) : null;

        // Exact status classification logic in PHP to mirror SQL logic
        if ($isMissing) {
            $status = 'Missing';
        } elseif (strtolower($verificationStatus) === 'rejected') {
            $status = 'Rejected';
        } elseif ($expiryDate && $expiryDate->lt($today)) {
            $status = 'Expired';
        } elseif ($tracksExpiry && $expiryDate) {
            $expiresNearTravel = false;
            if ($travelDate) {
                $bufferThreshold = $travelDate->copy()->addMonths($bufferMonths);
                if ($expiryDate->lte($bufferThreshold)) {
                    $expiresNearTravel = true;
                }
            }
            $expiresSoonToday = $expiryDate->lte($today->copy()->addDays($expiringDays));

            if ($expiresNearTravel || $expiresSoonToday) {
                $status = 'Expiring soon';
            } elseif (strtolower($verificationStatus) === 'verified') {
                $status = 'Verified';
            } else {
                $status = 'Pending';
            }
        } elseif (strtolower($verificationStatus) === 'verified') {
            $status = 'Verified';
        } else {
            $status = 'Pending';
        }

        $isFlagged = ($status === 'Missing' || $status === 'Expired' || $status === 'Expiring soon');

        return [
            'customer' => (string) ($rec->customer ?? '—'),
            'customer_id' => (string) ($rec->customer_id ?? '—'),
            'booking_reference' => (string) ($rec->booking_reference ?? '—'),
            'travel_date' => $travelDate ? $travelDate->format('Y-m-d') : '—',
            'document_type' => (string) ($rec->document_type ?? '—'),
            'document_type_id' => $rec->document_type_id ?? null,
            'status' => $status,
            'expiry_date' => $expiryDate ? $expiryDate->format('Y-m-d') : '—',
            'days_to_expiry' => $daysToExpiry,
            'rejection_reason' => $status === 'Rejected' ? ($rejectionReason ?? '—') : '—',
            'is_flagged' => $isFlagged,
            'flagged' => $isFlagged,
            'is_missing' => $isMissing,
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

        $total = (clone $query)->count();

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
     * Calculate summary metric tiles for Document Status.
     */
    public function summary(array $filters): array
    {
        $query = $this->buildQuery($filters);
        $records = $query->get();

        $totalDocs = count($records);
        $missing = 0;
        $pending = 0;
        $verified = 0;
        $rejected = 0;
        $expired = 0;
        $expiringSoon = 0;

        foreach ($records as $r) {
            $transformed = $this->transformRow($r);
            match ($transformed['status']) {
                'Missing' => $missing++,
                'Pending' => $pending++,
                'Verified' => $verified++,
                'Rejected' => $rejected++,
                'Expired' => $expired++,
                'Expiring soon' => $expiringSoon++,
                default => null,
            };
        }

        return [
            [
                'key' => 'total_documents',
                'label' => 'Total Items',
                'value' => $totalDocs,
                'format' => 'number',
                'helpText' => 'Total document records and missing requirements matching filters',
            ],
            [
                'key' => 'missing_count',
                'label' => 'Missing',
                'value' => $missing,
                'format' => 'number',
                'helpText' => 'Required documents not yet provided for future departures',
            ],
            [
                'key' => 'expiring_soon_count',
                'label' => 'Expiring Soon',
                'value' => $expiringSoon,
                'format' => 'number',
                'helpText' => 'Documents expiring within 6 months of travel date or soon',
            ],
            [
                'key' => 'expired_count',
                'label' => 'Expired',
                'value' => $expired,
                'format' => 'number',
            ],
            [
                'key' => 'pending_count',
                'label' => 'Pending Verification',
                'value' => $pending,
                'format' => 'number',
            ],
            [
                'key' => 'verified_count',
                'label' => 'Verified',
                'value' => $verified,
                'format' => 'number',
            ],
            [
                'key' => 'rejected_count',
                'label' => 'Rejected',
                'value' => $rejected,
                'format' => 'number',
            ],
        ];
    }
}
