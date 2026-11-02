import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Plus, Search, Edit, Trash2, UserCog, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader, StatusBadge } from '@/components/common';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { ColumnDef } from '@tanstack/react-table';
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
    const [sortField] = useState(typeof filters?.sort === 'string' ? filters.sort : 'created_at');
    const [sortDirection] = useState<'asc' | 'desc'>(
        filters?.direction === 'asc' || filters?.direction === 'desc' ? filters.direction : 'desc',
    );

    const canCreate = hasRole('super_admin');
    const canDelete = hasRole('super_admin');

    const applyFilters = (overrides = {}) => {
        const query: Record<string, string | undefined> = {
            search: searchQuery,
            status: statusFilter === 'all' ? undefined : statusFilter,
            role: roleFilter === 'all' ? undefined : roleFilter,
            sort: sortField,
            direction: sortDirection,
            ...overrides,
        };

        Object.keys(query).forEach((key) => {
            if (query[key] === undefined || query[key] === '') {
                delete query[key];
            }
        });

        router.get(route('employees.index'), query as Record<string, string>, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to remove this employee?')) {
            router.delete(route('employees.destroy', { employee: id }), {
                preserveScroll: true,
            });
        }
    };

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
            cell: ({ row }) => {
                const employee = row.original;
                return (
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
                            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                        >
                            <Mail className="size-3" />
                            {employee.email}
                        </a>
                    </div>
                );
            },
        },
        {
            id: 'role',
            header: 'Role',
            cell: ({ row }) => {
                const employee = row.original;
                return (
                    <div className="flex flex-wrap gap-1">
                        {employee.roles?.map((role, idx) => {
                            const roleName = typeof role === 'string' ? role : (role as unknown as { name: string }).name;
                            return (
                                <Badge key={idx} variant="secondary" className="capitalize text-xs font-normal">
                                    {roleName.replace('_', ' ')}
                                </Badge>
                            );
                        })}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                const status = (row.getValue('status') as string) || row.original.status || 'active';
                return <StatusBadge status={status} />;
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const employee = row.original;
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="size-4" />
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => router.visit(route('employees.show', { employee: employee.id }))}
                                >
                                    <UserCog className="mr-2 size-4" /> View Profile
                                </DropdownMenuItem>
                                {canCreate && (
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => router.visit(route('employees.edit', { employee: employee.id }))}
                                    >
                                        <Edit className="mr-2 size-4" /> Edit Details
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
                                            <Trash2 className="mr-2 size-4" /> Remove
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

    const mobileCard = (employee: User) => (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                        {employee.name}
                        {employee.id === currentUser?.id && (
                            <Badge variant="outline" className="text-[0.6rem] py-0 h-4">
                                You
                            </Badge>
                        )}
                    </span>
                    <span className="text-xs text-muted-foreground">{employee.email}</span>
                </div>
                <StatusBadge status={employee.status || 'active'} />
            </div>
            <div className="flex flex-wrap gap-1">
                {employee.roles?.map((role, idx) => {
                    const roleName = typeof role === 'string' ? role : (role as unknown as { name: string }).name;
                    return (
                        <Badge key={idx} variant="secondary" className="capitalize text-xs font-normal">
                            {roleName.replace('_', ' ')}
                        </Badge>
                    );
                })}
            </div>
            <div className="flex justify-end pt-2 border-t border-border mt-1">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button variant="ghost" size="sm" className="h-8">
                                Actions <MoreHorizontal className="ml-2 size-4" />
                            </Button>
                        }
                    />
                    <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => router.visit(route('employees.show', { employee: employee.id }))}
                        >
                            <UserCog className="mr-2 size-4" /> View Profile
                        </DropdownMenuItem>
                        {canCreate && (
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => router.visit(route('employees.edit', { employee: employee.id }))}
                            >
                                <Edit className="mr-2 size-4" /> Edit Details
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
                                    <Trash2 className="mr-2 size-4" /> Remove
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
            title="Employees"
            breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Employees' }]}
        >
            <Head title="Employees" />
            <div className="space-y-6">
                <PageHeader
                    title="Employees"
                    description="Manage staff accounts, credentials, and access roles."
                    actions={
                        canCreate && (
                            <Link href={route('employees.create')} className={buttonVariants({ variant: 'default' })}>
                                <Plus className="mr-2 size-4" /> New Employee
                            </Link>
                        )
                    }
                />

                <Card className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                        <div className="relative w-full sm:w-64 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search employees..."
                                className="pl-9 bg-background h-9 rounded-lg border text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Select
                                value={roleFilter}
                                onValueChange={(v) => {
                                    const val = v || 'all';
                                    setRoleFilter(val);
                                    applyFilters({ role: val });
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[150px] h-9 bg-background">
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
                                    const val = v || 'all';
                                    setStatusFilter(val);
                                    applyFilters({ status: val });
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[150px] h-9 bg-background">
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
                </Card>

                <DataTable
                    columns={columns}
                    data={employees.data}
                    tableKey="employees"
                    total={employees.total || 0}
                    links={employees.links}
                    from={employees.from}
                    to={employees.to}
                    filters={filters as Record<string, unknown>}
                    mobileCard={mobileCard}
                    searchable={false}
                />
            </div>
        </AppLayout>
    );
}
