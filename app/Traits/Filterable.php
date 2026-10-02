<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Filterable
{
    /**
     * Scope a query to apply standard filtering, sorting, and search from the request.
     *
     * @param Builder $query
     * @param array $params Request parameters (usually request()->all())
     * @return Builder
     */
    public function scopeFilterAndSort(Builder $query, array $params)
    {
        $search = $params['search'] ?? null;
        $sort = $params['sort'] ?? null;
        $direction = $params['direction'] ?? 'desc';

        // 1. Search
        if (!empty($search) && method_exists($this, 'getSearchableColumns')) {
            $searchableColumns = $this->getSearchableColumns();
            if (!empty($searchableColumns)) {
                $query->where(function ($q) use ($search, $searchableColumns) {
                    foreach ($searchableColumns as $index => $column) {
                        if (str_contains($column, '.')) {
                            // Handle relationship search (e.g., 'customer.first_name')
                            [$relation, $relColumn] = explode('.', $column);
                            $q->orWhereHas($relation, function ($relQuery) use ($relColumn, $search) {
                                $relQuery->where($relColumn, 'like', '%' . $search . '%');
                            });
                        } else {
                            if ($index === 0) {
                                $q->where($column, 'like', '%' . $search . '%');
                            } else {
                                $q->orWhere($column, 'like', '%' . $search . '%');
                            }
                        }
                    }
                });
            }
        }

        // 2. Custom Filters
        if (method_exists($this, 'getFilterableColumns')) {
            $filterableColumns = $this->getFilterableColumns();
            foreach ($filterableColumns as $column) {
                if (isset($params[$column]) && $params[$column] !== '') {
                    $value = $params[$column];
                    if (is_array($value)) {
                        $query->whereIn($column, $value);
                    } else {
                        // Allow comma-separated values in query string for multi-select
                        if (is_string($value) && str_contains($value, ',')) {
                            $query->whereIn($column, explode(',', $value));
                        } else {
                            $query->where($column, $value);
                        }
                    }
                }
            }
        }

        // 3. Sorting
        if (!empty($sort) && method_exists($this, 'getSortableColumns')) {
            $sortableColumns = $this->getSortableColumns();
            if (in_array($sort, $sortableColumns)) {
                $query->orderBy($sort, in_array(strtolower($direction), ['asc', 'desc']) ? $direction : 'desc');
            }
        } else {
            // Default sort if available
            $defaultSort = method_exists($this, 'getDefaultSort') ? $this->getDefaultSort() : 'created_at';
            $defaultDirection = method_exists($this, 'getDefaultSortDirection') ? $this->getDefaultSortDirection() : 'desc';
            if ($defaultSort) {
                $query->orderBy($defaultSort, $defaultDirection);
            }
        }

        return $query;
    }
}
