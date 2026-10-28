<?php

namespace App\Reports\Financial;

use App\Models\Payment;
use App\Reports\BaseReport;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Placeholder Income & Expenses report.
 * Full implementation comes in RPT-04.
 */
class IncomeExpensesReport extends BaseReport
{
    public function key(): string
    {
        return 'income-expenses';
    }

    public function title(): string
    {
        return 'Income & Expenses';
    }

    public function description(): string
    {
        return 'Summary of received payments, operational expenses, and net cash flow.';
    }

    public function category(): string
    {
        return 'financial';
    }

    public function filters(): array
    {
        return [
            [
                'name' => 'date_range',
                'label' => 'Payment Date',
                'type' => 'date_range',
            ],
            [
                'name' => 'search',
                'label' => 'Search',
                'type' => 'text',
                'placeholder' => 'Search receipt, notes...',
            ],
        ];
    }

    public function columns(): array
    {
        return [
            [
                'key' => 'payment_date',
                'label' => 'Date',
                'sortable' => true,
                'format' => 'date',
            ],
            [
                'key' => 'receipt_number',
                'label' => 'Receipt / Ref',
                'sortable' => true,
            ],
            [
                'key' => 'category',
                'label' => 'Category',
                'sortable' => false,
            ],
            [
                'key' => 'payment_method',
                'label' => 'Method',
                'sortable' => false,
            ],
            [
                'key' => 'amount',
                'label' => 'Amount',
                'sortable' => true,
                'format' => 'money',
                'currency' => 'LKR',
                'align' => 'right',
            ],
        ];
    }

    protected function buildQuery(array $filters)
    {
        // Exclude soft-deleted and failed/voided payments
        $query = Payment::query()
            ->with(['receipt', 'booking.customer']);

        if (! empty($filters['date_from'])) {
            $query->whereDate('payment_date', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('payment_date', '<=', $filters['date_to']);
        }

        if (! empty($filters['search'])) {
            $term = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($term) {
                $q->where('receipt_number', 'like', $term)
                    ->orWhere('reference_number', 'like', $term)
                    ->orWhere('notes', 'like', $term);
            });
        }

        return $query;
    }

    public function query(array $filters): LengthAwarePaginator
    {
        $query = $this->buildQuery($filters);

        $sortField = $filters['sort'] ?? 'payment_date';
        $direction = strtolower($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $allowedSorts = ['payment_date', 'receipt_number', 'amount', 'created_at'];
        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $direction);
        } else {
            $query->orderBy('payment_date', 'desc');
        }

        $perPage = (int) ($filters['per_page'] ?? 15);
        $paginator = $query->paginate(max(1, min($perPage, 100)));

        $paginator->through(function (Payment $payment) {
            return [
                'id' => $payment->id,
                'payment_date' => $payment->payment_date?->format('Y-m-d') ?? '—',
                'receipt_number' => $payment->receipt?->receipt_number ?? $payment->receipt_number ?? $payment->reference_number ?? ('RCP-' . $payment->id),
                'category' => 'Income',
                'payment_method' => $payment->payment_method ?? 'Bank Transfer',
                'amount' => (string) $payment->amount,
            ];
        });

        return $paginator;
    }

    public function summary(array $filters): array
    {
        $query = $this->buildQuery($filters);

        $totalTransactions = (clone $query)->count();
        $totalIncomeSum = (clone $query)->sum('amount') ?? '0.00';
        $totalIncome = bcadd((string) $totalIncomeSum, '0', 2);

        return [
            [
                'key' => 'total_income',
                'label' => 'Total Income',
                'value' => $totalIncome,
                'format' => 'money',
                'currency' => 'LKR',
            ],
            [
                'key' => 'total_expenses',
                'label' => 'Total Expenses',
                'value' => '0.00',
                'format' => 'money',
                'currency' => 'LKR',
            ],
            [
                'key' => 'net_flow',
                'label' => 'Net Cash Flow',
                'value' => $totalIncome,
                'format' => 'money',
                'currency' => 'LKR',
            ],
            [
                'key' => 'total_transactions',
                'label' => 'Transactions',
                'value' => $totalTransactions,
                'format' => 'number',
            ],
        ];
    }
}
