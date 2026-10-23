import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Users, Info, Shield, ShieldAlert } from 'lucide-react';

export interface RoleData {
    id: number;
    name: string;
    guard_name: string;
    users_count: number;
}

interface AccessRolesTableProps {
    roles: RoleData[];
}

const ROLE_METADATA: Record<string, { label: string; description: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    super_admin: {
        label: 'Super Admin',
        description: 'Complete unrestricted access across all system modules and configuration.',
        variant: 'destructive',
    },
    manager: {
        label: 'Manager',
        description: 'Operational management including tours, destinations, reports, and staff assignments.',
        variant: 'default',
    },
    staff: {
        label: 'Staff',
        description: 'Daily operational tasks, customer interactions, and booking assistance.',
        variant: 'secondary',
    },
    finance: {
        label: 'Finance',
        description: 'Financial ledger, payment validation, installments, and billing reports.',
        variant: 'outline',
    },
    customer: {
        label: 'Customer',
        description: 'Self-service portal access for travelers to view bookings and upload documents.',
        variant: 'outline',
    },
};

export function AccessRolesTable({ roles }: AccessRolesTableProps) {
    const totalUsers = roles.reduce((sum, r) => sum + (r.users_count || 0), 0);

    return (
        <Card className="border shadow-sm">
            <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">System Roles & User Distribution</CardTitle>
                            <CardDescription>
                                Read-only overview of assigned security roles and total active users in each group.
                            </CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="gap-1.5 px-3 py-1 font-semibold text-sm">
                        <Users className="h-4 w-4 text-primary" />
                        {totalUsers} Total Accounts
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-5">
                <div className="rounded-xl border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[200px]">Role</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[120px]">Guard</TableHead>
                                <TableHead className="text-right w-[140px]">Users Count</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => {
                                const meta = ROLE_METADATA[role.name] ?? {
                                    label: role.name.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                                    description: 'Custom system security role.',
                                    variant: 'outline' as const,
                                };

                                return (
                                    <TableRow key={role.id}>
                                        <TableCell className="font-semibold">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={meta.variant} className="capitalize">
                                                    {meta.label}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {meta.description}
                                        </TableCell>
                                        <TableCell className="text-xs font-mono text-muted-foreground">
                                            {role.guard_name}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="inline-flex items-center gap-1.5 font-semibold text-sm tabular-nums px-2.5 py-1 rounded-md bg-muted">
                                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                {role.users_count}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-muted/40 text-xs text-muted-foreground border">
                    <Info className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                    <span>
                        Role assignments and permissions are strictly enforced via backend middleware. Only authorized super administrators can provision accounts or alter security groups.
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
