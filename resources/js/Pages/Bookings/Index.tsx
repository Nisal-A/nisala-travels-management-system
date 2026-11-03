import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Plus,
    Eye,
    Edit,
    Trash2,
    MoreHorizontal,
    ExternalLink,
    Users,
    Calendar,
    MapPin,
    CreditCard,
    FileCheck2,
    Building2,
    Download,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader, MoneyText, StatusBadge } from '@/components/common';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { ColumnDef } from '@tanstack/react-table';

import { PaginatedData, Booking, PackageCostLine } from '@/types';

interface BookingIndexProps {
    bookings: PaginatedData<Booking>;
    filters: Record<string, unknown>;
    savedFilters: { id: number; name: string; filters: Record<string, unknown> }[];
}

function getCustomerDisplayName(booking: Booking): string {
    const customer = booking.customer;
    if (!customer) return 'Unknown Customer';
    if (customer.full_name) return customer.full_name;
    const combined = `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim();
    return combined || 'Unknown Customer';
}

function getPackageDisplayName(booking: Booking): string {
    const pkg = booking.tour_package;
    if (!pkg) return 'Custom Tour Package';
    return pkg.name || pkg.package_name || 'Custom Tour Package';
}

export default function BookingIndex({ bookings, filters, savedFilters = [] }: BookingIndexProps) {
    const { hasRole } = useAuth();
    const canCreate = hasRole('super_admin', 'manager', 'staff');
    const canDelete = hasRole('super_admin', 'manager');

    const [inspectedBooking, setInspectedBooking] = useState<Booking | null>(null);

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to archive this booking?')) {
            router.delete(route('bookings.destroy', { booking: id }));
        }
    };

    const handleInspect = (booking: Booking) => {
        setInspectedBooking(booking);
    };

    const columns: ColumnDef<Booking>[] = [
        {
            accessorKey: 'booking_reference',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Reference" />,
            cell: ({ row }) => {
                const booking = row.original;
                return (
                    <button
                        type="button"
                        onClick={() => handleInspect(booking)}
                        className="font-mono text-xs font-bold text-[#0E2A47] dark:text-[#F59E0B] hover:underline cursor-pointer text-left"
                    >
                        {row.getValue('booking_reference')}
                    </button>
                );
            },
        },
        {
            id: 'customer',
            header: 'Customer',
            cell: ({ row }) => {
                const booking = row.original;
                const customer = booking.customer;
                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{getCustomerDisplayName(booking)}</span>
                        {customer?.email && <span className="text-xs text-muted-foreground">{customer.email}</span>}
                    </div>
                );
            },
        },
        {
            id: 'tourPackage',
            header: 'Package',
            cell: ({ row }) => {
                return <span className="font-medium text-foreground">{getPackageDisplayName(row.original)}</span>;
            },
        },
        {
            accessorKey: 'travel_date',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Travel Date" />,
            cell: ({ row }) => <span className="whitespace-nowrap">{row.getValue('travel_date')}</span>,
        },
        {
            accessorKey: 'number_of_travelers',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Travelers" />,
            cell: ({ row }) => <span>{row.getValue('number_of_travelers')} Pax</span>,
        },
        {
            accessorKey: 'final_amount',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
            cell: ({ row }) => (
                <MoneyText
                    amount={Number(row.getValue('final_amount'))}
                    currency={row.original.currency as 'LKR' | 'USD' | undefined}
                />
            ),
        },
        {
            accessorKey: 'booking_status',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                const status = (row.getValue('booking_status') as string) || 'pending';
                return <StatusBadge type="booking" status={status.charAt(0).toUpperCase() + status.slice(1)} />;
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const booking = row.original;
                return (
                    <div className="flex items-center justify-end gap-1" data-no-row-click>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleInspect(booking)}
                            title="Quick Inspect Slide-Over"
                            className="h-8 px-2.5 text-xs font-semibold text-[#0E2A47] dark:text-[#F59E0B] hover:bg-muted gap-1.5"
                        >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden xl:inline">Inspect</span>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end" className="w-[180px]">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => handleInspect(booking)}
                                >
                                    <Eye className="mr-2 h-4 w-4 text-[#C49A2C]" /> Quick Inspect
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => router.visit(route('bookings.show', { booking: booking.id }))}
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" /> Full Page View
                                </DropdownMenuItem>
                                {canCreate && (
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => router.visit(route('bookings.edit', { booking: booking.id }))}
                                    >
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
        },
    ];

    const mobileCard = (booking: Booking) => (
        <div
            onClick={() => handleInspect(booking)}
            className="rounded-lg border bg-card p-4 shadow-sm flex flex-col gap-3 cursor-pointer hover:border-[#C49A2C]/50 transition-colors"
        >
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="font-mono font-bold text-xs text-[#0E2A47] dark:text-[#F59E0B]">
                        {booking.booking_reference}
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5">
                        {getCustomerDisplayName(booking)}
                    </span>
                </div>
                <StatusBadge
                    type="booking"
                    status={booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                />
            </div>
            <div className="text-sm">
                <div className="font-medium">{getPackageDisplayName(booking)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                    {booking.travel_date} • {booking.number_of_travelers} travelers
                </div>
            </div>
            <div className="flex justify-between items-center mt-2 border-t pt-2" onClick={(e) => e.stopPropagation()}>
                <div className="font-semibold text-foreground">
                    <MoneyText
                        amount={Number(booking.final_amount)}
                        currency={booking.currency as 'LKR' | 'USD' | undefined}
                    />
                </div>
                <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => handleInspect(booking)}>
                        <Eye className="h-3.5 w-3.5" /> Inspect
                    </Button>
                    <Link
                        href={route('bookings.show', { booking: booking.id })}
                        className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' h-8 text-xs'}
                    >
                        Full View
                    </Link>
                </div>
            </div>
        </div>
    );

    // ── Derived Inspector Data ───────────────────────────────────────────────
    const inspectorCurrency = (inspectedBooking?.currency as 'LKR' | 'USD') || 'LKR';
    const isForeignCurrency = inspectorCurrency !== 'LKR';
    const exchangeRate = Number(inspectedBooking?.exchange_rate_to_lkr || 0);
    const finalAmount = Number(inspectedBooking?.final_amount || 0);
    const paidAmount = Number(inspectedBooking?.paid_amount || 0);
    const balanceAmount = Number(inspectedBooking?.balance_amount || 0);
    const finalAmountLkr = isForeignCurrency
        ? finalAmount * (exchangeRate > 0 ? exchangeRate : 300)
        : finalAmount;

    const customerDocs = inspectedBooking?.customer?.documents ?? [];
    const travelersList = inspectedBooking?.travelers ?? [];
    const schedulesList = inspectedBooking?.payment_schedules ?? [];
    const paymentsList = inspectedBooking?.payments ?? [];
    const packageCostLines: PackageCostLine[] =
        inspectedBooking?.tour_package?.cost_lines ??
        inspectedBooking?.tour_package?.costLines ??
        [];

    const totalSupplierCostLkr = packageCostLines.reduce((sum, line) => {
        const lineLkr = Number(line.amount_lkr || 0);
        if (lineLkr > 0) return sum + lineLkr;
        const rawAmt = Number(line.amount || 0);
        const rate = Number(line.exchange_rate_to_lkr || 1);
        return sum + rawAmt * rate;
    }, 0);

    const netMarginLkr = finalAmountLkr - totalSupplierCostLkr;
    const netMarginPct =
        finalAmountLkr > 0 ? Math.round((netMarginLkr / finalAmountLkr) * 100) : 0;

    return (
        <AppLayout
            title="Bookings"
            breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Bookings' }]}
        >
            <Head title="Bookings" />
            <div className="space-y-6">
                <PageHeader
                    title="Bookings & Reservations"
                    description="Click any booking row or the Inspect icon to open the quick slide-over inspector."
                    actions={
                        canCreate && (
                            <Link
                                href={route('bookings.create')}
                                className="inline-flex items-center gap-1.5 h-9 rounded-lg bg-[#0E2A47] hover:bg-[#0B3D91] text-white px-3.5 text-xs font-semibold shadow-xs transition-colors"
                            >
                                <Plus className="h-4 w-4 text-[#F59E0B] stroke-[2.5]" />
                                <span>+ New Booking</span>
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
                    onRowClick={handleInspect}
                    bulkActions={
                        canDelete
                            ? [
                                  {
                                      label: 'Archive Selected',
                                      icon: Trash2,
                                      variant: 'destructive',
                                      onClick: (ids) => {
                                          if (confirm(`Archive ${ids.length} bookings?`)) {
                                              console.log('Archive ids:', ids);
                                          }
                                      },
                                  },
                              ]
                            : []
                    }
                />
            </div>

            {/* Right-Side Slide-Over Detail Inspector */}
            <Sheet open={!!inspectedBooking} onOpenChange={(open) => !open && setInspectedBooking(null)}>
                <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0 flex flex-col">
                    {inspectedBooking && (
                        <>
                            {/* Drawer Header */}
                            <SheetHeader className="p-6 border-b border-border bg-muted/30 shrink-0">
                                <div className="flex items-center justify-between gap-2 pr-6">
                                    <div className="flex items-center gap-2.5">
                                        <span className="font-mono text-sm font-bold text-[#0E2A47] dark:text-[#F59E0B] bg-[#0E2A47]/10 dark:bg-[#F59E0B]/15 px-2.5 py-1 rounded-md">
                                            {inspectedBooking.booking_reference}
                                        </span>
                                        <StatusBadge
                                            type="booking"
                                            status={
                                                inspectedBooking.booking_status.charAt(0).toUpperCase() +
                                                inspectedBooking.booking_status.slice(1)
                                            }
                                        />
                                        {inspectedBooking.payment_status && (
                                            <StatusBadge type="payment" status={inspectedBooking.payment_status} />
                                        )}
                                    </div>
                                </div>

                                <SheetTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-white mt-2">
                                    {getPackageDisplayName(inspectedBooking)}
                                </SheetTitle>
                                <SheetDescription className="text-xs text-slate-600 dark:text-slate-400">
                                    Customer: <strong className="text-foreground">{getCustomerDisplayName(inspectedBooking)}</strong>
                                    {inspectedBooking.customer?.email ? ` (${inspectedBooking.customer.email})` : ''}
                                </SheetDescription>

                                {/* Quick Action Header Buttons */}
                                <div className="pt-3 flex flex-wrap items-center gap-2">
                                    <Link
                                        href={route('bookings.show', { booking: inspectedBooking.id })}
                                        className="inline-flex items-center gap-1.5 h-8 rounded-lg bg-[#0E2A47] hover:bg-[#0B3D91] text-white px-3 text-xs font-semibold transition-colors"
                                    >
                                        <span>Full Page View</span>
                                        <ExternalLink className="size-3.5 text-[#F59E0B]" />
                                    </Link>
                                    {canCreate && (
                                        <Link
                                            href={route('bookings.edit', { booking: inspectedBooking.id })}
                                            className="inline-flex items-center gap-1.5 h-8 rounded-lg border border-border bg-card hover:bg-muted px-3 text-xs font-semibold text-foreground transition-colors"
                                        >
                                            <Edit className="size-3.5" />
                                            <span>Edit Booking</span>
                                        </Link>
                                    )}
                                </div>
                            </SheetHeader>

                            {/* Drawer Body */}
                            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                                {/* 1. Overview Summary Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <div className="rounded-xl border border-border bg-card p-3.5">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                            <Calendar className="size-3.5 text-[#C49A2C]" /> Travel Date
                                        </span>
                                        <p className="text-sm font-bold text-foreground mt-1">
                                            {inspectedBooking.travel_date || 'TBD'}
                                        </p>
                                        {inspectedBooking.return_date && (
                                            <p className="text-[11px] text-muted-foreground">
                                                Return: {inspectedBooking.return_date}
                                            </p>
                                        )}
                                    </div>

                                    <div className="rounded-xl border border-border bg-card p-3.5">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                            <Users className="size-3.5 text-[#0B3D91] dark:text-blue-400" /> Pax Count
                                        </span>
                                        <p className="text-sm font-bold text-foreground mt-1">
                                            {inspectedBooking.number_of_travelers}{' '}
                                            {inspectedBooking.number_of_travelers === 1 ? 'Traveler' : 'Travelers'}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {travelersList.length} manifest records
                                        </p>
                                    </div>

                                    <div className="col-span-2 sm:col-span-1 rounded-xl border border-[#C49A2C]/40 bg-amber-50/40 dark:bg-amber-950/20 p-3.5">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1">
                                            <CreditCard className="size-3.5 text-[#C49A2C]" /> Total Price
                                        </span>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                                            <MoneyText
                                                amount={finalAmount}
                                                currency={inspectorCurrency}
                                                weight="bold"
                                            />
                                        </div>
                                        {isForeignCurrency ? (
                                            <p className="text-[10px] text-amber-800 dark:text-amber-300 mt-0.5">
                                                FX Rate: 1 {inspectorCurrency} ={' '}
                                                {exchangeRate > 0 ? exchangeRate.toFixed(2) : '300.00'} LKR
                                            </p>
                                        ) : (
                                            <p className="text-[11px] text-muted-foreground">
                                                Paid:{' '}
                                                <MoneyText
                                                    amount={paidAmount}
                                                    currency={inspectorCurrency}
                                                    size="sm"
                                                />
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* 2. Traveler Documents Section */}
                                <div className="rounded-xl border border-border bg-card overflow-hidden">
                                    <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center justify-between">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                                            <FileCheck2 className="size-4 text-[#0E2A47] dark:text-[#C49A2C]" />
                                            <span>Traveler Documents</span>
                                        </h3>
                                        {inspectedBooking.customer_id && (
                                            <Link
                                                href={`/customers/${inspectedBooking.customer_id}`}
                                                className="text-xs font-semibold text-[#0B3D91] dark:text-[#F59E0B] hover:underline flex items-center gap-1"
                                            >
                                                <span>Verify Documents</span>
                                                <ExternalLink className="size-3" />
                                            </Link>
                                        )}
                                    </div>

                                    <div className="divide-y divide-border">
                                        {travelersList.length === 0 ? (
                                            <div className="p-4 text-xs text-muted-foreground flex items-center justify-between">
                                                <span>
                                                    Primary Customer: <strong>{getCustomerDisplayName(inspectedBooking)}</strong>
                                                </span>
                                                <StatusBadge
                                                    type="document"
                                                    status={
                                                        customerDocs.some(
                                                            (d) =>
                                                                d.verification_status?.toLowerCase() === 'verified',
                                                        )
                                                            ? 'Verified'
                                                            : customerDocs.length > 0
                                                              ? 'Pending'
                                                              : 'Missing'
                                                    }
                                                />
                                            </div>
                                        ) : (
                                            travelersList.map((traveler, idx) => {
                                                const hasPassport = Boolean(traveler.passport_number);
                                                const matchingDoc = customerDocs[idx] || customerDocs[0];
                                                const docStatus = matchingDoc?.verification_status
                                                    ? matchingDoc.verification_status
                                                    : hasPassport
                                                      ? 'Pending'
                                                      : 'Missing';

                                                return (
                                                    <div
                                                        key={traveler.id || idx}
                                                        className="px-4 py-3 flex items-center justify-between gap-3 text-xs"
                                                    >
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-foreground truncate">
                                                                {traveler.full_name}
                                                                <span className="ml-1.5 text-[10px] uppercase text-muted-foreground font-normal">
                                                                    ({traveler.traveler_type})
                                                                </span>
                                                            </p>
                                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                                Passport: {traveler.passport_number || 'Not provided'}
                                                                {traveler.passport_expiry
                                                                    ? ` · Exp: ${traveler.passport_expiry}`
                                                                    : ''}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <StatusBadge type="document" status={docStatus} />
                                                            {inspectedBooking.customer_id && (
                                                                <Link
                                                                    href={`/customers/${inspectedBooking.customer_id}`}
                                                                    className="text-[11px] font-semibold text-[#0B3D91] dark:text-[#F59E0B] hover:underline"
                                                                >
                                                                    Verify
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* 3. Payment Schedule & Receipts Section */}
                                <div className="rounded-xl border border-border bg-card overflow-hidden">
                                    <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center justify-between">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                                            <CreditCard className="size-4 text-emerald-600" />
                                            <span>Payment Schedule & Receipts</span>
                                        </h3>
                                        <span className="text-[11px] font-medium text-muted-foreground">
                                            Balance:{' '}
                                            <MoneyText
                                                amount={balanceAmount}
                                                currency={inspectorCurrency}
                                                weight="semibold"
                                                className="text-foreground"
                                            />
                                        </span>
                                    </div>

                                    <div className="divide-y divide-border">
                                        {schedulesList.length === 0 ? (
                                            <div className="p-4 text-xs text-muted-foreground">
                                                No installment schedule configured for this booking.
                                            </div>
                                        ) : (
                                            schedulesList.map((sched) => (
                                                <div
                                                    key={sched.id}
                                                    className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-foreground">
                                                            {sched.description}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground">
                                                            Due: {sched.due_date}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2.5">
                                                        <MoneyText
                                                            amount={Number(sched.amount)}
                                                            currency={inspectorCurrency}
                                                            weight="semibold"
                                                        />
                                                        <StatusBadge type="payment" status={sched.status} />
                                                    </div>
                                                </div>
                                            ))
                                        )}

                                        {paymentsList.length > 0 && (
                                            <div className="bg-muted/20 px-4 py-3 space-y-2">
                                                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                    Recorded Receipts ({paymentsList.length})
                                                </p>
                                                {paymentsList.map((pmt) => {
                                                    const receiptNo =
                                                        pmt.receipt?.receipt_number ||
                                                        pmt.receipt_number ||
                                                        pmt.reference_number ||
                                                        `PMT-${pmt.id}`;
                                                    return (
                                                        <div
                                                            key={pmt.id}
                                                            className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs"
                                                        >
                                                            <div>
                                                                <span className="font-mono font-bold text-foreground">
                                                                    {receiptNo}
                                                                </span>
                                                                <span className="text-muted-foreground ml-2">
                                                                    {pmt.payment_date} · {pmt.payment_method}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <MoneyText
                                                                    amount={Number(pmt.amount)}
                                                                    currency={pmt.currency}
                                                                    weight="semibold"
                                                                />
                                                                <Link
                                                                    href={`/bookings/${inspectedBooking.id}?receipt=${pmt.id}`}
                                                                    className="inline-flex items-center gap-1 rounded border border-border bg-muted/60 hover:bg-muted px-2 py-1 text-[11px] font-semibold text-[#0E2A47] dark:text-[#F59E0B]"
                                                                    title="View / Download Receipt"
                                                                >
                                                                    <Download className="size-3" />
                                                                    <span>Receipt</span>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 4. Supplier Cost Lines Summary Section */}
                                <div className="rounded-xl border border-border bg-card overflow-hidden">
                                    <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center justify-between">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                                            <Building2 className="size-4 text-[#C49A2C]" />
                                            <span>Supplier Cost Lines Summary</span>
                                        </h3>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                                            <Sparkles className="size-3" />
                                            <span>{netMarginPct}% Net Margin</span>
                                        </span>
                                    </div>

                                    <div className="p-4 space-y-3">
                                        <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/40 p-3 border border-border/60 text-xs">
                                            <div>
                                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                                                    Booking Revenue
                                                </span>
                                                <span className="font-bold text-foreground mt-0.5 block">
                                                    <MoneyText amount={finalAmountLkr} currency="LKR" />
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                                                    Supplier Cost
                                                </span>
                                                <span className="font-bold text-[#C49A2C] mt-0.5 block">
                                                    <MoneyText amount={totalSupplierCostLkr} currency="LKR" />
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                                                    Net Margin
                                                </span>
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                                                    <MoneyText amount={netMarginLkr} currency="LKR" />
                                                </span>
                                            </div>
                                        </div>

                                        {packageCostLines.length > 0 && (
                                            <div className="space-y-1.5 pt-1">
                                                {packageCostLines.slice(0, 4).map((line) => (
                                                    <div
                                                        key={line.id}
                                                        className="flex items-center justify-between text-xs text-muted-foreground"
                                                    >
                                                        <span className="truncate max-w-[240px]">
                                                            {line.description}
                                                            {line.supplier?.name ? ` (${line.supplier.name})` : ''}
                                                        </span>
                                                        <MoneyText
                                                            amount={Number(line.amount_lkr || line.amount)}
                                                            currency="LKR"
                                                            size="sm"
                                                            className="text-foreground font-medium"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Drawer Footer */}
                            <SheetFooter className="p-4 border-t border-border bg-muted/30 flex flex-row items-center justify-between gap-2 shrink-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setInspectedBooking(null)}
                                >
                                    Close
                                </Button>
                                <Link
                                    href={route('bookings.show', { booking: inspectedBooking.id })}
                                    className="inline-flex items-center gap-1.5 h-9 rounded-lg bg-[#0E2A47] hover:bg-[#0B3D91] text-white px-4 text-xs font-semibold shadow-xs transition-colors"
                                >
                                    <span>Open Full Page View</span>
                                    <ExternalLink className="size-3.5 text-[#F59E0B]" />
                                </Link>
                            </SheetFooter>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
