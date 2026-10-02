import { Deferred, Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Users,
    CalendarCheck,
    CreditCard,
    FileText,
    TrendingUp,
    TrendingDown,
    Activity,
    AlertCircle,
    CheckCircle2,
    Clock
} from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Dashboard Page
 */

interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: ReactNode;
    trend?: 'up' | 'down';
    trendValue?: string | number;
    linkTo?: string;
}

function StatCard({ title, value, description, icon, trend, trendValue, linkTo }: StatCardProps) {
    const content = (
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 h-full">
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
                    {trend && trendValue !== undefined && trendValue !== 0 && (
                        <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {trendValue}
                        </span>
                    )}
                    <span>{description}</span>
                </div>
            </CardContent>
        </Card>
    );

    if (linkTo) {
        return <Link href={linkTo} className="block h-full">{content}</Link>;
    }

    return content;
}

function StatCardSkeleton() {
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-3 w-2/3" />
            </CardContent>
        </Card>
    );
}

interface DashboardProps {
    officeStats?: {
        todaysBookings?: { count: number; trend: 'up' | 'down'; diff: number };
        pendingDocuments?: number;
        newLeads?: number;
        pendingPayments?: { count: number; total: number };
        recentActivity?: any[];
        tasks?: any[];
    };
    customerStats?: {
        myBookings?: number | null;
        myDocuments?: number | null;
        myPayments?: number | null;
    };
}

export default function Dashboard({ officeStats, customerStats }: DashboardProps) {
    const { user, hasRole } = useAuth();
    const isOffice = hasRole('super_admin', 'manager', 'staff', 'finance');
    const isCustomer = hasRole('customer');
    const isFinance = hasRole('finance', 'super_admin');
    const isSales = hasRole('staff', 'manager', 'super_admin');

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
                    <Deferred data="officeStats" fallback={
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
                        </div>
                    }>
                        <div className="space-y-8">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {isFinance && officeStats?.pendingPayments && (
                                        <StatCard
                                            title="Pending Payments"
                                            value={`Rs. ${Number(officeStats.pendingPayments.total).toLocaleString()}`}
                                            description={`${officeStats.pendingPayments.count} bookings with balances`}
                                            icon={<CreditCard className="h-4 w-4" />}
                                            linkTo="/bookings?status=Pending"
                                        />
                                    )}

                                    {isSales && officeStats?.todaysBookings && (
                                        <StatCard
                                            title="Today's Bookings"
                                            value={officeStats.todaysBookings.count.toString()}
                                            description="vs yesterday"
                                            icon={<CalendarCheck className="h-4 w-4" />}
                                            trend={officeStats.todaysBookings.trend}
                                            trendValue={officeStats.todaysBookings.diff}
                                            linkTo="/bookings"
                                        />
                                    )}

                                    {isSales && officeStats?.newLeads !== undefined && (
                                        <StatCard
                                            title="New Leads"
                                            value={officeStats.newLeads.toString()}
                                            description="in the last 7 days"
                                            icon={<Users className="h-4 w-4" />}
                                            linkTo="/customers"
                                        />
                                    )}

                                    {isSales && officeStats?.pendingDocuments !== undefined && (
                                        <StatCard
                                            title="Document Actions"
                                            value={officeStats.pendingDocuments.toString()}
                                            description="Expiring or awaiting verification"
                                            icon={<FileText className="h-4 w-4" />}
                                            linkTo="/documents"
                                        />
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                    <Card className="col-span-4 flex flex-col h-[400px]">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Activity className="h-5 w-5 text-primary" />
                                                Recent Activity
                                            </CardTitle>
                                            <CardDescription>
                                                Latest actions across the platform.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 overflow-y-auto pr-2">
                                            {officeStats?.recentActivity?.length === 0 ? (
                                                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                                                    <Activity className="mb-2 h-6 w-6 opacity-50" />
                                                    <p className="text-sm">No recent activity.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {officeStats?.recentActivity?.map((activity: any) => (
                                                        <div key={activity.id} className="flex gap-4">
                                                            <div className="mt-0.5">
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                                                                    {activity.type === 'new_booking' && <CalendarCheck className="h-4 w-4 text-blue-500" />}
                                                                    {activity.type === 'payment_received' && <CreditCard className="h-4 w-4 text-emerald-500" />}
                                                                    {activity.type === 'document_uploaded' && <FileText className="h-4 w-4 text-amber-500" />}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col flex-1">
                                                                <p className="text-sm font-medium leading-none mb-1">{activity.title}</p>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" /> {activity.time}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card className="col-span-3 flex flex-col h-[400px]">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                                Tasks Due
                                            </CardTitle>
                                            <CardDescription>
                                                Upcoming deadlines and follow-ups.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 overflow-y-auto pr-2">
                                            {officeStats?.tasks?.length === 0 ? (
                                                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                                                    <CheckCircle2 className="mb-2 h-6 w-6 opacity-50" />
                                                    <p className="text-sm">You're all caught up!</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {officeStats?.tasks?.map((task: any) => (
                                                        <div key={task.id} className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                                                            <input type="checkbox" id={task.id} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                                            <div className="grid gap-1.5 flex-1">
                                                                <label
                                                                    htmlFor={task.id}
                                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                                >
                                                                    {task.title}
                                                                </label>
                                                                <div className="flex items-center gap-2">
                                                                    {task.is_overdue ? (
                                                                        <Badge variant="destructive" className="text-[0.65rem] px-1 py-0 h-4">Overdue</Badge>
                                                                    ) : (
                                                                        <Badge variant="secondary" className="text-[0.65rem] px-1 py-0 h-4">Upcoming</Badge>
                                                                    )}
                                                                    <span className="text-xs text-muted-foreground">{task.due}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                    </Deferred>
                )}

                {/* Customer Portal Dashboard */}
                {isCustomer && customerStats && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard
                            title="My Bookings"
                            value={customerStats.myBookings?.toString() ?? '—'}
                            description="Total bookings (Not implemented)"
                            icon={<CalendarCheck className="h-4 w-4" />}
                        />
                        <StatCard
                            title="My Documents"
                            value={customerStats.myDocuments?.toString() ?? '—'}
                            description="Uploaded documents (Not implemented)"
                            icon={<FileText className="h-4 w-4" />}
                        />
                        <StatCard
                            title="My Payments"
                            value={customerStats.myPayments?.toString() ?? '—'}
                            description="Payment records (Not implemented)"
                            icon={<CreditCard className="h-4 w-4" />}
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
