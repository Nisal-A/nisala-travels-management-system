import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Plus, Search, Edit, Trash2, Shield, UserCog, Mail, Power, PowerOff, KeyRound } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { PaginatedData, User } from '@/types';
import { EmptyState } from '@/components/common/empty-state';
import { StatusBadge } from '@/components/common/status-badge';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

import { EmployeeSheet } from './Partials/EmployeeSheet';
// Since I haven't seen one, I will render basic pagination.

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
    const canManage = hasRole('super_admin');

    const [searchQuery, setSearchQuery] = useState<string>(typeof filters?.search === 'string' ? filters.search : '');
    const [statusFilter, setStatusFilter] = useState<string>(typeof filters?.status === 'string' ? filters.status : 'all');
    const [roleFilter, setRoleFilter] = useState<string>(typeof filters?.role === 'string' ? filters.role : 'all');

    // Sheet State
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<User | null>(null);

    // Confirm Dialog States
    const [dialogAction, setDialogAction] = useState<{type: 'delete' | 'deactivate' | 'activate' | 'reset', employee: User | null}>({ type: 'delete', employee: null });
    
    const applyFilters = (overrides = {}) => {
        const query = {
            search: searchQuery,
            status: statusFilter === 'all' ? undefined : statusFilter,
            role: roleFilter === 'all' ? undefined : roleFilter,
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

    const confirmAction = () => {
        if (!dialogAction.employee) return;

        const id = dialogAction.employee.id.toString();

        switch (dialogAction.type) {
            case 'delete':
                router.delete(route('employees.destroy', { employee: id }), {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Employee deleted successfully.');
                        setDialogAction({ type: 'delete', employee: null });
                    },
                    onError: (err) => {
                        toast.error(err.error || 'Failed to delete employee.');
                    }
                });
                break;
            case 'deactivate':
                router.patch(route('employees.deactivate', { employee: id }), {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Employee deactivated successfully.');
                        setDialogAction({ type: 'deactivate', employee: null });
                    },
                    onError: (err) => {
                        toast.error(err.error || 'Failed to deactivate employee.');
                    }
                });
                break;
            case 'activate':
                router.patch(route('employees.activate', { employee: id }), {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Employee activated successfully.');
                        setDialogAction({ type: 'activate', employee: null });
                    },
                    onError: (err) => {
                        toast.error(err.error || 'Failed to activate employee.');
                    }
                });
                break;
            case 'reset':
                router.post(route('employees.reset-password', { employee: id }), {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Password reset link sent.');
                        setDialogAction({ type: 'reset', employee: null });
                    },
                    onError: (err) => {
                        toast.error(err.error || 'Failed to send reset link.');
                    }
                });
                break;
        }
    };

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <AppLayout
            title="Employees"
            breadcrumbs={[{ label: 'Dashboard', href: route('admin.dashboard') }, { label: 'Employees' }]}
        >
            <Head title="Employees" />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
                    <p className="text-muted-foreground mt-1">Manage staff accounts and permissions.</p>
                </div>
                <div className="flex space-x-2">
                    {canManage && (
                        <Button onClick={() => {
                            setEditingEmployee(null);
                            setIsSheetOpen(true);
                        }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Employee
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6 bg-card p-4 rounded-xl border border-border shadow-sm">
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
                        onValueChange={(val) => {
                            setRoleFilter(val as string);
                            applyFilters({ role: val as string });
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
                        onValueChange={(val) => {
                            setStatusFilter(val as string);
                            applyFilters({ status: val as string });
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[150px] bg-background">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <EmptyState title="No employees found" description="Try adjusting your filters or create a new employee." />
                                </TableCell>
                            </TableRow>
                        ) : (
                            employees.data.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={employee.avatar_url ?? undefined} />
                                                <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <Link href={route('employees.show', { employee: employee.id.toString() })} className="font-medium hover:underline">
                                                    {employee.name}
                                                </Link>
                                                <span className="text-xs text-muted-foreground">{employee.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {employee.role?.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge type="user" status={employee.status as any} />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(employee.created_at || '').toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {canManage && employee.id !== currentUser?.id && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger render={
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                } />
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem
                                                        render={<button onClick={() => { setEditingEmployee(employee); setIsSheetOpen(true); }} className="w-full flex items-center cursor-pointer" />}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        render={<button onClick={() => setDialogAction({ type: 'reset', employee })} className="w-full flex items-center cursor-pointer" />}
                                                    >
                                                        <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {employee.status === 'active' ? (
                                                        <DropdownMenuItem
                                                            render={<button onClick={() => setDialogAction({ type: 'deactivate', employee })} className="w-full flex items-center cursor-pointer text-orange-500 focus:text-orange-500" />}
                                                        >
                                                            <PowerOff className="mr-2 h-4 w-4" /> Deactivate
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            render={<button onClick={() => setDialogAction({ type: 'activate', employee })} className="w-full flex items-center cursor-pointer text-emerald-500 focus:text-emerald-500" />}
                                                        >
                                                            <Power className="mr-2 h-4 w-4" /> Activate
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        render={<button onClick={() => setDialogAction({ type: 'delete', employee })} className="w-full flex items-center cursor-pointer" />}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Employee
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {employees.data.length === 0 ? (
                    <Card>
                        <CardContent className="py-8">
                            <EmptyState title="No employees found" description="Try adjusting your filters." />
                        </CardContent>
                    </Card>
                ) : (
                    employees.data.map((employee) => (
                        <Card key={employee.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={employee.avatar_url ?? undefined} />
                                            <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <Link href={route('employees.show', { employee: employee.id.toString() })} className="font-medium hover:underline block">
                                                {employee.name}
                                            </Link>
                                            <span className="text-xs text-muted-foreground block">{employee.email}</span>
                                            <div className="mt-2 flex gap-2">
                                                <Badge variant="outline" className="capitalize text-[0.65rem]">{employee.role?.replace('_', ' ')}</Badge>
                                                <StatusBadge type="user" status={employee.status as any} className="text-[0.65rem]" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {canManage && employee.id !== currentUser?.id && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger render={
                                                <Button variant="ghost" size="icon" className="-mr-2 -mt-2">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            } />
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem
                                                    render={<button onClick={() => { setEditingEmployee(employee); setIsSheetOpen(true); }} className="w-full flex items-center cursor-pointer" />}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    render={<button onClick={() => setDialogAction({ type: 'reset', employee })} className="w-full flex items-center cursor-pointer" />}
                                                >
                                                    <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {employee.status === 'active' ? (
                                                    <DropdownMenuItem
                                                        render={<button onClick={() => setDialogAction({ type: 'deactivate', employee })} className="w-full flex items-center cursor-pointer text-orange-500 focus:text-orange-500" />}
                                                    >
                                                        <PowerOff className="mr-2 h-4 w-4" /> Deactivate
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        render={<button onClick={() => setDialogAction({ type: 'activate', employee })} className="w-full flex items-center cursor-pointer text-emerald-500 focus:text-emerald-500" />}
                                                    >
                                                        <Power className="mr-2 h-4 w-4" /> Activate
                                                    </DropdownMenuItem>
                                                )}
                                                
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    render={<button onClick={() => setDialogAction({ type: 'delete', employee })} className="w-full flex items-center cursor-pointer" />}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Employee
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Employee Sheet */}
            <EmployeeSheet
                isOpen={isSheetOpen}
                onClose={() => {
                    setIsSheetOpen(false);
                    setTimeout(() => setEditingEmployee(null), 300);
                }}
                employee={editingEmployee}
                roles={roles}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={!!dialogAction.employee}
                onOpenChange={(open) => !open && setDialogAction({ type: 'delete', employee: null })}
                title={
                    dialogAction.type === 'delete' ? 'Delete Employee?' :
                    dialogAction.type === 'deactivate' ? 'Deactivate Employee?' :
                    dialogAction.type === 'activate' ? 'Activate Employee?' :
                    'Send Password Reset?'
                }
                description={
                    dialogAction.type === 'delete' ? `Are you sure you want to completely remove ${dialogAction.employee?.name} from the system? This action cannot be undone.` :
                    dialogAction.type === 'deactivate' ? `${dialogAction.employee?.name} will lose all access to the system and active sessions will be terminated.` :
                    dialogAction.type === 'activate' ? `${dialogAction.employee?.name} will regain access to the system.` :
                    `An email will be sent to ${dialogAction.employee?.email} with instructions to reset their password.`
                }
                onConfirm={() => confirmAction()}
                isDanger={dialogAction.type === 'delete' || dialogAction.type === 'deactivate'}
            />
        </AppLayout>
    );
}
