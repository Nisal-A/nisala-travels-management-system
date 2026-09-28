import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    CalendarCheck,
    CreditCard,
    FileText,
    Map,
    BarChart3,
    ArrowUpRight,
    TrendingUp,
} from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Dashboard Page — NT-005.4
 *
 * Role-aware dashboard that shows relevant summary cards based on
 * the authenticated user's role. Uses the shared AppLayout with
 * sidebar navigation.
 */

interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: ReactNode;
    trend?: string;
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
    return (
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="rounded-lg bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/15">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    {trend && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-emerald-500">
                            <TrendingUp className="h-3 w-3" />
                            {trend}
                        </span>
                    )}
                    <span>{description}</span>
                </div>
            </CardContent>
        </Card>
    );
}

export default function Dashboard() {
    const { user, hasRole } = useAuth();

    const isOffice = hasRole('super_admin', 'manager', 'staff', 'finance');
    const isCustomer = hasRole('customer');

    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* Welcome Section */}
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Welcome back, {user?.name?.split(' ')[0]}
                    </h2>
                    <p className="text-muted-foreground">
                        {isCustomer
                            ? 'Here\'s an overview of your travel activity.'
                            : 'Here\'s what\'s happening in your travel agency today.'
                        }
                    </p>
                </div>

                {/* Office Dashboard */}
                {isOffice && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {hasRole('super_admin', 'manager', 'staff') && (
                            <StatCard
                                title="Total Customers"
                                value="—"
                                description="Active customer profiles"
                                icon={<Users className="h-4 w-4" />}
                            />
                        )}
                        {hasRole('super_admin', 'manager', 'staff') && (
                            <StatCard
                                title="Active Bookings"
                                value="—"
                                description="Currently in progress"
                                icon={<CalendarCheck className="h-4 w-4" />}
                            />
                        )}
                        {hasRole('super_admin', 'manager', 'finance') && (
                            <StatCard
                                title="Payments"
                                value="—"
                                description="This month's collections"
                                icon={<CreditCard className="h-4 w-4" />}
                            />
                        )}
                        {hasRole('super_admin', 'manager', 'staff') && (
                            <StatCard
                                title="Pending Documents"
                                value="—"
                                description="Awaiting verification"
                                icon={<FileText className="h-4 w-4" />}
                            />
                        )}
                    </div>
                )}

                {/* Customer Portal Dashboard */}
                {isCustomer && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard
                            title="My Bookings"
                            value="—"
                            description="Total bookings"
                            icon={<CalendarCheck className="h-4 w-4" />}
                        />
                        <StatCard
                            title="My Documents"
                            value="—"
                            description="Uploaded documents"
                            icon={<FileText className="h-4 w-4" />}
                        />
                        <StatCard
                            title="My Payments"
                            value="—"
                            description="Payment records"
                            icon={<CreditCard className="h-4 w-4" />}
                        />
                    </div>
                )}

                {/* Placeholder content area */}
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="rounded-2xl bg-muted p-4 mb-4">
                            <BarChart3 className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardTitle className="mb-2 text-base">Dashboard Content</CardTitle>
                        <CardDescription className="max-w-sm">
                            Detailed analytics and charts will be built in a future module.
                            The role-aware navigation is now active.
                        </CardDescription>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
