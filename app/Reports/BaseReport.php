<?php

namespace App\Reports;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Abstract Base Report
 *
 * Defines the contract and common behavior for all system reports.
 */
abstract class BaseReport
{
    /**
     * Unique report slug/key (e.g. 'booking-register', 'income-expenses').
     */
    abstract public function key(): string;

    /**
     * Human-readable report title.
     */
    abstract public function title(): string;

    /**
     * Detailed description of what this report provides.
     */
    abstract public function description(): string;

    /**
     * Report category ('financial' | 'operational').
     */
    abstract public function category(): string;

    /**
     * Spatie permission required to access this report.
     * Defaults to 'reports.<key>'.
     */
    public function permission(): string
    {
        return 'reports.' . $this->key();
    }

    /**
     * Filter definitions for UI rendering.
     *
     * @return array<int, array{
     *     name: string,
     *     label: string,
     *     type: 'date_range'|'select'|'text'|'date',
     *     placeholder?: string,
     *     options?: array<int, array{value: string|number, label: string}>,
     *     default?: mixed
     * }>
     */
    abstract public function filters(): array;

    /**
     * Column definitions for the DataTable.
     *
     * @return array<int, array{
     *     key: string,
     *     label: string,
     *     sortable?: bool,
     *     align?: 'left'|'center'|'right',
     *     format?: 'text'|'number'|'money'|'date'|'datetime'|'badge',
     *     currency?: string
     * }>
     */
    abstract public function columns(): array;

    /**
     * Execute the query for the report table given user-supplied filters.
     *
     * @param array<string, mixed> $filters
     * @return LengthAwarePaginator|array<int, mixed>
     */
    abstract public function query(array $filters): LengthAwarePaginator|array;

    /**
     * Calculate summary metric tiles for the report using server-side decimal math.
     *
     * @param array<string, mixed> $filters
     * @return array<int, array{
     *     key: string,
     *     label: string,
     *     value: string|int|float,
     *     format?: 'text'|'number'|'money'|'percentage',
     *     currency?: string,
     *     change?: string,
     *     helpText?: string
     * }>
     */
    abstract public function summary(array $filters): array;

    /**
     * Normalize the queried data into a paginated response payload.
     *
     * @param array<string, mixed> $filters
     * @return array{
     *     data: array<int, mixed>,
     *     total: int,
     *     current_page: int,
     *     last_page: int,
     *     per_page: int,
     *     from: int|null,
     *     to: int|null,
     *     links?: array<int, array{url: string|null, label: string, active: bool}>
     * }
     */
    public function getData(array $filters): array
    {
        $result = $this->query($filters);

        if ($result instanceof LengthAwarePaginator) {
            return [
                'data' => array_values($result->items()),
                'total' => $result->total(),
                'current_page' => $result->currentPage(),
                'last_page' => $result->lastPage(),
                'per_page' => $result->perPage(),
                'from' => $result->firstItem(),
                'to' => $result->lastItem(),
                'links' => $result->linkCollection()->toArray(),
            ];
        }

        $data = array_values((array) $result);
        $count = count($data);

        return [
            'data' => $data,
            'total' => $count,
            'current_page' => 1,
            'last_page' => 1,
            'per_page' => max($count, 15),
            'from' => $count > 0 ? 1 : null,
            'to' => $count > 0 ? $count : null,
            'links' => [],
        ];
    }

    /**
     * Serialized report descriptor for frontend props.
     *
     * @return array{
     *     key: string,
     *     title: string,
     *     description: string,
     *     category: string,
     *     permission: string,
     *     filters: array,
     *     columns: array
     * }
     */
    public function toDescriptor(): array
    {
        return [
            'key' => $this->key(),
            'title' => $this->title(),
            'description' => $this->description(),
            'category' => $this->category(),
            'permission' => $this->permission(),
            'filters' => $this->filters(),
            'columns' => $this->columns(),
        ];
    }
}
