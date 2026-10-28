import React, { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader, ConfirmDialog, EmptyState } from '@/components/common';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { ColumnDef } from '@tanstack/react-table';
import { PaginatedData, Supplier } from '@/types';

interface SuppliersIndexProps {
    suppliers: PaginatedData<Supplier>;
    filters: Record<string, any>;
    types: { value: string; label: string }[];
}

export default function SuppliersIndex({ suppliers, filters, types }: SuppliersIndexProps) {
    const { hasRole } = useAuth();
    const canManage = hasRole('super_admin', 'manager', 'finance');

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (!deleteId) return;
        setIsDeleting(true);
        router.delete(route('suppliers.destroy', deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const columns: ColumnDef<Supplier>[] = [
        {
            accessorKey: 'supplier_code',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
            cell: ({ row }) => (
                <span className="font-mono font-medium text-xs text-primary">{row.getValue('supplier_code')}</span>
            ),
        },
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Supplier Name" />,
            cell: ({ row }) => <span className="font-medium text-foreground">{row.getValue('name')}</span>,
        },
        {
            accessorKey: 'type',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
            cell: ({ row }) => {
                const type = String(row.getValue('type'));
                const label = types.find((t) => t.value === type)?.label || type.replace('_', ' ');
                return (
                    <Badge variant="outline" className="capitalize text-xs font-normal">
                        {label}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'contact_name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
            cell: ({ row }) => <span>{row.getValue('contact_name') || '—'}</span>,
        },
        {
            accessorKey: 'phone',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
            cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('phone') || '—'}</span>,
        },
        {
            accessorKey: 'email',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
            cell: ({ row }) => <span>{row.getValue('email') || '—'}</span>,
        },
        {
            accessorKey: 'default_currency',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Currency" />,
            cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('default_currency')}</span>,
        },
        {
            accessorKey: 'is_active',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                const active = Boolean(row.getValue('is_active'));
                return (
                    <Badge variant={active ? 'default' : 'secondary'} className="text-xs">
                        {active ? 'Active' : 'Inactive'}
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const s = row.original;
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
                                <DropdownMenuItem asChild>
                                    <Link href={route('suppliers.edit', s.id)} className="cursor-pointer">
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </Link>
                                </DropdownMenuItem>
                                {canManage && (
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive cursor-pointer"
                                        onClick={() => setDeleteId(s.id)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    const mobileCard = (s: Supplier) => (
        <div className="rounded-lg border bg-card p-4 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="font-mono text-xs text-primary">{s.supplier_code}</span>
                    <span className="font-semibold text-foreground">{s.name}</span>
                </div>
                <Badge variant={s.is_active ? 'default' : 'secondary'} className="text-xs">
                    {s.is_active ? 'Active' : 'Inactive'}
                </Badge>
            </div>
            <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                <Badge variant="outline" className="capitalize text-xs font-normal">
                    {types.find((t) => t.value === s.type)?.label || s.type}
                </Badge>
                <span>Currency: {s.default_currency}</span>
            </div>
            {(s.contact_name || s.phone || s.email) && (
                <div className="text-xs text-muted-foreground border-t pt-2 space-y-0.5">
                    {s.contact_name && <div>Contact: {s.contact_name}</div>}
                    {s.phone && <div>Phone: {s.phone}</div>}
                    {s.email && <div>Email: {s.email}</div>}
                </div>
            )}
            <div className="flex justify-end gap-2 border-t pt-2">
                <Button variant="outline" size="sm" asChild>
                    <Link href={route('suppliers.edit', s.id)}>
                        <Edit className="mr-1 h-3.5 w-3.5" /> Edit
                    </Link>
                </Button>
                {canManage && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(s.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                    </Button>
                )}
            </div>
        </div>
    );

    return (
        <AppLayout
            title="Suppliers"
            breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Suppliers' }]}
        >
            <Head title="Suppliers" />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <PageHeader
                        title="Suppliers"
                        description="Manage external service providers, hotels, guides, transport, and vendors."
                    />
                    {canManage && (
                        <Button asChild className="shrink-0">
                            <Link href={route('suppliers.create')}>
                                <Plus className="mr-2 h-4 w-4" /> Add Supplier
                            </Link>
                        </Button>
                    )}
                </div>

                {suppliers.data.length === 0 && !filters.search ? (
                    <EmptyState
                        icon={Building2}
                        title="No suppliers found"
                        description="Start by adding hotel, transport, or guide suppliers to track package costs."
                        actionLabel={canManage ? 'Add Supplier' : undefined}
                        onAction={canManage ? () => router.get(route('suppliers.create')) : undefined}
                    />
                ) : (
                    <DataTable
                        columns={columns}
                        data={suppliers.data}
                        tableKey="suppliers"
                        total={suppliers.total || 0}
                        links={suppliers.links}
                        from={suppliers.from}
                        to={suppliers.to}
                        filters={filters}
                        mobileCard={mobileCard}
                    />
                )}
            </div>

            <ConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete Supplier"
                description="Are you sure you want to delete this supplier? This action cannot be undone."
                confirmLabel="Delete"
                isDanger
                isLoading={isDeleting}
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
