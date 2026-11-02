import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Plus, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader, MoneyText, StatusBadge } from '@/components/common';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { ColumnDef } from '@tanstack/react-table';
import { PaginatedData, Refund } from '@/types';

interface RefundsIndexProps {
    refunds: PaginatedData<Refund>;
    filters: Record<string, unknown>;
    statuses: { value: string; label: string }[];
}

export default function RefundsIndex({ refunds, filters, statuses }: RefundsIndexProps) {
    const { hasRole } = useAuth();
    const canRequest = hasRole('super_admin', 'manager', 'finance');

    const columns: ColumnDef<Refund>[] = [
        {
            accessorKey: 'refund_number',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Refund #" />,
            cell: ({ row }) => (
                <Link
                    href={route('refunds.show', { refund: row.original.id })}
                    className="font-mono font-medium text-xs text-primary hover:underline"
                >
                    {row.getValue('refund_number')}
                </Link>
            ),
        },
        {
            accessorKey: 'booking',
            header: 'Booking',
            cell: ({ row }) => {
                const r = row.original;
                return (
                    <Link
                        href={route('bookings.show', { booking: r.booking_id })}
                        className="text-primary hover:underline font-medium text-xs"
                    >
                        {r.booking?.booking_reference || `BKG-${r.booking_id}`}
                    </Link>
                );
            },
        },
        {
            accessorKey: 'customer',
            header: 'Customer',
            cell: ({ row }) => {
                const c = row.original.customer;
                return (
                    <span className="font-medium text-foreground">
                        {c?.full_name || '—'}
                    </span>
                );
            },
        },
        {
            accessorKey: 'amount',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
            cell: ({ row }) => {
                const r = row.original;
                return (
                    <div className="font-medium whitespace-nowrap">
                        <MoneyText amount={Number(r.amount)} currency={r.currency as 'LKR' | 'USD' | undefined} />
                        {r.currency !== 'LKR' && (
                            <div className="text-[11px] text-muted-foreground">
                                <MoneyText amount={Number(r.amount_lkr)} currency="LKR" />
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'cancellation_charge',
            header: 'Fee',
            cell: ({ row }) => {
                const fee = Number(row.original.cancellation_charge || 0);
                return fee > 0 ? (
                    <MoneyText amount={fee} currency={row.original.currency as 'LKR' | 'USD' | undefined} />
                ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                );
            },
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                const status = String(row.getValue('status'));
                return <StatusBadge status={status} />;
            },
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Requested" />,
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {String(row.getValue('created_at')).split('T')[0]}
                </span>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        size="sm"
                        render={
                            <Link href={route('refunds.show', { refund: row.original.id })}>
                                <Eye className="mr-1.5 size-3.5" /> View
                            </Link>
                        }
                    />
                </div>
            ),
        },
    ];

    const mobileCard = (r: Refund) => (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm flex flex-col gap-2.5">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <Link
                        href={route('refunds.show', { refund: r.id })}
                        className="font-mono text-xs font-semibold text-primary hover:underline"
                    >
                        {r.refund_number}
                    </Link>
                    <span className="text-sm font-medium text-foreground">{r.customer?.full_name}</span>
                </div>
                <StatusBadge status={r.status} />
            </div>
            <div className="text-xs text-muted-foreground flex justify-between">
                <span>Booking: {r.booking?.booking_reference || `BKG-${r.booking_id}`}</span>
                <span>{String(r.created_at).split('T')[0]}</span>
            </div>
            <div className="flex justify-between items-center border-t border-border pt-2 mt-1">
                <div>
                    <div className="font-bold text-foreground">
                        <MoneyText amount={Number(r.amount)} currency={r.currency as 'LKR' | 'USD' | undefined} />
                    </div>
                    {r.currency !== 'LKR' && (
                        <div className="text-[11px] text-muted-foreground">
                            ≈ <MoneyText amount={Number(r.amount_lkr)} currency="LKR" />
                        </div>
                    )}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    render={
                        <Link href={route('refunds.show', { refund: r.id })}>
                            <Eye className="mr-1 size-3.5" /> Details
                        </Link>
                    }
                />
            </div>
        </div>
    );

    return (
        <AppLayout
            title="Refunds"
            breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Refunds' }]}
        >
            <Head title="Refunds" />
            <div className="space-y-6">
                <PageHeader
                    title="Refunds"
                    description="Track and manage customer refund requests, manager approvals, and settlements."
                    actions={
                        canRequest && (
                            <Link
                                href={route('refunds.create')}
                                className={buttonVariants({ variant: 'default' }) + ' shrink-0 gap-2'}
                            >
                                <Plus className="size-4" />
                                <span className="hidden sm:inline">Request Refund</span>
                            </Link>
                        )
                    }
                />

                <DataTable
                    columns={columns}
                    data={refunds.data}
                    tableKey="refunds"
                    total={refunds.total || 0}
                    links={refunds.links}
                    from={refunds.from}
                    to={refunds.to}
                    filters={filters}
                    mobileCard={mobileCard}
                />
            </div>
        </AppLayout>
    );
}
