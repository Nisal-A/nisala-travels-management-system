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
    CheckCircle2,
    Clock,
    ArrowRight,
    CircleDot,
    Bookmark,
    AlertTriangle,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

/**
 * Dashboard — Staff Home
 *
 * Displays KPI tiles, recent activity feed, and a tasks-due panel.
 * Tiles are role-ordered: Finance sees payment-focused first, Sales sees leads first.
 * Uses Inertia deferred loading with skeleton placeholders for perceived instant load.
 */

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

interface TrendData {
    count: number;
    trend: 'up' | 'down';
    diff: number;
}

interface PaymentTrend extends TrendData {
    total: number;
}

interface DocTrend extends TrendData {
    expiring: number;
    pendingVerification: number;
}

interface ActivityItem {
    id: string;
    type: 'new_booking' | 'payment_received' | 'document_uploaded' | 'lead_submitted';
    title: string;
    time: string;
    created_at: string;
    link?: string;
}

interface TaskItem {
    id: string;
    title: string;
    due: string;
    due_date: string;
    is_overdue: boolean;
    type: 'payment' | 'document' | 'follow_up';
    link?: string;
}

interface OfficeStats {
    todaysBookings?: TrendData;
    pendingPayments?: PaymentTrend;
    pendingDocuments?: DocTrend;
    newLeads?: TrendData;
    tileOrder?: string[];
    recentActivity?: ActivityItem[];
    tasks?: TaskItem[];
}

interface DashboardProps {
    officeStats?: OfficeStats;
    customerStats?: {
        myBookings?: number | null;
        myDocuments?: number | null;
        myPayments?: number | null;
    };
}

// ────────────────────────────────────────────────────────────────────────────
// StatCard Component
// ────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: ReactNode;
    trend?: 'up' | 'down';
    trendValue?: string | number;
    linkTo?: string;
    accentColor?: string;
}

function StatCard({ title, value, description, icon, trend, trendValue, linkTo, accentColor = 'primary' }: StatCardProps) {
    const accentClasses: Record<string, { bg: string; icon: string; hover: string }> = {
        primary: { bg: 'from-primary/[0.06] to-primary/[0.02]', icon: 'bg-primary/10 text-primary group-hover:bg-primary/15', hover: 'hover:shadow-primary/5' },
        blue: { bg: 'from-blue-500/[0.06] to-blue-500/[0.02]', icon: 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/15', hover: 'hover:shadow-blue-500/5' },
        emerald: { bg: 'from-emerald-500/[0.06] to-emerald-500/[0.02]', icon: 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/15', hover: 'hover:shadow-emerald-500/5' },
        amber: { bg: 'from-amber-500/[0.06] to-amber-500/[0.02]', icon: 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/15', hover: 'hover:shadow-amber-500/5' },
        rose: { bg: 'from-rose-500/[0.06] to-rose-500/[0.02]', icon: 'bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/15', hover: 'hover:shadow-rose-500/5' },
    };

    const accent = accentClasses[accentColor] ?? accentClasses.primary;

    const content = (
        <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${accent.hover} hover:-translate-y-0.5 h-full border-border/60`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${accent.bg} opacity-0 transition-opacity group-hover:opacity-100`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={`rounded-lg p-2.5 transition-colors ${accent.icon}`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    {trend && trendValue !== undefined && trendValue !== 0 && (
                        <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium ${
                            trend === 'up'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {trendValue}
                        </span>
                    )}
                    <span>{description}</span>
                </div>
                {linkTo && (
                    <div className="mt-3 flex items-center text-xs font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0">
                        View all <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                )}
            </CardContent>
        </Card>
    );

    if (linkTo) {
        return <Link href={linkTo} className="block h-full">{content}</Link>;
    }

    return content;
}

// ────────────────────────────────────────────────────────────────────────────
// Skeleton Components
// ────────────────────────────────────────────────────────────────────────────

function StatCardSkeleton() {
    return (
        <Card className="h-full border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-9 rounded-lg" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3.5 w-32" />
            </CardContent>
        </Card>
    );
}

function ActivityFeedSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function TasksPanelSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                    <Skeleton className="h-4 w-4 mt-1 rounded" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3.5 w-24" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function DashboardLoadingSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 flex flex-col h-[420px] border-border/60">
                    <CardHeader>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48 mt-1" />
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ActivityFeedSkeleton />
                    </CardContent>
                </Card>
                <Card className="col-span-3 flex flex-col h-[420px] border-border/60">
                    <CardHeader>
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-44 mt-1" />
                    </CardHeader>
                    <CardContent className="flex-1">
                        <TasksPanelSkeleton />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Activity Feed Icons
// ────────────────────────────────────────────────────────────────────────────

const activityIcons: Record<string, { icon: ReactNode; bg: string }> = {
    new_booking: { icon: <CalendarCheck className="h-4 w-4" />, bg: 'bg-blue-500/10 text-blue-500' },
    payment_received: { icon: <CreditCard className="h-4 w-4" />, bg: 'bg-emerald-500/10 text-emerald-500' },
    document_uploaded: { icon: <FileText className="h-4 w-4" />, bg: 'bg-amber-500/10 text-amber-500' },
    lead_submitted: { icon: <Users className="h-4 w-4" />, bg: 'bg-purple-500/10 text-purple-500' },
};

// ────────────────────────────────────────────────────────────────────────────
// Main Dashboard Component
// ────────────────────────────────────────────────────────────────────────────

export default function Dashboard({ officeStats, customerStats }: DashboardProps) {
    const { user, hasRole } = useAuth();
    const isOffice = hasRole('super_admin', 'manager', 'staff', 'finance');
    const isCustomer = hasRole('customer');
    const isFinance = hasRole('finance', 'super_admin');
    const isSales = hasRole('staff', 'manager', 'super_admin');

    const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());

    const toggleTask = (taskId: string) => {
        setCheckedTasks(prev => {
            const next = new Set(prev);
            if (next.has(taskId)) {
                next.delete(taskId);
            } else {
                next.add(taskId);
            }
            return next;
        });
    };

    // ── Build tile list based on role ordering ───────────────────────

    const buildTiles = (stats: OfficeStats) => {
        const tileOrder = stats.tileOrder ?? ['todaysBookings', 'pendingPayments', 'newLeads', 'pendingDocuments'];

        const tileMap: Record<string, ReactNode | null> = {
            todaysBookings: isSales && stats.todaysBookings ? (
                <StatCard
                    key="todaysBookings"
                    title="Today's Bookings"
                    value={stats.todaysBookings.count.toString()}
                    description="vs yesterday"
                    icon={<CalendarCheck className="h-4 w-4" />}
                    trend={stats.todaysBookings.trend}
                    trendValue={stats.todaysBookings.diff}
                    linkTo="/bookings"
                    accentColor="blue"
                />
            ) : null,

            pendingPayments: isFinance && stats.pendingPayments ? (
                <StatCard
                    key="pendingPayments"
                    title="Pending Payments"
                    value={`Rs. ${Number(stats.pendingPayments.total).toLocaleString()}`}
                    description={`${stats.pendingPayments.count} bookings with balances`}
                    icon={<CreditCard className="h-4 w-4" />}
                    trend={stats.pendingPayments.trend}
                    trendValue={`Rs. ${Number(stats.pendingPayments.diff).toLocaleString()}`}
                    linkTo="/payments"
                    accentColor="rose"
                />
            ) : null,

            newLeads: isSales && stats.newLeads ? (
                <StatCard
                    key="newLeads"
                    title="New Leads"
                    value={stats.newLeads.count.toString()}
                    description="in the last 7 days"
                    icon={<Users className="h-4 w-4" />}
                    trend={stats.newLeads.trend}
                    trendValue={stats.newLeads.diff}
                    linkTo="/customers"
                    accentColor="emerald"
                />
            ) : null,

            pendingDocuments: isSales && stats.pendingDocuments ? (
                <StatCard
                    key="pendingDocuments"
                    title="Document Actions"
                    value={stats.pendingDocuments.count.toString()}
                    description={`${stats.pendingDocuments.expiring} expiring · ${stats.pendingDocuments.pendingVerification} pending`}
                    icon={<FileText className="h-4 w-4" />}
                    trend={stats.pendingDocuments.trend}
                    trendValue={stats.pendingDocuments.diff}
                    linkTo="/documents"
                    accentColor="amber"
                />
            ) : null,
        };

        return tileOrder
            .map(key => tileMap[key])
            .filter(Boolean);
    };

    // ── Overdue count ────────────────────────────────────────────────

    const overdueCount = officeStats?.tasks?.filter(t => t.is_overdue && !checkedTasks.has(t.id)).length ?? 0;

    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* Welcome Section */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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
                    {isOffice && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CircleDot className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                            <span>Live data · refreshes every 60s</span>
                        </div>
                    )}
                </div>

                {/* Office Dashboard */}
                {isOffice && (
                    <Deferred data="officeStats" fallback={<DashboardLoadingSkeleton />}>
                        <div className="space-y-8">
                            {/* KPI Tiles */}
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {officeStats && buildTiles(officeStats)}
                            </div>

                            {/* Activity Feed + Tasks */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                {/* Recent Activity Feed */}
                                <Card className="col-span-4 flex flex-col h-[420px] border-border/60">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <Activity className="h-4.5 w-4.5 text-primary" />
                                                Recent Activity
                                            </CardTitle>
                                            <Badge variant="secondary" className="text-[0.65rem] font-medium">
                                                Last 15 events
                                            </Badge>
                                        </div>
                                        <CardDescription>
                                            Latest actions across the platform.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-y-auto pr-2">
                                        {(!officeStats?.recentActivity || officeStats.recentActivity.length === 0) ? (
                                            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                                                <Activity className="mb-2 h-8 w-8 opacity-30" />
                                                <p className="text-sm font-medium">No recent activity</p>
                                                <p className="text-xs mt-1">Activity will appear here as events occur.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {officeStats.recentActivity.map((activity, index) => {
                                                    const config = activityIcons[activity.type] ?? activityIcons.new_booking;
                                                    return (
                                                        <Link
                                                            key={activity.id}
                                                            href={activity.link ?? '#'}
                                                            className="flex gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50 group"
                                                        >
                                                            <div className="mt-0.5 shrink-0">
                                                                <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${config.bg}`}>
                                                                    {config.icon}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col flex-1 min-w-0">
                                                                <p className="text-sm font-medium leading-tight truncate group-hover:text-foreground">
                                                                    {activity.title}
                                                                </p>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                                    <Clock className="h-3 w-3" /> {activity.time}
                                                                </span>
                                                            </div>
                                                            <ArrowRight className="h-4 w-4 mt-1 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors shrink-0" />
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Tasks Due Panel */}
                                <Card className="col-span-3 flex flex-col h-[420px] border-border/60">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <CheckCircle2 className="h-4.5 w-4.5 text-primary" />
                                                Tasks Due
                                            </CardTitle>
                                            {overdueCount > 0 && (
                                                <Badge variant="destructive" className="text-[0.65rem] font-medium gap-1">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    {overdueCount} overdue
                                                </Badge>
                                            )}
                                        </div>
                                        <CardDescription>
                                            Upcoming deadlines and follow-ups.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-y-auto pr-2">
                                        {(!officeStats?.tasks || officeStats.tasks.length === 0) ? (
                                            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                                                <CheckCircle2 className="mb-2 h-8 w-8 opacity-30" />
                                                <p className="text-sm font-medium">You're all caught up!</p>
                                                <p className="text-xs mt-1">No pending tasks right now.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {officeStats.tasks.map((task) => {
                                                    const isChecked = checkedTasks.has(task.id);
                                                    const taskTypeIcon = task.type === 'payment'
                                                        ? <CreditCard className="h-3.5 w-3.5" />
                                                        : task.type === 'document'
                                                            ? <FileText className="h-3.5 w-3.5" />
                                                            : <Bookmark className="h-3.5 w-3.5" />;

                                                    return (
                                                        <div
                                                            key={task.id}
                                                            className={`flex items-start gap-3 rounded-lg border p-3 transition-all duration-200 ${
                                                                isChecked
                                                                    ? 'bg-muted/30 border-border/40 opacity-60'
                                                                    : task.is_overdue
                                                                        ? 'border-rose-500/30 bg-rose-500/[0.03] hover:bg-rose-500/[0.06]'
                                                                        : 'border-border/60 hover:bg-muted/50'
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => toggleTask(task.id)}
                                                                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                            />
                                                            <div className="grid gap-1 flex-1 min-w-0">
                                                                <Link
                                                                    href={task.link ?? '#'}
                                                                    className={`text-sm font-medium leading-tight hover:underline ${isChecked ? 'line-through' : ''}`}
                                                                >
                                                                    {task.title}
                                                                </Link>
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    {task.is_overdue ? (
                                                                        <Badge variant="destructive" className="text-[0.6rem] px-1.5 py-0 h-4 gap-0.5">
                                                                            <AlertTriangle className="h-2.5 w-2.5" />
                                                                            Overdue
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge variant="secondary" className="text-[0.6rem] px-1.5 py-0 h-4">
                                                                            Upcoming
                                                                        </Badge>
                                                                    )}
                                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                        {taskTypeIcon}
                                                                        {task.due}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
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
                            description="Total bookings"
                            icon={<CalendarCheck className="h-4 w-4" />}
                            linkTo="/portal/bookings"
                            accentColor="blue"
                        />
                        <StatCard
                            title="My Documents"
                            value={customerStats.myDocuments?.toString() ?? '—'}
                            description="Uploaded documents"
                            icon={<FileText className="h-4 w-4" />}
                            linkTo="/portal/documents"
                            accentColor="amber"
                        />
                        <StatCard
                            title="My Payments"
                            value={customerStats.myPayments?.toString() ?? '—'}
                            description="Payment records"
                            icon={<CreditCard className="h-4 w-4" />}
                            linkTo="/portal/payments"
                            accentColor="emerald"
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
