import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal, Plus, Search, Eye, Edit, Trash2, Filter, X, ArrowUpDown } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import { Customer, PaginatedData } from '@/types';

interface IndexProps {
    customers: PaginatedData<Customer>;
    filters: {
        search?: string;
        status?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
    };
}

export default function CustomersIndex({ customers, filters }: IndexProps) {
    const { hasRole } = useAuth();

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [sortField, setSortField] = useState(filters.sort || 'created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(filters.direction || 'desc');

    const canCreate = hasRole('super_admin', 'manager', 'staff');
    const canDelete = hasRole('super_admin', 'manager');

    const applyFilters = (overrides = {}) => {
        const query = {
            search: searchQuery,
            status: statusFilter === 'all' ? undefined : statusFilter,
            sort: sortField,
            direction: sortDirection,
            ...overrides
        };

        // Remove empty values
        Object.keys(query).forEach(key => {
            if (query[key as keyof typeof query] === undefined || query[key as keyof typeof query] === '') {
                delete query[key as keyof typeof query];
            }
        });

        router.get(route('customers.index'), query as any, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search: searchQuery });
    };

    const handleSort = (field: string) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);
        applyFilters({ sort: field, direction: newDirection });
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setSortField('created_at');
        setSortDirection('desc');
        router.get(route('customers.index'));
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            router.delete(route('customers.destroy', { customer: id }));
        }
    };

    return (
        <AppLayout
            title="Customers"
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Customers' },
            ]}
        >
            <Head title="Customers" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
                        <p className="text-muted-foreground">Manage your client database and their profiles.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <form onSubmit={handleSearch} className="relative max-w-sm w-full sm:w-auto">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search customers..."
                                className="pl-9 bg-card w-full sm:w-[250px]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>

                        <Select
                            value={statusFilter}
                            onValueChange={(value) => {
                                const val = value || 'all';
                                setStatusFilter(val);
                                applyFilters({ status: val });
                            }}
                        >
                            <SelectTrigger className="w-[140px] bg-card">
                                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>

                        {(filters.search || filters.status) && (
                            <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
                                <X className="h-4 w-4" />
                            </Button>
                        )}

                        {canCreate && (
                            <Link href={route('customers.create')} className={buttonVariants({ variant: 'default' }) + " shrink-0 gap-2"}>
                                <Plus className="h-4 w-4" />
                                <span>Add Customer</span>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="font-semibold min-w-[120px]">
                                        <Button variant="ghost" onClick={() => handleSort('customer_id')} className="p-0 h-auto font-semibold hover:bg-transparent">
                                            ID {sortField === 'customer_id' && <ArrowUpDown className="ml-2 h-3 w-3" />}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="font-semibold min-w-[200px]">
                                        <Button variant="ghost" onClick={() => handleSort('full_name')} className="p-0 h-auto font-semibold hover:bg-transparent">
                                            Customer Details {sortField === 'full_name' && <ArrowUpDown className="ml-2 h-3 w-3" />}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="font-semibold min-w-[150px]">Contact</TableHead>
                                    <TableHead className="font-semibold">Document</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="text-right font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                            No customers found.
                                            {canCreate && (
                                                <div className="mt-2">
                                                    <Link href={route('customers.create')} className="text-primary hover:underline">
                                                        Create the first customer
                                                    </Link>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    customers.data.map((customer) => (
                                        <TableRow key={customer.id} className="group transition-colors hover:bg-muted/50">
                                            <TableCell className="font-medium text-muted-foreground">
                                                {customer.customer_id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground">{customer.full_name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Added {new Date(customer.created_at || '').toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <a href={`mailto:${customer.email}`} className="text-sm text-primary hover:underline">
                                                        {customer.email}
                                                    </a>
                                                    <span className="text-xs text-muted-foreground">{customer.phone}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 text-sm">
                                                    {customer.nic ? (
                                                        <span className="text-muted-foreground">NIC: <span className="font-medium">{customer.nic}</span></span>
                                                    ) : customer.passport_number ? (
                                                        <span className="text-muted-foreground">Passport: <span className="font-medium">{customer.passport_number}</span></span>
                                                    ) : (
                                                        <span className="text-xs italic text-muted-foreground/70">Not provided</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={customer.status === 'active' ? 'default' : 'secondary'}
                                                    className={customer.status === 'active' ? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20' : ''}
                                                >
                                                    {customer.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger render={
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    } />
                                                    <DropdownMenuContent align="end" className="w-[160px]">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.visit(route('customers.show', { customer: customer.id }))}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Profile
                                                        </DropdownMenuItem>

                                                        {canCreate && (
                                                            <DropdownMenuItem className="cursor-pointer" onClick={() => router.visit(route('customers.edit', { customer: customer.id }))}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit Details
                                                            </DropdownMenuItem>
                                                        )}

                                                        {canDelete && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive cursor-pointer"
                                                                    onClick={(e: React.MouseEvent) => {
                                                                        e.preventDefault();
                                                                        handleDelete(customer.id);
                                                                    }}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Archive
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {Number(customers.last_page) > 1 && (
                        <div className="flex items-center justify-between border-t border-border/50 px-4 py-3 bg-muted/10 sm:px-6">
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Showing <span className="font-medium">{customers.from}</span> to <span className="font-medium">{customers.to}</span> of{' '}
                                        <span className="font-medium">{customers.total}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        {customers.links.map((link, index) => {
                                            const isPrevious = index === 0;
                                            const isNext = index === customers.links.length - 1;

                                            // Handle disabled state
                                            if (!link.url) {
                                                return (
                                                    <span
                                                        key={index}
                                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-input opacity-50 ${isPrevious ? 'rounded-l-md' : ''
                                                            } ${isNext ? 'rounded-r-md' : ''}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            }

                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border border-input transition-colors ${link.active
                                                        ? 'z-10 bg-primary text-primary-foreground border-primary focus:z-20'
                                                        : 'bg-background text-foreground hover:bg-muted focus:z-20'
                                                        } ${isPrevious ? 'rounded-l-md' : ''} ${isNext ? 'rounded-r-md' : ''}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        })}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
