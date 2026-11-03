import { Head, Link, router } from '@inertiajs/react';
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
import { MoreHorizontal, Eye, Edit, CalendarPlus } from 'lucide-react';
import { PageHeader, StatusBadge } from '@/components/common';
import { useAuth } from '@/hooks/use-auth';
import { PaginatedData, Inquiry as SharedInquiry } from '@/types';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { ColumnDef } from '@tanstack/react-table';

export type Inquiry = SharedInquiry;

interface IndexProps {
    inquiries: PaginatedData<Inquiry>;
    filters: Record<string, unknown>;
    savedFilters?: { id: number; name: string; filters: Record<string, unknown> }[];
}

function getInquiryName(inquiry: Inquiry): string {
    return inquiry.full_name || inquiry.name || 'Website Visitor';
}

function getInquiryDestination(inquiry: Inquiry): string {
    if (typeof inquiry.destination === 'object' && inquiry.destination?.name) {
        return inquiry.destination.name;
    }
    if (typeof inquiry.destination === 'string' && inquiry.destination) {
        return inquiry.destination;
    }
    return inquiry.destination_slug ?? '—';
}

export default function InquiriesIndex({ inquiries, filters, savedFilters = [] }: IndexProps) {
    const { hasRole } = useAuth();
    const canAssign = hasRole('super_admin', 'manager', 'staff');

    const columns: ColumnDef<Inquiry>[] = [
        {
            accessorKey: 'id',
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => <span className="font-medium text-muted-foreground">{row.getValue('id')}</span>,
        },
        {
            accessorKey: 'reference',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Reference" />,
            cell: ({ row }) => (
                <span className="font-mono text-xs font-semibold text-[#0E2A47] dark:text-[#F59E0B]">
                    {row.getValue('reference') || `INQ-${row.original.id}`}
                </span>
            ),
        },
        {
            id: 'full_name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{getInquiryName(row.original)}</span>
                    {row.original.email && (
                        <span className="text-xs text-muted-foreground">{row.original.email}</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'interest',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Interest" />,
            cell: ({ row }) => (
                <span>{row.original.interest || row.original.package_interest || '—'}</span>
            ),
        },
        {
            id: 'destination',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Destination" />,
            cell: ({ row }) => <span>{getInquiryDestination(row.original)}</span>,
        },
        {
            id: 'travel_start',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Travel Start" />,
            cell: ({ row }) => {
                const d = row.original.travel_start || row.original.start_date || row.original.travel_date;
                return d ? new Date(d).toLocaleDateString() : '—';
            },
        },
        {
            id: 'party_size',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Party Size" />,
            cell: ({ row }) => {
                const pax =
                    row.original.party_size ??
                    row.original.number_of_travelers ??
                    ((Number(row.original.adults || 0) + Number(row.original.children || 0)) || null);
                return <span>{pax ?? '—'}</span>;
            },
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                const status = (row.getValue('status') as string) || 'new';
                return <StatusBadge status={status} />;
            },
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Received" />,
            cell: ({ row }) => {
                const d = row.getValue('created_at') as string;
                return (
                    <span className="text-xs text-muted-foreground">
                        {d ? new Date(d).toLocaleDateString() : '—'}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const inquiry = row.original;
                return (
                    <div className="flex items-center justify-end gap-2">
                        {canAssign && (
                            <Link
                                href={`/bookings/create?inquiry_id=${inquiry.id}`}
                                className="inline-flex items-center gap-1.5 h-8 rounded-lg bg-[#0E2A47] hover:bg-[#0B3D91] text-white px-2.5 text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
                            >
                                <CalendarPlus className="size-3.5 text-[#F59E0B]" />
                                <span>Convert to Draft Booking</span>
                            </Link>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="size-4" />
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end" className="w-[200px]">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {canAssign && (
                                    <DropdownMenuItem
                                        className="cursor-pointer font-medium"
                                        onClick={() => router.visit(`/bookings/create?inquiry_id=${inquiry.id}`)}
                                    >
                                        <CalendarPlus className="mr-2 size-4 text-[#C49A2C]" /> Convert to Draft Booking
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                        router.visit(route('admin.inquiries.show', { inquiry: inquiry.id }))
                                    }
                                >
                                    <Eye className="mr-2 size-4" /> View Inquiry
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    const mobileCard = (inquiry: Inquiry) => (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm flex flex-col gap-2.5">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{getInquiryName(inquiry)}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                        {inquiry.reference || `INQ-${inquiry.id}`}
                    </span>
                </div>
                <StatusBadge status={inquiry.status} />
            </div>
            <div className="text-xs text-muted-foreground flex flex-col gap-1">
                {(inquiry.interest || inquiry.package_interest) && (
                    <span>Interest: {inquiry.interest || inquiry.package_interest}</span>
                )}
                {(inquiry.travel_start || inquiry.start_date || inquiry.travel_date) && (
                    <span>
                        Travel Start:{' '}
                        {new Date(
                            (inquiry.travel_start || inquiry.start_date || inquiry.travel_date) as string,
                        ).toLocaleDateString()}
                    </span>
                )}
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border mt-1">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => router.visit(route('admin.inquiries.show', { inquiry: inquiry.id }))}
                >
                    <Eye className="mr-1.5 size-3.5" /> View
                </Button>
                {canAssign && (
                    <Link
                        href={`/bookings/create?inquiry_id=${inquiry.id}`}
                        className="inline-flex items-center gap-1.5 h-8 rounded-lg bg-[#0E2A47] hover:bg-[#0B3D91] text-white px-3 text-xs font-semibold shadow-xs transition-colors"
                    >
                        <CalendarPlus className="size-3.5 text-[#F59E0B]" />
                        <span>Convert to Draft Booking</span>
                    </Link>
                )}
            </div>
        </div>
    );

    return (
        <AppLayout
            title="Web Inquiries"
            breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Web Inquiries' }]}
        >
            <Head title="Web Inquiries" />
            <div className="space-y-6">
                <PageHeader
                    title="Web Inquiries"
                    description="Review incoming website travel inquiries and convert qualified leads directly into draft bookings."
                />

                <DataTable
                    columns={columns}
                    data={inquiries.data}
                    tableKey="inquiries"
                    total={inquiries.total || 0}
                    links={inquiries.links}
                    from={inquiries.from}
                    to={inquiries.to}
                    filters={filters}
                    savedFilters={savedFilters}
                    mobileCard={mobileCard}
                />
            </div>
        </AppLayout>
    );
}
