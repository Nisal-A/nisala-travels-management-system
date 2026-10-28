import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { PageHeader, MoneyText, StatusBadge, EmptyState, ErrorState } from '@/components/common';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { ColumnDef } from '@tanstack/react-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    BarChart3,
    RotateCcw,
    AlertTriangle,
    Calendar,
    RefreshCw,
    Download,
    FileSpreadsheet,
    FileText,
    FileCode,
    ChevronDown,
} from 'lucide-react';
import { ReportDescriptor, ReportFilterDef, ReportColumnDef } from './Index';

export interface ReportSummaryTile {
    key: string;
    label: string;
    value: string | number;
    format?: 'text' | 'number' | 'money' | 'percentage';
    currency?: string;
    change?: string;
    helpText?: string;
}

export interface ReportDataResponse<T = Record<string, unknown>> {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    links?: { url: string | null; label: string; active: boolean }[];
    summary: ReportSummaryTile[];
}

export type ReportRow = Record<string, unknown> & { id: number | string };

export interface ReportShowProps {
    report: ReportDescriptor;
    initialData: ReportDataResponse;
    filters: Record<string, string | number | undefined>;
    savedFilters?: Array<{ id: number; name: string; filters: Record<string, unknown> }>;
}

function formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getDatePresetRange(preset: string): { date_from: string; date_to: string } | null {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    switch (preset) {
        case 'today': {
            const todayStr = formatDate(now);
            return { date_from: todayStr, date_to: todayStr };
        }
        case 'this_week': {
            const dayOfWeek = now.getDay();
            const diffToMon = (dayOfWeek + 6) % 7;
            const monday = new Date(now);
            monday.setDate(now.getDate() - diffToMon);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            return { date_from: formatDate(monday), date_to: formatDate(sunday) };
        }
        case 'this_month': {
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            return { date_from: formatDate(firstDay), date_to: formatDate(lastDay) };
        }
        case 'last_month': {
            const firstDay = new Date(year, month - 1, 1);
            const lastDay = new Date(year, month, 0);
            return { date_from: formatDate(firstDay), date_to: formatDate(lastDay) };
        }
        case 'this_quarter': {
            const currentQuarter = Math.floor(month / 3);
            const firstDay = new Date(year, currentQuarter * 3, 1);
            const lastDay = new Date(year, (currentQuarter + 1) * 3, 0);
            return { date_from: formatDate(firstDay), date_to: formatDate(lastDay) };
        }
        case 'this_year': {
            const firstDay = new Date(year, 0, 1);
            const lastDay = new Date(year, 11, 31);
            return { date_from: formatDate(firstDay), date_to: formatDate(lastDay) };
        }
        case 'custom':
        default:
            return null;
    }
}

export default function ReportShow({
    report,
    initialData = {
        data: [],
        total: 0,
        current_page: 1,
        last_page: 1,
        per_page: 15,
        from: null,
        to: null,
        summary: [],
    },
    filters = {},
    savedFilters = [],
}: ReportShowProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Initial preset calculation
    const [activePreset, setActivePreset] = useState<string>(() => {
        if (filters.preset) {
            return String(filters.preset);
        }
        if (filters.date_from || filters.date_to) {
            return 'custom';
        }
        return '';
    });

    const [dateFrom, setDateFrom] = useState<string>(String(filters.date_from || ''));
    const [dateTo, setDateTo] = useState<string>(String(filters.date_to || ''));

    // Track Inertia navigation loading state
    useEffect(() => {
        const removeStart = router.on('start', () => {
            setIsLoading(true);
            setHasError(false);
        });
        const removeFinish = router.on('finish', () => setIsLoading(false));
        const removeError = router.on('error', () => {
            setIsLoading(false);
            setHasError(true);
        });

        return () => {
            removeStart();
            removeFinish();
            removeError();
        };
    }, []);

    // Sync state with filters prop updates
    useEffect(() => {
        if (filters.date_from !== undefined) {
            setDateFrom(String(filters.date_from || ''));
        }
        if (filters.date_to !== undefined) {
            setDateTo(String(filters.date_to || ''));
        }
        if (filters.preset !== undefined) {
            setActivePreset(String(filters.preset || ''));
        }
    }, [filters]);

    const applyFilterUpdates = useCallback(
        (updated: Record<string, string | number | undefined | null>) => {
            const query: Record<string, string | number> = {};

            // Preserve current filters except what is overwritten
            Object.entries(filters).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '') {
                    query[k] = v;
                }
            });

            // Merge new values
            Object.entries(updated).forEach(([k, v]) => {
                if (v === null || v === undefined || v === '') {
                    delete query[k];
                } else {
                    query[k] = v;
                }
            });

            // Reset to page 1 on filter changes
            query.page = 1;

            router.get(window.location.pathname, query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [filters],
    );

    const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') {
                queryParams.set(k, String(v));
            }
        });
        const qs = queryParams.toString();
        const exportUrl = `/reports/${report.key}/export/${format}${qs ? `?${qs}` : ''}`;
        window.location.href = exportUrl;
    };

    const handlePresetChange = (preset: string | null) => {
        const p = preset || '';
        setActivePreset(p);

        if (p === 'custom') {
            applyFilterUpdates({ preset: 'custom' });
            return;
        }

        const range = getDatePresetRange(p);
        if (range) {
            setDateFrom(range.date_from);
            setDateTo(range.date_to);
            applyFilterUpdates({
                preset: p,
                date_from: range.date_from,
                date_to: range.date_to,
            });
        } else {
            setDateFrom('');
            setDateTo('');
            applyFilterUpdates({
                preset: null,
                date_from: null,
                date_to: null,
            });
        }
    };

    const handleApplyCustomDates = () => {
        applyFilterUpdates({
            preset: 'custom',
            date_from: dateFrom || null,
            date_to: dateTo || null,
        });
    };

    const handleFilterChange = (filterName: string, value: string | null) => {
        applyFilterUpdates({ [filterName]: value || null });
    };

    const handleResetFilters = () => {
        setActivePreset('');
        setDateFrom('');
        setDateTo('');
        router.get(window.location.pathname, {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const hasActiveFilters = useMemo(() => {
        const keys = Object.keys(filters).filter((k) => k !== 'page' && k !== 'sort' && k !== 'direction');
        return keys.some((k) => filters[k] !== undefined && filters[k] !== null && filters[k] !== '');
    }, [filters]);

    // Build TanStack table columns from report descriptor
    const tableColumns = useMemo<ColumnDef<ReportRow, unknown>[]>(() => {
        return report.columns.map((col) => ({
            id: col.key,
            accessorKey: col.key,
            header: ({ column }) =>
                col.sortable !== false ? (
                    <DataTableColumnHeader column={column} title={col.label} />
                ) : (
                    <span className="font-semibold text-muted-foreground">{col.label}</span>
                ),
            cell: ({ row }) => {
                const val = row.getValue(col.key);
                if (val === null || val === undefined || val === '') {
                    return <span className="text-muted-foreground">—</span>;
                }

                if (col.format === 'money') {
                    const numVal = typeof val === 'number' ? val : parseFloat(String(val));
                    return (
                        <div className={col.align === 'right' ? 'text-right' : ''}>
                            <MoneyText
                                amount={isNaN(numVal) ? 0 : numVal}
                                currency={(col.currency as 'LKR' | 'USD') || 'LKR'}
                                weight="medium"
                            />
                        </div>
                    );
                }

                if (col.format === 'badge') {
                    return <StatusBadge status={String(val)} />;
                }

                if (col.key === 'seats_left' && (row.original as Record<string, unknown>).seats_badge) {
                    return (
                        <div className="flex items-center justify-end gap-2">
                            <span className="tabular-nums font-medium">{String(val)}</span>
                            <StatusBadge status={String((row.original as Record<string, unknown>).seats_badge)} />
                        </div>
                    );
                }

                if (col.key === 'start_date' && (row.original as Record<string, unknown>).is_starting_soon) {
                    return (
                        <div className="flex items-center gap-2">
                            <span className="tabular-nums">{String(val).split('T')[0]}</span>
                            <StatusBadge status="Starting Soon" />
                        </div>
                    );
                }

                if (col.format === 'date') {
                    return <span className="tabular-nums">{String(val).split('T')[0]}</span>;
                }

                return (
                    <span className={col.align === 'right' ? 'block text-right' : ''}>
                        {String(val)}
                    </span>
                );
            },
        }));
    }, [report.columns]);

    // Mobile fallback renderer for narrow screens (360px)
    const mobileCard = (row: Record<string, unknown>) => (
        <Card className="p-4 bg-card border-border space-y-2 text-sm shadow-xs">
            {report.columns.map((col) => (
                <div
                    key={col.key}
                    className="flex justify-between items-center py-1 border-b border-border/40 last:border-0"
                >
                    <span className="text-xs text-muted-foreground font-medium">{col.label}:</span>
                    <span className="font-medium text-foreground text-right text-xs">
                        {col.key === 'seats_left' && row.seats_badge ? (
                            <div className="flex items-center justify-end gap-1.5">
                                <span className="tabular-nums">{String(row[col.key] ?? '—')}</span>
                                <StatusBadge status={String(row.seats_badge)} />
                            </div>
                        ) : col.key === 'start_date' && row.is_starting_soon ? (
                            <div className="flex items-center justify-end gap-1.5">
                                <span className="tabular-nums">{String(row[col.key] ?? '—').split('T')[0]}</span>
                                <StatusBadge status="Starting Soon" />
                            </div>
                        ) : col.format === 'money' ? (
                            <MoneyText
                                amount={parseFloat(String(row[col.key] || 0)) || 0}
                                currency={(col.currency as 'LKR' | 'USD') || 'LKR'}
                                weight="medium"
                            />
                        ) : col.format === 'badge' ? (
                            <StatusBadge status={String(row[col.key] || '')} />
                        ) : (
                            String(row[col.key] ?? '—')
                        )}
                    </span>
                </div>
            ))}
        </Card>
    );

    const selectFilters = useMemo(
        () => report.filters.filter((f) => f.type === 'select'),
        [report.filters],
    );

    const hasDateRangeFilter = useMemo(
        () => report.filters.some((f) => f.type === 'date_range'),
        [report.filters],
    );

    return (
        <AppLayout
            title={report.title}
            breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Reports', href: '/reports' },
                { label: report.title },
            ]}
        >
            <Head title={report.title} />

            <div className="w-full max-w-full space-y-6">
                <PageHeader
                    title={report.title}
                    description={report.description}
                    actions={
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 gap-1.5"
                                            disabled={isLoading}
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            Export
                                            <ChevronDown className="h-3 w-3 opacity-60" />
                                        </Button>
                                    }
                                />
                                <DropdownMenuContent align="end" className="w-52">
                                    <DropdownMenuLabel>Export Report</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => handleExport('csv')}
                                    >
                                        <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
                                        <span>Export as CSV (.csv)</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => handleExport('excel')}
                                    >
                                        <FileText className="h-4 w-4 mr-2 text-blue-600" />
                                        <span>Export as Excel (.xlsx)</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => handleExport('pdf')}
                                    >
                                        <FileCode className="h-4 w-4 mr-2 text-rose-600" />
                                        <span>Export as PDF (.pdf)</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-1.5"
                                onClick={() => router.reload()}
                                disabled={isLoading}
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    }
                />

                {/* Summary Metric Tiles */}
                {initialData.summary && initialData.summary.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {initialData.summary.map((tile) => (
                            <Card key={tile.key} className="p-4 bg-card border-border shadow-xs">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {tile.label}
                                </p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    {isLoading ? (
                                        <Skeleton className="h-8 w-28" />
                                    ) : tile.format === 'money' ? (
                                        <MoneyText
                                            amount={parseFloat(String(tile.value)) || 0}
                                            currency={(tile.currency as 'LKR' | 'USD') || 'LKR'}
                                            size="xl"
                                            weight="bold"
                                        />
                                    ) : tile.format === 'percentage' ? (
                                        <span className="text-2xl font-bold tracking-tight text-foreground">
                                            {tile.value}%
                                        </span>
                                    ) : (
                                        <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                                            {typeof tile.value === 'number'
                                                ? tile.value.toLocaleString()
                                                : tile.value}
                                        </span>
                                    )}
                                </div>
                                {tile.helpText && (
                                    <p className="text-xs text-muted-foreground mt-1.5">{tile.helpText}</p>
                                )}
                            </Card>
                        ))}
                    </div>
                )}

                {/* Filter Bar with Presets */}
                <Card className="p-4 bg-card border-border shadow-xs space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                            {hasDateRangeFilter && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>Preset:</span>
                                    </div>
                                    <Select
                                        value={activePreset}
                                        onValueChange={handlePresetChange}
                                    >
                                        <SelectTrigger className="w-[145px] h-9 text-xs">
                                            <SelectValue placeholder="Select Range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="today">Today</SelectItem>
                                            <SelectItem value="this_week">This Week</SelectItem>
                                            <SelectItem value="this_month">This Month</SelectItem>
                                            <SelectItem value="last_month">Last Month</SelectItem>
                                            <SelectItem value="this_quarter">This Quarter</SelectItem>
                                            <SelectItem value="this_year">This Year</SelectItem>
                                            <SelectItem value="custom">Custom Range</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {activePreset === 'custom' && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="w-[135px] h-9 text-xs"
                                        aria-label="Start date"
                                    />
                                    <span className="text-xs text-muted-foreground">to</span>
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="w-[135px] h-9 text-xs"
                                        aria-label="End date"
                                    />
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 text-xs"
                                        onClick={handleApplyCustomDates}
                                    >
                                        Apply
                                    </Button>
                                </div>
                            )}

                            {selectFilters.map((filter) => (
                                <div key={filter.name} className="flex items-center gap-1.5">
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {filter.label}:
                                    </span>
                                    <Select
                                        value={String(filters[filter.name] || '')}
                                        onValueChange={(val) => handleFilterChange(filter.name, val)}
                                    >
                                        <SelectTrigger className="w-[145px] h-9 text-xs">
                                            <SelectValue placeholder={filter.label} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filter.options?.map((opt) => (
                                                <SelectItem key={String(opt.value)} value={String(opt.value)}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>

                        {hasActiveFilters && (
                            <div className="flex items-center justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 text-xs text-muted-foreground hover:text-foreground"
                                    onClick={handleResetFilters}
                                >
                                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                    Reset Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Error State */}
                {hasError && (
                    <ErrorState
                        icon={AlertTriangle}
                        title="Failed to load report data"
                        description="An error occurred while fetching report details. Please try again or adjust your filters."
                        retryLabel="Retry"
                        onRetry={() => router.reload()}
                    />
                )}

                {/* Table or Empty State */}
                {!hasError && (
                    initialData.total === 0 && !hasActiveFilters && !isLoading ? (
                        <EmptyState
                            icon={BarChart3}
                            title="No records found"
                            description="There are currently no records available for this report."
                        />
                    ) : (
                        <div className="space-y-4">
                            <DataTable
                                columns={tableColumns}
                                data={initialData.data as ReportRow[]}
                                tableKey={`report_${report.key}`}
                                total={initialData.total}
                                from={initialData.from || undefined}
                                to={initialData.to || undefined}
                                links={initialData.links}
                                filters={filters}
                                savedFilters={savedFilters}
                                isLoading={isLoading}
                                mobileCard={mobileCard}
                                searchable={report.filters.some((f) => f.name === 'search')}
                            />
                        </div>
                    )
                )}
            </div>
        </AppLayout>
    );
}
