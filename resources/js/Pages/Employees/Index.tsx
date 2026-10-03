import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Plus, Search, Edit, Trash2, Shield, UserCog } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { PaginatedData, User } from '@/types';

interface IndexProps {
    employees: PaginatedData<User>;
    roles: { id: number; name: string }[];
    filters: {
        search?: string;
        status?: string;
        role?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
    };
}

export default function EmployeesIndex({ employees, roles, filters }: IndexProps) {
    const { hasRole, user: currentUser } = useAuth();

    const [searchQuery, setSearchQuery] = useState(typeof filters?.search === 'string' ? filters.search : '');
    const [statusFilter, setStatusFilter] = useState(typeof filters?.status === 'string' ? filters.status : 'all');
    const [roleFilter, setRoleFilter] = useState(typeof filters?.role === 'string' ? filters.role : 'all');
    const [sortField, setSortField] = useState(typeof filters?.sort === 'string' ? filters.sort : 'created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
        filters?.direction === 'asc' || filters?.direction === 'desc' ? filters.direction : 'desc',
    );

    const canCreate = hasRole('super_admin');
    const canDelete = hasRole('super_admin');

    const applyFilters = (overrides = {}) => {
        const query = {
            search: searchQuery,
            status: statusFilter === 'all' ? undefined : statusFilter,
            role: roleFilter === 'all' ? undefined : roleFilter,
            sort: sortField,
            direction: sortDirection,
            ...overrides,
        };

        Object.keys(query).forEach((key) => {
            if (query[key as keyof typeof query] === undefined || query[key as keyof typeof query] === '') {
                delete query[key as keyof typeof query];
            }
        });

        router.get(route('employees.index'), query as any, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    const handleSort = (field: string) => {
        const newDirection = sortField === field && sortDirection === 'desc' ? 'asc' : 'desc';
        setSortField(field);
        setSortDirection(newDirection);
        applyFilters({ sort: field, direction: newDirection });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to remove this employee?')) {
            router.delete(route('employees.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout
            title="Employees"
            breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Employees' }]}
        >
            <Head title="Employees" />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
                    <p className="text-muted-foreground mt-1">Manage staff accounts and permissions.</p>
                </div>
                <div className="flex space-x-2">
                    {canCreate && (
                        <Link href={route('employees.create')} className={buttonVariants({ variant: 'default' })}>
                            <Plus className="mr-2 h-4 w-4" /> New Employee
                        </Link>
                    )}
                </div>
            </div>

            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                <div className="flex flex-1 items-center space-x-2">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search employees..."
                            className="pl-9 bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Select
                        value={roleFilter}
                        onValueChange={(v) => {
                            setRoleFilter(v);
                            applyFilters({ role: v });
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[150px] bg-background">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {roles.map((role) => (
                                <SelectItem key={role.id} value={role.name} className="capitalize">
                                    {role.name.replace('_', ' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={statusFilter}
                        onValueChange={(v) => {
                            setStatusFilter(v);
                            applyFilters({ status: v });
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[150px] bg-background">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[300px]">Employee</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!employees || !employees.data || employees.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center">
                                            <UserCog className="h-8 w-8 mb-2 opacity-20" />
                                            <p>No employees found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                employees.data.map((employee) => (
                                    <TableRow key={employee.id} className="group transition-colors hover:bg-muted/50">
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-semibold text-foreground flex items-center gap-2">
                                                    {employee.name}
                                                    {employee.id === currentUser?.id && (
                                                        <Badge variant="outline" className="text-[0.6rem] py-0 h-4">
                                                            You
                                                        </Badge>
                                                    )}
                                                </span>
                                                <a
                                                    href={`mailto:${employee.email}`}
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    {employee.email}
                                                </a>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-muted-foreground" />
                                                <span className="capitalize">
                                                    {employee.roles?.[0]?.replace('_', ' ') || 'None'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    employee.status === 'active'
                                                        ? 'default'
                                                        : employee.status === 'suspended'
                                                          ? 'destructive'
                                                          : 'secondary'
                                                }
                                                className={
                                                    employee.status === 'active'
                                                        ? 'bg-success/15 text-success hover:bg-success/25 border-success/20'
                                                        : ''
                                                }
                                            >
                                                {employee.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    render={
                                                        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </button>
                                                    }
                                                />
                                                <DropdownMenuContent align="end" className="w-[160px]">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />

                                                    {canCreate && (
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                                router.visit(
                                                                    route('employees.edit', { employee: employee.id }),
                                                                )
                                                            }
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit Employee
                                                        </DropdownMenuItem>
                                                    )}

                                                    {canDelete && employee.id !== currentUser?.id && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive cursor-pointer"
                                                                onClick={(e: React.MouseEvent) => {
                                                                    e.preventDefault();
                                                                    handleDelete(employee.id);
                                                                }}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Remove
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
                {(employees?.last_page ?? 0) > 1 && (
                    <div className="flex items-center justify-between border-t border-border/50 px-4 py-3 bg-muted/10 sm:px-6">
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Showing <span className="font-medium">{employees.from}</span> to{' '}
                                    <span className="font-medium">{employees.to}</span> of{' '}
                                    <span className="font-medium">{employees.total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav
                                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                                    aria-label="Pagination"
                                >
                                    {employees.links?.map((link, index) => {
                                        const isPrevious = index === 0;
                                        const isNext = index === (employees.links?.length || 0) - 1;

                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={index}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-input opacity-50 ${
                                                        isPrevious ? 'rounded-l-md' : ''
                                                    } ${isNext ? 'rounded-r-md' : ''}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        }

                                        return (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border border-input transition-colors ${
                                                    link.active
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
        </AppLayout>
    );
}
