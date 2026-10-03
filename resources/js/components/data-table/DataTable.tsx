import React, { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    ColumnDef,
    SortingState,
    VisibilityState as ColumnVisibilityState,
    RowData,
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

interface DataTableProps<TData extends Record<string, any>, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    mobileCard?: (row: TData) => React.ReactNode;
    tableKey: string; // unique key for localStorage and saved filters
    total: number;
    links?: { url: string | null; label: string; active: boolean }[];
    from?: number;
    to?: number;
    searchable?: boolean;
    filters?: Record<string, any>;
    savedFilters?: any[]; // For the "Views" dropdown
    isLoading?: boolean;
    bulkActions?: {
        label: string;
        icon?: React.FC<any>;
        variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
        onClick: (selectedIds: (string | number)[]) => void;
    }[];
}

export function DataTable<TData extends Record<string, any> & { id: number | string }, TValue>({
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
}: DataTableProps<TData, TValue>) {
    // Sort & Filters from URL props
    const [sorting, setSorting] = useState<SortingState>(
        filters.sort ? [{ id: filters.sort, desc: filters.direction === 'desc' }] : [],
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
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const applyFilters = useCallback(
        (newParams: any = {}) => {
            const query = {
                ...filters,
                ...newParams,
            };
            // Clean up empty params
            Object.keys(query).forEach((key) => {
                if (query[key] === null || query[key] === '' || query[key] === undefined) {
                    delete query[key];
                }
            });

            router.get(window.location.pathname, query, {
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
            if (searchTerm !== filters.search) {
                applyFilters({ search: searchTerm, page: 1 });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Update Sorting
    useEffect(() => {
        if (sorting.length > 0) {
            const sortField = sorting[0].id;
            const sortDir = sorting[0].desc ? 'desc' : 'asc';
            if (sortField !== filters.sort || sortDir !== filters.direction) {
                applyFilters({ sort: sortField, direction: sortDir });
            }
        }
    }, [sorting]);

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
            router.reload({ preserveState: true, preserveScroll: true } as any);
        } catch (e) {
            toast.error('Failed to save filter view');
        }
    };

    const handleDeleteFilter = async (id: number) => {
        try {
            await axios.delete(route('saved-filters.destroy', id as any));
            toast.success('Filter view deleted');
            router.reload({ preserveState: true, preserveScroll: true } as any);
        } catch (e) {
            toast.error('Failed to delete filter view');
        }
    };

    const selectedRows = table.getSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => (row.original as TData).id);

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-1 items-center space-x-2 w-full">
                    {searchable && (
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 w-full lg:w-[300px]"
                            />
                        </div>
                    )}

                    {/* Saved Filters Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button variant="outline" size="sm" className="ml-auto hidden h-9 lg:flex">
                                    <Bookmark className="mr-2 h-4 w-4" />
                                    Views
                                </Button>
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
                                            className="h-4 w-4 mr-2 text-muted-foreground hover:text-destructive cursor-pointer opacity-0 group-hover:opacity-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteFilter(sf.id);
                                            }}
                                        />
                                    </div>
                                ))
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSaveFilter}>
                                <Plus className="mr-2 h-4 w-4" /> Save Current View
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Columns Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button variant="outline" size="sm" className="ml-auto h-9">
                                    <Settings2 className="mr-2 h-4 w-4" />
                                    Columns
                                </Button>
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
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id.replace(/_/g, ' ')}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedRows.length > 0 && bulkActions.length > 0 && (
                <div className="bg-muted p-2 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-medium ml-2">{selectedRows.length} selected</span>
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
                                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                                    {action.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Mobile View */}
            {mobileCard && (
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : data.length === 0 ? (
                        <EmptyState
                            title="No records found"
                            description="Adjust your filters or create a new record."
                            onAction={() => applyFilters({ search: '', status: '' })}
                            actionLabel="Clear Filters"
                        />
                    ) : (
                        data.map((row, i) => <div key={row.id || i}>{mobileCard(row)}</div>)
                    )}
                </div>
            )}

            {/* Desktop Table */}
            <div className={`rounded-md border ${mobileCard ? 'hidden md:block' : 'block'}`}>
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
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
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing <span className="font-medium">{from || 0}</span> to{' '}
                        <span className="font-medium">{to || 0}</span> of <span className="font-medium">{total}</span>{' '}
                        results
                    </div>
                    <div className="flex space-x-2">
                        {links.map((link, index) => {
                            const isPrevious = index === 0;
                            const isNext = index === links.length - 1;

                            if (link.url === null) {
                                return (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        disabled
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }

                            return (
                                <Button
                                    key={index}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        // Extract page number from URL if possible, or just visit it
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
