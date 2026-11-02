import React, { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
    type VisibilityState as ColumnVisibilityState,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Search, Settings2, Bookmark, Trash, Loader2, Plus } from 'lucide-react';
import { EmptyState } from '@/components/common';
import axios from 'axios';
import { toast } from 'sonner';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    mobileCard?: (row: TData) => React.ReactNode;
    tableKey: string; // unique key for localStorage and saved filters
    total: number;
    links?: { url: string | null; label: string; active: boolean }[];
    from?: number;
    to?: number;
    searchable?: boolean;
    filters?: Record<string, unknown>;
    savedFilters?: Array<{ id: number; name: string; filters: Record<string, unknown> }>; // For the "Views" dropdown
    isLoading?: boolean;
    bulkActions?: {
        label: string;
        icon?: React.ComponentType<{ className?: string }>;
        variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
        onClick: (selectedIds: (string | number)[]) => void;
    }[];
    title?: string;
    actions?: React.ReactNode;
}

export function DataTable<TData extends { id?: string | number }, TValue>({
    columns,
    data,
    mobileCard,
    tableKey,
    total,
    links,
    from,
    to,
    searchable = true,
    filters = {},
    savedFilters = [],
    isLoading = false,
    bulkActions = [],
    title,
    actions,
}: DataTableProps<TData, TValue>) {
    // Sort & Filters from URL props
    const [sorting, setSorting] = useState<SortingState>(
        filters.sort && typeof filters.sort === 'string'
            ? [{ id: filters.sort, desc: filters.direction === 'desc' }]
            : [],
    );
    const [rowSelection, setRowSelection] = useState({});

    // Column Visibility from LocalStorage
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(() => {
        const saved = localStorage.getItem(`dt_vis_${tableKey}`);
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem(`dt_vis_${tableKey}`, JSON.stringify(columnVisibility));
    }, [columnVisibility, tableKey]);

    // Search
    const [searchTerm, setSearchTerm] = useState(
        typeof filters.search === 'string' ? filters.search : '',
    );

    const applyFilters = useCallback(
        (newParams: Record<string, unknown> = {}) => {
            const query: Record<string, unknown> = {
                ...filters,
                ...newParams,
            };
            // Clean up empty params
            Object.keys(query).forEach((key) => {
                if (query[key] === null || query[key] === '' || query[key] === undefined) {
                    delete query[key];
                }
            });

            router.get(window.location.pathname, query as Record<string, string>, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [filters],
    );

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                applyFilters({ search: searchTerm, page: 1 });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, filters.search, applyFilters]);

    // Update Sorting
    useEffect(() => {
        if (sorting.length > 0) {
            const sortField = sorting[0].id;
            const sortDir = sorting[0].desc ? 'desc' : 'asc';
            if (sortField !== filters.sort || sortDir !== filters.direction) {
                applyFilters({ sort: sortField, direction: sortDir });
            }
        }
    }, [sorting, filters.sort, filters.direction, applyFilters]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
        },
        manualSorting: true,
        manualPagination: true,
    });

    const handleSaveFilter = async () => {
        const name = prompt('Enter a name for this view:');
        if (!name) return;

        try {
            await axios.post(route('saved-filters.store'), {
                table_key: tableKey,
                name: name,
                filters: filters,
            });
            toast.success('Filter view saved successfully');
            router.reload();
        } catch {
            toast.error('Failed to save filter view');
        }
    };

    const handleDeleteFilter = async (id: number) => {
        try {
            await axios.delete(route('saved-filters.destroy', { id }));
            toast.success('Filter view deleted');
            router.reload();
        } catch {
            toast.error('Failed to delete filter view');
        }
    };

    const selectedRows = table.getSelectedRowModel().rows;
    const selectedIds = selectedRows
        .map((row) => (row.original as { id?: string | number }).id)
        .filter((id): id is string | number => id !== undefined);

    return (
        <div className="space-y-4">
            {/* Bulk Actions Bar */}
            {selectedRows.length > 0 && bulkActions.length > 0 && (
                <div className="bg-muted p-2.5 rounded-lg flex items-center justify-between border border-border">
                    <span className="text-sm font-medium ml-2 text-foreground">{selectedRows.length} selected</span>
                    <div className="flex gap-2">
                        {bulkActions.map((action, i) => {
                            const Icon = action.icon;
                            return (
                                <Button
                                    key={i}
                                    variant={action.variant || 'secondary'}
                                    size="sm"
                                    onClick={() => {
                                        action.onClick(selectedIds);
                                        setRowSelection({});
                                    }}
                                >
                                    {Icon && <Icon className="mr-1.5 size-4" />}
                                    {action.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Main Wrapper */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="px-6 py-4 border-b border-border bg-muted/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    {title ? (
                        <div className="font-bold text-base text-foreground tracking-tight">{title}</div>
                    ) : (
                        <div />
                    )}

                    <div className="flex flex-1 items-center justify-between sm:justify-end gap-2 w-full">
                        {searchable && (
                            <div className="relative w-full sm:w-64 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-9 w-full bg-background rounded-lg border text-sm"
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            {/* Saved Filters Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <button
                                            type="button"
                                            className="h-9 px-3 rounded-md border border-border bg-card text-foreground text-sm font-medium shadow-sm gap-1 hover:bg-muted transition-colors hidden lg:inline-flex items-center focus-visible:outline-none focus-visible:ring-2 ring-ring cursor-pointer"
                                        >
                                            <Bookmark className="size-4 text-muted-foreground" />
                                            <span>Views</span>
                                        </button>
                                    }
                                />
                                <DropdownMenuContent align="end" className="w-[200px]">
                                    <DropdownMenuLabel>Saved Views</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {savedFilters.length === 0 ? (
                                        <DropdownMenuItem disabled>No saved views</DropdownMenuItem>
                                    ) : (
                                        savedFilters.map((sf) => (
                                            <div key={sf.id} className="flex items-center justify-between group">
                                                <DropdownMenuItem
                                                    className="flex-1 cursor-pointer"
                                                    onClick={() => applyFilters(sf.filters)}
                                                >
                                                    {sf.name}
                                                </DropdownMenuItem>
                                                <Trash
                                                    className="size-4 mr-2 text-muted-foreground hover:text-destructive cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteFilter(sf.id);
                                                    }}
                                                />
                                            </div>
                                        ))
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleSaveFilter} className="cursor-pointer">
                                        <Plus className="mr-2 size-4" /> Save Current View
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Columns Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <button
                                            type="button"
                                            className="h-9 px-3 rounded-md border border-border bg-card text-foreground text-sm font-medium shadow-sm gap-1 hover:bg-muted transition-colors inline-flex items-center focus-visible:outline-none focus-visible:ring-2 ring-ring cursor-pointer"
                                        >
                                            <Settings2 className="size-4 text-muted-foreground" />
                                            <span>Columns</span>
                                        </button>
                                    }
                                />
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {table
                                        .getAllColumns()
                                        .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
                                        .map((column) => {
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={column.id}
                                                    className="capitalize cursor-pointer"
                                                    checked={column.getIsVisible()}
                                                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                                >
                                                    {column.id.replace(/_/g, ' ')}
                                                </DropdownMenuCheckboxItem>
                                            );
                                        })}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {actions}
                        </div>
                    </div>
                </div>

                {/* Mobile View */}
                {mobileCard && (
                    <div className="p-4 md:hidden">
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : data.length === 0 ? (
                            <EmptyState
                                title="No records found"
                                description="Adjust your filters or create a new record."
                                onAction={() => applyFilters({ search: '', status: '' })}
                                actionLabel="Clear Filters"
                            />
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {data.map((row, i) => (
                                    <div key={row.id || i}>{mobileCard(row)}</div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Desktop Table View */}
                <div className={`relative w-full overflow-x-auto ${mobileCard ? 'hidden md:block' : 'block'}`}>
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        <EmptyState title="No results." description="No records matched your search." />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination Controls */}
            {total > 0 && links && links.length > 3 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                    <div className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{from || 0}</span> to{' '}
                        <span className="font-medium text-foreground">{to || 0}</span> of{' '}
                        <span className="font-medium text-foreground">{total}</span> results
                    </div>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        {links.map((link, index) => {
                            if (link.url === null) {
                                return (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        disabled
                                        className="h-8 px-3 text-xs"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }

                            return (
                                <Button
                                    key={index}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-8 px-3 text-xs"
                                    onClick={() => {
                                        router.visit(link.url!, { preserveState: true, preserveScroll: true });
                                    }}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
