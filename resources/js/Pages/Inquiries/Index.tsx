import { Head, router } from '@inertiajs/react';
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
import { MoreHorizontal, Eye, Edit } from 'lucide-react';
import { PageHeader, StatusBadge } from '@/components/common';
import { useAuth } from '@/hooks/use-auth';
import { PaginatedData } from '@/types';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { ColumnDef } from '@tanstack/react-table';

export interface Inquiry {
    id: number;
    reference: string;
    full_name: string;
    email?: string;
    phone?: string;
    interest?: string;
    tour_slug?: string | null;
    destination_slug?: string | null;
    travel_start?: string | null;
    travel_end?: string | null;
    party_size?: number | null;
    status: string;
    assigned_to?: string | null;
    created_at: string;
}

interface IndexProps {
    inquiries: PaginatedData<Inquiry>;
    filters: Record<string, unknown>;
    savedFilters?: { id: number; name: string; filters: Record<string, unknown> }[];
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
            cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('reference')}</span>,
        },
        {
            accessorKey: 'full_name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }) => <span className="font-semibold text-foreground">{row.getValue('full_name')}</span>,
        },
        {
            accessorKey: 'interest',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Interest" />,
            cell: ({ row }) => <span>{row.getValue('interest') || '—'}</span>,
        },
        {
            accessorKey: 'tour_slug',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tour" />,
            cell: ({ row }) => <span>{row.getValue('tour_slug') ?? '—'}</span>,
        },
        {
            accessorKey: 'destination_slug',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Destination" />,
            cell: ({ row }) => <span>{row.getValue('destination_slug') ?? '—'}</span>,
        },
        {
            accessorKey: 'travel_start',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Travel Start" />,
            cell: ({ row }) => {
                const d = row.getValue('travel_start') as string | null;
                return d ? new Date(d).toLocaleDateString() : '—';
            },
        },
        {
            accessorKey: 'party_size',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Party Size" />,
            cell: ({ row }) => <span>{row.getValue('party_size') ?? '—'}</span>,
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
            accessorKey: 'created_at',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Received" />,
            cell: ({ row }) => {
                const d = row.getValue('created_at') as string;
                return <span className="text-xs text-muted-foreground">{new Date(d).toLocaleDateString()}</span>;
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const inquiry = row.original;
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="size-4" />
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end" className="w-[150px]">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => router.visit(route('admin.inquiries.show', { inquiry: inquiry.id }))}
                                >
                                    <Eye className="mr-2 size-4" /> View
                                </DropdownMenuItem>
                                {canAssign && (
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => router.visit(route('admin.inquiries.edit', { inquiry: inquiry.id }))}
                                    >
                                        <Edit className="mr-2 size-4" /> Edit
                                    </DropdownMenuItem>
                                )}
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
                    <span className="font-semibold text-foreground">{inquiry.full_name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{inquiry.reference}</span>
                </div>
                <StatusBadge status={inquiry.status} />
            </div>
            <div className="text-xs text-muted-foreground flex flex-col gap-1">
                {inquiry.interest && <span>Interest: {inquiry.interest}</span>}
                {inquiry.travel_start && (
                    <span>Travel Start: {new Date(inquiry.travel_start).toLocaleDateString()}</span>
                )}
            </div>
            <div className="flex justify-end pt-2 border-t border-border mt-1">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => router.visit(route('admin.inquiries.show', { inquiry: inquiry.id }))}
                >
                    <Eye className="mr-1.5 size-4" /> View
                </Button>
            </div>
        </div>
    );

    return (
        <AppLayout
            title="Inquiries"
            breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Inquiries' }]}
        >
            <Head title="Inquiries" />
            <div className="space-y-6">
                <PageHeader
                    title="Inquiries"
                    description="Staff can review and work through public travel inquiries."
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
