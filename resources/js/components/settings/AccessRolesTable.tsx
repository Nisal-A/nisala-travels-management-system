import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ShieldCheck, Users, Info } from 'lucide-react';
import { SettingsPanel } from './SettingsPanel';

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

    const roleMeta = (role: RoleData) =>
        ROLE_METADATA[role.name] ?? {
            label: role.name.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            description: 'Custom system security role.',
            variant: 'outline' as const,
        };

    return (
        <SettingsPanel
            title="System Roles & User Distribution"
            description="Read-only overview of assigned security roles and total active users in each group."
            icon={ShieldCheck}
            headerAction={
                <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary border-primary/20">
                    <Users className="size-3.5" />
                    {totalUsers} total accounts
                </span>
            }
        >
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b bg-muted/50">
                    <h3 className="font-bold text-sm text-foreground">Roles</h3>
                </div>

                {/* Desktop table */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Role</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[100px]">Guard</TableHead>
                                <TableHead className="text-right w-[100px]">Users</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => {
                                const meta = roleMeta(role);
                                return (
                                    <TableRow key={role.id}>
                                        <TableCell className="font-medium text-foreground">{meta.label}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground whitespace-normal">
                                            {meta.description}
                                        </TableCell>
                                        <TableCell className="text-xs font-mono text-muted-foreground">
                                            {role.guard_name}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold tabular-nums">
                                            {role.users_count}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile stacked cards */}
                <div className="md:hidden divide-y">
                    {roles.map((role) => {
                        const meta = roleMeta(role);
                        return (
                            <div key={role.id} className="p-4 space-y-1">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="font-medium text-foreground">{meta.label}</span>
                                    <span className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums">
                                        <Users className="size-3.5 text-muted-foreground" />
                                        {role.users_count}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">{meta.description}</p>
                                <p className="text-xs font-mono text-muted-foreground">{role.guard_name}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="size-4 shrink-0 mt-0.5" />
                <span>
                    Role assignments and permissions are strictly enforced via backend middleware. Only authorized super
                    administrators can provision accounts or alter security groups.
                </span>
            </div>
        </SettingsPanel>
    );
}
