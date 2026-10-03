import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Trash, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { MoneyText, StatusBadge, PageHeader } from '@/components/common';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { ColumnDef } from '@tanstack/react-table';

import { PaginatedData, Payment } from '@/types';

interface PaymentsIndexProps {
    payments: PaginatedData<Payment & { customer?: any; booking?: any }>;
    filters: Record<string, any>;
    savedFilters: any[];
}

export default function PaymentsIndex({ payments, filters, savedFilters = [] }: PaymentsIndexProps) {
    const { hasRole } = useAuth();
    const canDelete = hasRole('super_admin', 'manager', 'finance');

    const handleVoid = (id: number) => {
        if (confirm('Are you sure you want to void this payment? This will revert the booking balance.')) {
            router.delete(route('payments.destroy', { payment: id }));
        }
    };

    const columns: ColumnDef<Payment & { customer?: any; booking?: any }>[] = [
        {
            accessorKey: 'payment_date',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
            cell: ({ row }) => <span className="whitespace-nowrap">{row.getValue('payment_date')}</span>,
        },
        {
            accessorKey: 'receipt_number',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Reference" />,
            cell: ({ row }) => {
                const p = row.original;
                return (
                    <span className="font-medium text-muted-foreground">
                        {p.receipt_number || p.reference_number || `RCP-${p.id}`}
                    </span>
                );
            },
        },
        {
            id: 'booking',
            header: 'Booking',
            cell: ({ row }) => {
                const p = row.original;
                return (
                    <Link
                        href={route('bookings.show', { booking: p.booking_id })}
                        className="text-primary hover:underline font-medium"
                    >
                        {p.booking?.booking_reference || `BKG-${p.booking_id}`}
                    </Link>
                );
            },
        },
        {
            id: 'customer',
            header: 'Customer',
            cell: ({ row }) => {
                const customer = row.original.customer;
                return (
                    <span className="font-medium">
                        {customer?.full_name || `${customer?.first_name} ${customer?.last_name}`}
                    </span>
                );
            },
        },
        {
            accessorKey: 'payment_method',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Method" />,
            cell: ({ row }) => (
                <span className="capitalize">{String(row.getValue('payment_method')).replace('_', ' ')}</span>
            ),
        },
        {
            accessorKey: 'amount',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
            cell: ({ row }) => (
                <MoneyText amount={Number(row.getValue('amount'))} currency={row.original.currency as 'LKR' | 'USD'} />
            ),
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                return (
                    <StatusBadge type="payment" status={(status.charAt(0).toUpperCase() + status.slice(1)) as any} />
                );
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const payment = row.original;
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
                                {canDelete && payment.status !== 'failed' && (
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive cursor-pointer"
                                        onClick={() => handleVoid(payment.id)}
                                    >
                                        <Trash className="mr-2 h-4 w-4" /> Void Payment
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    const mobileCard = (payment: Payment & { customer?: any; booking?: any }) => (
        <div className="rounded-lg border bg-card p-4 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="font-semibold">
                        {payment.receipt_number || payment.reference_number || `RCP-${payment.id}`}
                    </span>
                    <span className="text-xs text-muted-foreground">{payment.payment_date}</span>
                </div>
                <StatusBadge
                    type="payment"
                    status={(payment.status.charAt(0).toUpperCase() + payment.status.slice(1)) as any}
                />
            </div>
            <div className="text-sm">
                <div className="font-medium">{payment.customer?.full_name}</div>
                <div className="text-muted-foreground capitalize">
                    Booking:{' '}
                    <Link
                        href={route('bookings.show', { booking: payment.booking_id })}
                        className="text-primary hover:underline"
                    >
                        {payment.booking?.booking_reference || `BKG-${payment.booking_id}`}
                    </Link>{' '}
                    • {payment.payment_method?.replace('_', ' ')}
                </div>
            </div>
            <div className="flex justify-between items-center mt-2 border-t pt-2">
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                    <MoneyText amount={Number(payment.amount)} currency={payment.currency as 'LKR' | 'USD'} />
                </div>
                {canDelete && payment.status !== 'failed' && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVoid(payment.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash className="mr-2 h-4 w-4" /> Void
                    </Button>
                )}
            </div>
        </div>
    );

    return (
        <AppLayout
            title="Payments"
            breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Payments' }]}
        >
            <Head title="Payments" />
            <div className="space-y-6">
                <PageHeader
                    title="Payments"
                    description="Record, track, and manage customer payments and financial transactions."
                />

                <DataTable
                    columns={columns}
                    data={payments.data}
                    tableKey="payments"
                    total={payments.total || 0}
                    links={payments.links}
                    from={payments.from}
                    to={payments.to}
                    filters={filters}
                    savedFilters={savedFilters}
                    mobileCard={mobileCard}
                    bulkActions={[]}
                />
            </div>
        </AppLayout>
    );
}
