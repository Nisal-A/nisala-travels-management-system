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
import { MoreHorizontal, Plus, Eye, Edit, Trash2, Users } from 'lucide-react';
import { PageHeader } from '@/components/common';
import { useAuth } from '@/hooks/use-auth';
import { Customer, PaginatedData } from '@/types';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { ColumnDef } from '@tanstack/react-table';

interface IndexProps {
    customers: PaginatedData<Customer>;
    filters: Record<string, any>;
    savedFilters: any[];
}

export default function CustomersIndex({ customers, filters, savedFilters = [] }: IndexProps) {
    const { hasRole } = useAuth();

    const canCreate = hasRole('super_admin', 'manager', 'staff');
    const canDelete = hasRole('super_admin', 'manager');

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            router.delete(route('customers.destroy', { customer: id }));
        }
    };

    const columns: ColumnDef<Customer>[] = [
        {
            accessorKey: 'customer_id',
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => <span className="font-medium text-muted-foreground">{row.getValue('customer_id')}</span>,
        },
        {
            accessorKey: 'full_name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Customer Details" />,
            cell: ({ row }) => {
                const customer = row.original;
                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{customer.full_name}</span>
                        <span className="text-xs text-muted-foreground">
                            Added {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'Unknown'}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'email',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
            cell: ({ row }) => {
                const customer = row.original;
                return (
                    <div className="flex flex-col gap-1">
                        <a href={`mailto:${customer.email}`} className="text-sm text-primary hover:underline">
                            {customer.email}
                        </a>
                        <span className="text-xs text-muted-foreground">{customer.phone}</span>
                    </div>
                );
            },
        },
        {
            id: 'document',
            header: 'Document',
            cell: ({ row }) => {
                const customer = row.original;
                return (
                    <div className="flex flex-col gap-1 text-sm">
                        {customer.nic ? (
                            <span className="text-muted-foreground">
                                NIC: <span className="font-medium">{customer.nic}</span>
                            </span>
                        ) : customer.passport_number ? (
                            <span className="text-muted-foreground">
                                Passport: <span className="font-medium">{customer.passport_number}</span>
                            </span>
                        ) : (
                            <span className="text-xs italic text-muted-foreground/70">Not provided</span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                return (
                    <Badge
                        variant={status === 'active' ? 'default' : 'secondary'}
                        className={
                            status === 'active'
                                ? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20'
                                : ''
                        }
                    >
                        {status}
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const customer = row.original;
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
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => router.visit(route('customers.show', { customer: customer.id }))}
                                >
                                    <Eye className="mr-2 h-4 w-4" /> View Profile
                                </DropdownMenuItem>
                                {canCreate && (
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => router.visit(route('customers.edit', { customer: customer.id }))}
                                    >
                                        <Edit className="mr-2 h-4 w-4" /> Edit Details
                                    </DropdownMenuItem>
                                )}
                                {canDelete && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive cursor-pointer"
                                            onClick={() => handleDelete(customer.id)}
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

    const mobileCard = (customer: Customer) => (
        <div className="rounded-lg border bg-card p-4 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="font-semibold">{customer.full_name}</span>
                    <span className="text-xs text-muted-foreground">{customer.customer_id}</span>
                </div>
                <Badge
                    variant={customer.status === 'active' ? 'default' : 'secondary'}
                    className={
                        customer.status === 'active' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20' : ''
                    }
                >
                    {customer.status}
                </Badge>
            </div>
            <div className="flex flex-col gap-1 text-sm">
                <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
                    {customer.email}
                </a>
                <span className="text-muted-foreground">{customer.phone}</span>
            </div>
            <div className="flex justify-end pt-2 border-t mt-1">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button variant="ghost" size="sm" className="h-8">
                                Actions <MoreHorizontal className="ml-2 h-4 w-4" />
                            </Button>
                        }
                    />
                    <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => router.visit(route('customers.show', { customer: customer.id }))}
                        >
                            <Eye className="mr-2 h-4 w-4" /> View Profile
                        </DropdownMenuItem>
                        {canCreate && (
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => router.visit(route('customers.edit', { customer: customer.id }))}
                            >
                                <Edit className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                        )}
                        {canDelete && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive cursor-pointer"
                                    onClick={() => handleDelete(customer.id)}
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
            title="Customers"
            breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Customers' }]}
        >
            <Head title="Customers" />
            <div className="space-y-6">
                <PageHeader
                    title="Customers"
                    description="Manage your client database and their profiles."
                    actions={
                        canCreate && (
                            <Link
                                href={route('customers.create')}
                                className={buttonVariants({ variant: 'default' }) + ' shrink-0 gap-2'}
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Add Customer</span>
                            </Link>
                        )
                    }
                />

                <DataTable
                    columns={columns}
                    data={customers.data}
                    tableKey="customers"
                    total={customers.total || 0}
                    links={customers.links}
                    from={customers.from}
                    to={customers.to}
                    filters={filters}
                    savedFilters={savedFilters}
                    mobileCard={mobileCard}
                    bulkActions={
                        canDelete
                            ? [
                                  {
                                      label: 'Archive Selected',
                                      icon: Trash2,
                                      variant: 'destructive',
                                      onClick: (ids) => {
                                          if (confirm(`Archive ${ids.length} customers?`)) {
                                              console.log('Archive ids:', ids);
                                              // implement bulk delete if needed
                                          }
                                      },
                                  },
                              ]
                            : []
                    }
                />
            </div>
        </AppLayout>
    );
}
