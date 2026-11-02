import { Deferred, Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader, StatusBadge, MoneyText, EmptyState, ErrorState } from '@/components/common';
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
    CircleDot,
    Bookmark,
    AlertTriangle,
    PlaneTakeoff,
    ChevronRight,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

/**
 * Dashboard — Staff Home
 *
 * Displays KPI tiles, recent activity feed, tasks-due panel, and upcoming departures.
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

interface UpcomingDepartureItem {
    id: string | number;
    reference?: string;
    tour_name?: string;
    customer_name?: string;
    departure_date?: string;
    status?: string;
    balance_amount?: number;
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
    upcomingDepartures?: UpcomingDepartureItem[];
}

interface DashboardProps {
    officeStats?: OfficeStats;
    customerStats?: {
        myBookings?: number | null;
        myDocuments?: number | null;
        myPayments?: number | null;
    };
    upcomingDepartures?: UpcomingDepartureItem[];
}

// ────────────────────────────────────────────────────────────────────────────
// StatCard Component (Summary Tile style)
// ────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
    title: string;
    value: ReactNode;
    description: string;
    icon: ReactNode;
    trend?: 'up' | 'down';
    trendValue?: ReactNode;
    linkTo?: string;
    iconTint: string;
}

function StatCard({
    title,
    value,
    description,
    icon,
    trend,
    trendValue,
    linkTo,
    iconTint,
}: StatCardProps) {
    const cardContent = (
        <div className="flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
                    {title}
                </span>
                <div className={`size-8 rounded-lg grid place-items-center shrink-0 ${iconTint}`}>
                    {icon}
                </div>
            </div>
            <div className="mt-3">
                <div className="text-2xl font-semibold tracking-tight text-foreground truncate">
                    {value}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                    {trend && trendValue !== undefined && trendValue !== 0 && (
                        <span
                            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium border ${
                                trend === 'up'
                                    ? 'bg-success/10 text-success border-success/20'
                                    : 'bg-destructive/10 text-destructive border-destructive/20'
                            }`}
                        >
                            {trend === 'up' ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                            {trendValue}
                        </span>
                    )}
                    <span className="truncate">{description}</span>
                </div>
            </div>
        </div>
    );

    if (linkTo) {
        return (
            <Link
                href={linkTo}
                className="group block rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 ring-ring"
            >
                {cardContent}
            </Link>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            {cardContent}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Skeleton Components
// ────────────────────────────────────────────────────────────────────────────

function StatCardSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="size-8 rounded-lg" />
            </div>
            <div className="mt-3">
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3.5 w-32" />
            </div>
        </div>
    );
}

function CardSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-[480px]">
            <div className="px-6 py-4 border-b border-border bg-muted/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Skeleton className="size-4 rounded" />
                    <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-3 w-16" />
            </div>
            <div className="p-6 space-y-4 flex-1">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="size-8 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-3.5 w-3/4" />
                            <Skeleton className="h-2.5 w-1/3" />
                        </div>
                        <Skeleton className="h-5 w-16 rounded-full shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function DashboardLoadingSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Activity Feed Configs
// ────────────────────────────────────────────────────────────────────

interface ActivityConfig {
    icon: ReactNode;
    tint: string;
    badgeType?: string;
    badgeStatus: string;
}

const activityConfigs: Record<string, ActivityConfig> = {
    new_booking: {
        icon: <CalendarCheck className="size-4" />,
        tint: 'bg-info/10 text-info border border-info/20',
        badgeType: 'booking',
        badgeStatus: 'Confirmed',
    },
    payment_received: {
        icon: <CreditCard className="size-4" />,
        tint: 'bg-success/10 text-success border border-success/20',
        badgeType: 'payment',
        badgeStatus: 'Paid',
    },
    document_uploaded: {
        icon: <FileText className="size-4" />,
        tint: 'bg-warning/10 text-warning border border-warning/20',
        badgeType: 'document',
        badgeStatus: 'Pending Review',
    },
    lead_submitted: {
        icon: <Users className="size-4" />,
        tint: 'bg-primary/10 text-primary border border-primary/20',
        badgeType: 'alert',
        badgeStatus: 'Available',
    },
};

function renderActivityTitle(activity: ActivityItem): ReactNode {
    if (activity.type === 'payment_received') {
        const match = activity.title.match(/Payment of LKR\s+([\d,.]+)\s+received from\s+(.*)/i);
        if (match) {
            const amount = parseFloat(match[1].replace(/,/g, ''));
            return (
                <span>
                    Payment of{' '}
                    <MoneyText
                        amount={amount}
                        currency="LKR"
                        weight="semibold"
                        className="font-semibold text-foreground"
                    />{' '}
                    received from {match[2]}
                </span>
            );
        }
    }
    return activity.title;
}

function renderTaskTitle(task: TaskItem): ReactNode {
    if (task.type === 'payment') {
        const match = task.title.match(/Collect balance LKR\s+([\d,.]+)\s+from\s+(.*)/i);
        if (match) {
            const amount = parseFloat(match[1].replace(/,/g, ''));
            return (
                <span>
                    Collect balance{' '}
                    <MoneyText
                        amount={amount}
                        currency="LKR"
                        weight="semibold"
                        className="font-semibold text-foreground"
                    />{' '}
                    from {match[2]}
                </span>
            );
        }
    }
    return task.title;
}

// ────────────────────────────────────────────────────────────────────────────
// Main Dashboard Component
// ────────────────────────────────────────────────────────────────────────────

export default function Dashboard({ officeStats, customerStats, upcomingDepartures }: DashboardProps) {
    const { user, hasRole } = useAuth();
    const isOffice = hasRole('super_admin', 'manager', 'staff', 'finance');
    const isCustomer = hasRole('customer');
    const isFinance = hasRole('finance', 'super_admin');
    const isSales = hasRole('staff', 'manager', 'super_admin');

    const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
    const [hasActivityError, setHasActivityError] = useState(false);
    const [hasTasksError, setHasTasksError] = useState(false);
    const [hasDeparturesError, setHasDeparturesError] = useState(false);

    const firstName = user?.name ? user.name.split(' ')[0] : undefined;
    const departures = officeStats?.upcomingDepartures ?? upcomingDepartures ?? [];

    const toggleTask = (taskId: string) => {
        setCheckedTasks((prev) => {
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
            todaysBookings:
                isSales && stats.todaysBookings ? (
                    <StatCard
                        key="todaysBookings"
                        title="Today's Bookings"
                        value={stats.todaysBookings.count.toString()}
                        description="vs yesterday"
                        icon={<CalendarCheck className="size-4" />}
                        trend={stats.todaysBookings.trend}
                        trendValue={stats.todaysBookings.diff}
                        linkTo="/bookings"
                        iconTint="bg-info/10 text-info border border-info/20"
                    />
                ) : null,

            pendingPayments:
                isFinance && stats.pendingPayments ? (
                    <StatCard
                        key="pendingPayments"
                        title="Pending Payments"
                        value={
                            <MoneyText
                                amount={Number(stats.pendingPayments.total)}
                                size="2xl"
                                weight="semibold"
                                className="text-2xl font-semibold text-foreground"
                            />
                        }
                        description={`${stats.pendingPayments.count} bookings with balances`}
                        icon={<CreditCard className="size-4" />}
                        trend={stats.pendingPayments.trend}
                        trendValue={
                            <MoneyText
                                amount={Number(stats.pendingPayments.diff)}
                                size="sm"
                                weight="medium"
                                className="text-[10px]"
                            />
                        }
                        linkTo="/payments"
                        iconTint="bg-success/10 text-success border border-success/20"
                    />
                ) : null,

            newLeads:
                isSales && stats.newLeads ? (
                    <StatCard
                        key="newLeads"
                        title="New Leads"
                        value={stats.newLeads.count.toString()}
                        description="in the last 7 days"
                        icon={<Users className="size-4" />}
                        trend={stats.newLeads.trend}
                        trendValue={stats.newLeads.diff}
                        linkTo="/customers"
                        iconTint="bg-primary/10 text-primary border border-primary/20"
                    />
                ) : null,

            pendingDocuments:
                isSales && stats.pendingDocuments ? (
                    <StatCard
                        key="pendingDocuments"
                        title="Document Actions"
                        value={stats.pendingDocuments.count.toString()}
                        description={`${stats.pendingDocuments.expiring} expiring · ${stats.pendingDocuments.pendingVerification} pending`}
                        icon={<FileText className="size-4" />}
                        trend={stats.pendingDocuments.trend}
                        trendValue={stats.pendingDocuments.diff}
                        linkTo="/documents"
                        iconTint="bg-warning/10 text-warning border border-warning/20"
                    />
                ) : null,
        };

        return tileOrder.map((key) => tileMap[key]).filter(Boolean);
    };

    // ── Overdue count ────────────────────────────────────────────────

    const overdueCount = officeStats?.tasks?.filter((t) => t.is_overdue && !checkedTasks.has(t.id)).length ?? 0;

    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* PageHeader with optional greeting */}
                <div className="space-y-2">
                    {firstName && (
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Welcome back, {firstName}
                        </p>
                    )}
                    <PageHeader
                        title="Dashboard"
                        description="Overview of today's bookings, payments, documents and leads."
                        actions={
                            isOffice ? (
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
                                    <CircleDot className="size-3 text-success animate-pulse" />
                                    <span>Live data · refreshes every 60s</span>
                                </div>
                            ) : undefined
                        }
                    />
                </div>

                {/* Office Dashboard */}
                {isOffice && (
                    <Deferred data="officeStats" fallback={<DashboardLoadingSkeleton />}>
                        <div className="space-y-8">
                            {/* KPI Tiles */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {officeStats && buildTiles(officeStats)}
                            </div>

                            {/* Recent Activity / Due Tasks / Upcoming Departures Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Recent Activity Card */}
                                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-[480px]">
                                    <div className="px-4 sm:px-6 py-4 border-b border-border bg-muted/50 flex items-center justify-between shrink-0">
                                        <h3 className="font-bold text-foreground flex items-center gap-2 text-base">
                                            <Activity className="size-4 text-primary" />
                                            <span>Recent Activity</span>
                                        </h3>
                                        <Link
                                            href="/bookings"
                                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 ring-ring rounded"
                                        >
                                            <span>View all</span>
                                            <ChevronRight className="size-3.5" />
                                        </Link>
                                    </div>

                                    {hasActivityError ? (
                                        <ErrorState
                                            icon={AlertTriangle}
                                            title="Failed to load activity"
                                            description="Could not load the latest activity feed."
                                            retryLabel="Retry"
                                            onRetry={() => {
                                                setHasActivityError(false);
                                                router.reload({ only: ['officeStats'] });
                                            }}
                                            className="border-none rounded-none py-12 flex-1"
                                        />
                                    ) : !officeStats?.recentActivity || officeStats.recentActivity.length === 0 ? (
                                        <EmptyState
                                            icon={Activity}
                                            title="No recent activity"
                                            description="Activity will appear here as bookings and events occur."
                                            className="border-none py-12 flex-1"
                                        />
                                    ) : (
                                        <div className="divide-y divide-border overflow-y-auto flex-1">
                                            {officeStats.recentActivity.map((activity) => {
                                                const config =
                                                    activityConfigs[activity.type] ?? activityConfigs.new_booking;
                                                return (
                                                    <Link
                                                        key={activity.id}
                                                        href={activity.link ?? '#'}
                                                        className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 hover:bg-muted/50 transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div
                                                                className={`size-8 rounded-lg grid place-items-center shrink-0 ${config.tint}`}
                                                            >
                                                                {config.icon}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                                                    {renderActivityTitle(activity)}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                                    <Clock className="size-3" />
                                                                    <span>{activity.time}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <StatusBadge
                                                                type={config.badgeType}
                                                                status={config.badgeStatus}
                                                            />
                                                            <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block" />
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Tasks Due Card */}
                                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-[480px]">
                                    <div className="px-4 sm:px-6 py-4 border-b border-border bg-muted/50 flex items-center justify-between shrink-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-foreground flex items-center gap-2 text-base">
                                                <CheckCircle2 className="size-4 text-primary" />
                                                <span>Tasks Due</span>
                                            </h3>
                                            {overdueCount > 0 && (
                                                <StatusBadge
                                                    status={`${overdueCount} overdue`}
                                                    className="bg-destructive/10 text-destructive border-destructive/20 ml-1"
                                                />
                                            )}
                                        </div>
                                        <Link
                                            href="/bookings"
                                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 ring-ring rounded"
                                        >
                                            <span>View all</span>
                                            <ChevronRight className="size-3.5" />
                                        </Link>
                                    </div>

                                    {hasTasksError ? (
                                        <ErrorState
                                            icon={AlertTriangle}
                                            title="Failed to load tasks"
                                            description="Could not load your pending tasks."
                                            retryLabel="Retry"
                                            onRetry={() => {
                                                setHasTasksError(false);
                                                router.reload({ only: ['officeStats'] });
                                            }}
                                            className="border-none rounded-none py-12 flex-1"
                                        />
                                    ) : !officeStats?.tasks || officeStats.tasks.length === 0 ? (
                                        <EmptyState
                                            icon={CheckCircle2}
                                            title="You're all caught up!"
                                            description="No pending tasks or deadlines right now."
                                            className="border-none py-12 flex-1"
                                        />
                                    ) : (
                                        <div className="divide-y divide-border overflow-y-auto flex-1">
                                            {officeStats.tasks.map((task) => {
                                                const isChecked = checkedTasks.has(task.id);
                                                const taskTypeIcon =
                                                    task.type === 'payment' ? (
                                                        <CreditCard className="size-3.5 text-muted-foreground" />
                                                    ) : task.type === 'document' ? (
                                                        <FileText className="size-3.5 text-muted-foreground" />
                                                    ) : (
                                                        <Bookmark className="size-3.5 text-muted-foreground" />
                                                    );

                                                return (
                                                    <div
                                                        key={task.id}
                                                        className={`flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 hover:bg-muted/50 transition-colors ${
                                                            isChecked ? 'opacity-50 bg-muted/20' : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => toggleTask(task.id)}
                                                                className="size-4 rounded border-border text-primary focus:ring-ring cursor-pointer shrink-0"
                                                                aria-label={`Mark task as completed: ${task.title}`}
                                                            />
                                                            <div className="min-w-0">
                                                                <Link
                                                                    href={task.link ?? '#'}
                                                                    className={`text-sm font-medium text-foreground hover:text-primary transition-colors block truncate ${
                                                                        isChecked
                                                                            ? 'line-through text-muted-foreground'
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    {renderTaskTitle(task)}
                                                                </Link>
                                                                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                                    {taskTypeIcon}
                                                                    <span>Due {task.due}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            {task.is_overdue ? (
                                                                <StatusBadge
                                                                    status="Overdue"
                                                                    className="bg-destructive/10 text-destructive border-destructive/20"
                                                                />
                                                            ) : (
                                                                <StatusBadge
                                                                    status="Pending"
                                                                    className="bg-warning/10 text-warning border-warning/20"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Upcoming Departures Card */}
                                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-[480px] md:col-span-2 lg:col-span-1">
                                    <div className="px-4 sm:px-6 py-4 border-b border-border bg-muted/50 flex items-center justify-between shrink-0">
                                        <h3 className="font-bold text-foreground flex items-center gap-2 text-base">
                                            <PlaneTakeoff className="size-4 text-primary" />
                                            <span>Upcoming Departures</span>
                                        </h3>
                                        <Link
                                            href="/bookings"
                                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 ring-ring rounded"
                                        >
                                            <span>View all</span>
                                            <ChevronRight className="size-3.5" />
                                        </Link>
                                    </div>

                                    {hasDeparturesError ? (
                                        <ErrorState
                                            icon={AlertTriangle}
                                            title="Failed to load departures"
                                            description="Could not load upcoming departures data."
                                            retryLabel="Retry"
                                            onRetry={() => {
                                                setHasDeparturesError(false);
                                                router.reload({ only: ['officeStats'] });
                                            }}
                                            className="border-none rounded-none py-12 flex-1"
                                        />
                                    ) : departures.length === 0 ? (
                                        <EmptyState
                                            icon={PlaneTakeoff}
                                            title="No upcoming departures"
                                            description="No departures scheduled for the upcoming period."
                                            className="border-none py-12 flex-1"
                                        />
                                    ) : (
                                        <div className="divide-y divide-border overflow-y-auto flex-1">
                                            {departures.map((departure) => (
                                                <div
                                                    key={departure.id}
                                                    className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 hover:bg-muted/50 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="size-8 rounded-lg grid place-items-center shrink-0 bg-info/10 text-info border border-info/20">
                                                            <PlaneTakeoff className="size-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <Link
                                                                href={departure.link ?? `/bookings/${departure.id}`}
                                                                className="text-sm font-medium text-foreground hover:text-primary transition-colors block truncate"
                                                            >
                                                                {departure.tour_name ??
                                                                    departure.reference ??
                                                                    `Booking #${departure.id}`}
                              </Link>
                                                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                                                {departure.customer_name && (
                                                                    <span className="truncate">
                                                                        {departure.customer_name}
                                                                    </span>
                                                                )}
                                                                {departure.departure_date && (
                                                                    <span className="flex items-center gap-1 shrink-0">
                                                                        <Clock className="size-3" />{' '}
                                                                        {departure.departure_date}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {departure.balance_amount !== undefined &&
                                                            departure.balance_amount > 0 && (
                                                                <MoneyText
                                                                    amount={Number(departure.balance_amount)}
                                                                    currency="LKR"
                                                                    weight="medium"
                                                                    size="sm"
                                                                    className="text-xs text-muted-foreground hidden sm:inline"
                                                                />
                                                            )}
                                                        <StatusBadge
                                                            type="booking"
                                                            status={departure.status ?? 'Confirmed'}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Deferred>
                )}

                {/* Customer Portal Dashboard */}
                {isCustomer && customerStats && (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <StatCard
                            title="My Bookings"
                            value={customerStats.myBookings?.toString() ?? '—'}
                            description="Total bookings"
                            icon={<CalendarCheck className="size-4" />}
                            linkTo="/portal/bookings"
                            iconTint="bg-info/10 text-info border border-info/20"
                        />
                        <StatCard
                            title="My Documents"
                            value={customerStats.myDocuments?.toString() ?? '—'}
                            description="Uploaded documents"
                            icon={<FileText className="size-4" />}
                            linkTo="/portal/documents"
                            iconTint="bg-warning/10 text-warning border border-warning/20"
                        />
                        <StatCard
                            title="My Payments"
                            value={
                                customerStats.myPayments !== null && customerStats.myPayments !== undefined
                                    ? customerStats.myPayments.toString()
                                    : '—'
                            }
                            description="Payment records"
                            icon={<CreditCard className="size-4" />}
                            linkTo="/portal/payments"
                            iconTint="bg-success/10 text-success border border-success/20"
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
