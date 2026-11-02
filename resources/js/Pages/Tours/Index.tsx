import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Plus, Search, Edit, Trash2, MapPin, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader, StatusBadge, MoneyText } from '@/components/common';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { ColumnDef } from '@tanstack/react-table';
import { PaginatedData } from '@/types';

interface TourPackage {
    id: number;
    destination_id: number;
    package_name: string;
    duration_days: number;
    price: number;
    currency: string;
    status: string;
    destination?: {
        id: number;
        country: string;
        city_region: string;
    };
}

interface Destination {
    id: number;
    country: string;
    city_region: string;
}

interface IndexProps {
    tours: PaginatedData<TourPackage>;
    destinations: Destination[];
    filters: {
        search?: string;
        status?: string;
        destination?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
    };
}

export default function ToursIndex({ tours, destinations, filters }: IndexProps) {
    const { hasRole } = useAuth();

    const [searchQuery, setSearchQuery] = useState(typeof filters?.search === 'string' ? filters.search : '');
    const [statusFilter, setStatusFilter] = useState(typeof filters?.status === 'string' ? filters.status : 'all');
    const [destinationFilter, setDestinationFilter] = useState(
        typeof filters?.destination === 'string' ? filters.destination : 'all',
    );
    const [sortField] = useState(typeof filters?.sort === 'string' ? filters.sort : 'created_at');
    const [sortDirection] = useState<'asc' | 'desc'>(
        filters?.direction === 'asc' || filters?.direction === 'desc' ? filters.direction : 'desc',
    );

    const canCreate = hasRole('super_admin', 'manager', 'staff');
    const canDelete = hasRole('super_admin', 'manager');

    const applyFilters = (overrides = {}) => {
        const query: Record<string, string | undefined> = {
            search: searchQuery,
            status: statusFilter === 'all' ? undefined : statusFilter,
            destination: destinationFilter === 'all' ? undefined : destinationFilter,
            sort: sortField,
            direction: sortDirection,
            ...overrides,
        };

        Object.keys(query).forEach((key) => {
            if (query[key] === undefined || query[key] === '') {
                delete query[key];
            }
        });

        router.get(route('tours.index'), query as Record<string, string>, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to archive this tour package?')) {
            router.delete(route('tours.destroy', { tour: id }), {
                preserveScroll: true,
            });
        }
    };

    const columns: ColumnDef<TourPackage>[] = [
        {
            accessorKey: 'package_name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Package" />,
            cell: ({ row }) => (
                <span className="font-semibold text-foreground">{row.getValue('package_name')}</span>
            ),
        },
        {
            id: 'destination',
            header: 'Destination',
            cell: ({ row }) => {
                const dest = row.original.destination;
                return (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="size-4 shrink-0" />
                        <span>{dest ? `${dest.city_region}, ${dest.country}` : '—'}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'duration_days',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
            cell: ({ row }) => {
                const days = row.getValue('duration_days') as number;
                return <span className="text-sm">{days ? `${days} days` : 'N/A'}</span>;
            },
        },
        {
            accessorKey: 'price',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
            cell: ({ row }) => {
                const tour = row.original;
                return (
                    <MoneyText
                        amount={Number(tour.price)}
                        currency={tour.currency as 'LKR' | 'USD' | undefined}
                    />
                );
            },
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                return <StatusBadge status={status} />;
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const tour = row.original;
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="size-4" />
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => router.visit(route('tours.show', { tour: tour.id }))}
                                >
                                    <Eye className="mr-2 size-4" /> View Details
                                </DropdownMenuItem>
                                {canCreate && (
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => router.visit(route('tours.edit', { tour: tour.id }))}
                                    >
                                        <Edit className="mr-2 size-4" /> Edit Package
                                    </DropdownMenuItem>
                                )}
                                {canDelete && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive cursor-pointer"
                                            onClick={(e: React.MouseEvent) => {
                                                e.preventDefault();
                                                handleDelete(tour.id);
                                            }}
                                        >
                                            <Trash2 className="mr-2 size-4" /> Archive
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    const mobileCard = (tour: TourPackage) => (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{tour.package_name}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="size-3" />
                        {tour.destination ? `${tour.destination.city_region}, ${tour.destination.country}` : '—'}
                    </span>
                </div>
                <StatusBadge status={tour.status} />
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{tour.duration_days ? `${tour.duration_days} days` : 'N/A'}</span>
                <div className="font-semibold text-foreground">
                    <MoneyText
                        amount={Number(tour.price)}
                        currency={tour.currency as 'LKR' | 'USD' | undefined}
                    />
                </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-border mt-1">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button variant="ghost" size="sm" className="h-8">
                                Actions <MoreHorizontal className="ml-2 size-4" />
                            </Button>
                        }
                    />
                    <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => router.visit(route('tours.show', { tour: tour.id }))}
                        >
                            <Eye className="mr-2 size-4" /> View Details
                        </DropdownMenuItem>
                        {canCreate && (
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => router.visit(route('tours.edit', { tour: tour.id }))}
                            >
                                <Edit className="mr-2 size-4" /> Edit Package
                            </DropdownMenuItem>
                        )}
                        {canDelete && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive cursor-pointer"
                                    onClick={(e: React.MouseEvent) => {
                                        e.preventDefault();
                                        handleDelete(tour.id);
                                    }}
                                >
                                    <Trash2 className="mr-2 size-4" /> Archive
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );

    return (
        <AppLayout
            title="Tour Packages"
            breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Tour Packages' }]}
        >
            <Head title="Tour Packages" />
            <div className="space-y-6">
                <PageHeader
                    title="Tour Packages"
                    description="Manage tour packages, pricing, and availability."
                    actions={
                        <div className="flex items-center gap-2">
                            <Link href={route('destinations.index')} className={buttonVariants({ variant: 'outline' })}>
                                <MapPin className="mr-2 size-4" /> Manage destinations
                            </Link>
                            {canCreate && (
                                <Link href={route('tours.create')} className={buttonVariants({ variant: 'default' })}>
                                    <Plus className="mr-2 size-4" /> New Package
                                </Link>
                            )}
                        </div>
                    }
                />

                <Card className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                        <div className="relative w-full sm:w-64 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search packages..."
                                className="pl-9 bg-background h-9 rounded-lg border text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Select
                                value={destinationFilter}
                                onValueChange={(v) => {
                                    const val = v || 'all';
                                    setDestinationFilter(val);
                                    applyFilters({ destination: val });
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[200px] h-9 bg-background">
                                    <SelectValue placeholder="All Destinations" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Destinations</SelectItem>
                                    {destinations.map((dest) => (
                                        <SelectItem key={dest.id} value={dest.id.toString()}>
                                            {dest.city_region}, {dest.country}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={statusFilter}
                                onValueChange={(v) => {
                                    const val = v || 'all';
                                    setStatusFilter(val);
                                    applyFilters({ status: val });
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[150px] h-9 bg-background">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>

                <DataTable
                    columns={columns}
                    data={tours.data}
                    tableKey="tours"
                    total={tours.total || 0}
                    links={tours.links}
                    from={tours.from}
                    to={tours.to}
                    filters={filters as Record<string, unknown>}
                    mobileCard={mobileCard}
                    searchable={false}
                />
            </div>
        </AppLayout>
    );
}
