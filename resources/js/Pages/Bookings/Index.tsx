import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Eye, Edit, Trash2, CalendarCheck, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader, MoneyText, StatusBadge } from '@/components/common';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { ColumnDef } from '@tanstack/react-table';

import { PaginatedData, Booking } from '@/types';

interface BookingIndexProps {
    bookings: PaginatedData<Booking>;
    filters: Record<string, any>;
    savedFilters: any[];
}

export default function BookingIndex({ bookings, filters, savedFilters = [] }: BookingIndexProps) {
    const { hasRole } = useAuth();
    const canCreate = hasRole('super_admin', 'manager', 'staff');
    const canDelete = hasRole('super_admin', 'manager');

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to archive this booking?')) {
            router.delete(route('bookings.destroy', { booking: id }));
        }
    };

    const columns: ColumnDef<Booking>[] = [
        {
            accessorKey: 'booking_reference',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Reference" />,
            cell: ({ row }) => <span className="font-medium text-muted-foreground">{row.getValue('booking_reference')}</span>,
        },
        {
            id: 'customer',
            header: 'Customer',
            cell: ({ row }) => {
                const customer: any = row.original.customer;
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{customer?.first_name} {customer?.last_name}</span>
                        {customer?.email && <span className="text-xs text-muted-foreground">{customer.email}</span>}
                    </div>
                );
            }
        },
        {
            id: 'tourPackage',
            header: 'Package',
            cell: ({ row }) => {
                const pkg: any = row.original.tour_package;
                return <span className="font-medium">{pkg?.name}</span>;
            }
        },
        {
            accessorKey: 'travel_date',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Travel Date" />,
            cell: ({ row }) => <span className="whitespace-nowrap">{row.getValue('travel_date')}</span>,
        },
        {
            accessorKey: 'number_of_travelers',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Travelers" />,
            cell: ({ row }) => <span>{row.getValue('number_of_travelers')}</span>,
        },
        {
            accessorKey: 'final_amount',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
            cell: ({ row }) => <MoneyText amount={Number(row.getValue('final_amount'))} currency={row.original.currency as "LKR" | "USD" | undefined} />,
        },
        {
            accessorKey: 'booking_status',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                const status = row.getValue('booking_status') as string;
                return <StatusBadge type="booking" status={(status.charAt(0).toUpperCase() + status.slice(1)) as any} />;
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const booking = row.original;
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.visit(route('bookings.show', { booking: booking.id }))}>
                                    <Eye className="mr-2 h-4 w-4" /> View Booking
                                </DropdownMenuItem>
                                {canCreate && (
                                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.visit(route('bookings.edit', { booking: booking.id }))}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit Details
                                    </DropdownMenuItem>
                                )}
                                {canDelete && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive cursor-pointer"
                                            onClick={() => handleDelete(booking.id)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Archive
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        }
    ];

    const mobileCard = (booking: Booking) => (
        <div className="rounded-lg border bg-card p-4 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="font-semibold">{booking.booking_reference}</span>
                    <span className="text-xs text-muted-foreground">{booking.customer?.first_name} {booking.customer?.last_name}</span>
                </div>
                <StatusBadge type="booking" status={(booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)) as any} />
            </div>
            <div className="text-sm">
                <div className="font-medium">{booking.tour_package?.name}</div>
                <div className="text-muted-foreground">{booking.travel_date} • {booking.number_of_travelers} travelers</div>
            </div>
            <div className="flex justify-between items-center mt-2 border-t pt-2">
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                    <MoneyText amount={Number(booking.final_amount)} currency={booking.currency as "LKR" | "USD" | undefined} />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button variant="ghost" size="sm" className="h-8">
                                Actions <MoreHorizontal className="ml-2 h-4 w-4" />
                            </Button>
                        }
                    />
                    <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.visit(route('bookings.show', { booking: booking.id }))}>
                            <Eye className="mr-2 h-4 w-4" /> View Booking
                        </DropdownMenuItem>
                        {canCreate && (
                            <DropdownMenuItem className="cursor-pointer" onClick={() => router.visit(route('bookings.edit', { booking: booking.id }))}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                        )}
                        {canDelete && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive cursor-pointer"
                                    onClick={() => handleDelete(booking.id)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Archive
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
            title="Bookings"
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Bookings' },
            ]}
        >
            <Head title="Bookings" />
            <div className="space-y-6">
                <PageHeader
                    title="Bookings"
                    description="Manage tour and travel bookings."
                    actions={
                        canCreate && (
                            <Link href={route('bookings.create')} className={buttonVariants({ variant: 'default' }) + " shrink-0 gap-2"}>
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">New Booking</span>
                            </Link>
                        )
                    }
                />

                <DataTable
                    columns={columns}
                    data={bookings.data}
                    tableKey="bookings"
                    total={bookings.total || 0}
                    links={bookings.links}
                    from={bookings.from}
                    to={bookings.to}
                    filters={filters}
                    savedFilters={savedFilters}
                    mobileCard={mobileCard}
                    bulkActions={
                        canDelete ? [
                            {
                                label: 'Archive Selected',
                                icon: Trash2,
                                variant: 'destructive',
                                onClick: (ids) => {
                                    if (confirm(`Archive ${ids.length} bookings?`)) {
                                        console.log("Archive ids:", ids);
                                    }
                                }
                            }
                        ] : []
                    }
                />
            </div>
        </AppLayout>
    );
}
