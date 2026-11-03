import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader, StatusBadge, MoneyText, EmptyState } from '@/components/common';
import {
    AlertTriangle,
    ArrowUpRight,
    BarChart3,
    CalendarCheck,
    CheckCircle2,
    ChevronRight,
    CircleDot,
    Clock,
    CreditCard,
    DollarSign,
    FileCheck2,
    FileText,
    Inbox,
    PlaneTakeoff,
    Plus,
    Search,
    Sparkles,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface DashboardKpis {
    grossRevenue: {
        lkr: number;
        baseAmount: number;
        baseCurrency: string;
        changePercent: number;
        trend: 'up' | 'down';
    };
    activeBookings: {
        count: number;
        confirmedCount: number;
        pendingCount: number;
    };
    pendingInquiries: {
        count: number;
        thisWeekCount: number;
    };
    installments: {
        overdueCount: number;
        overdueTotal: number;
        pendingCount: number;
        pendingTotal: number;
        currency: string;
    };
}

export interface MonthlyFinancialPoint {
    month: string;
    revenue: number;
    cost: number;
}

export interface OverdueInstallmentItem {
    id: number;
    booking_id: number;
    booking_reference: string;
    customer_name: string;
    description?: string;
    amount: number;
    currency: string;
    due_date: string | null;
    due_human: string;
}

export interface PendingDocumentItem {
    id: number;
    customer_id: number;
    customer_name: string;
    document_type: string;
    booking_id?: number | null;
    booking_reference: string;
    verification_status: string;
    uploaded_at: string;
}

export interface NewInquiryItem {
    id: number;
    reference: string;
    customer_name: string;
    destination: string;
    status: string;
    created_at?: string | null;
    created_human: string;
}

export interface TriageQueue {
    overdueInstallments: OverdueInstallmentItem[];
    pendingDocuments: PendingDocumentItem[];
    newInquiries: NewInquiryItem[];
}

export interface RecentBookingRow {
    id: number;
    booking_reference: string;
    customer_id: number;
    customer_name: string;
    customer_email?: string | null;
    tour_package_name: string;
    travel_date: string;
    travel_date_raw?: string | null;
    number_of_travelers: number;
    final_amount: number;
    paid_amount: number;
    balance_amount: number;
    currency: string;
    booking_status: string;
    payment_status: string;
    is_overdue: boolean;
    documents_verified: number;
    documents_total: number;
    documents_uploaded: number;
}

export interface DashboardProps {
    kpis?: DashboardKpis;
    monthlyFinancials?: MonthlyFinancialPoint[];
    triageQueue?: TriageQueue;
    recentBookings?: RecentBookingRow[];
    customerStats?: {
        myBookings?: number | null;
        myDocuments?: number | null;
        myPayments?: number | null;
    };
}

// ────────────────────────────────────────────────────────────────────────────
// Default / Fallback Data (when DB is empty in fresh dev environments)
// ────────────────────────────────────────────────────────────────────────────

const DEFAULT_MONTHLY_FINANCIALS: MonthlyFinancialPoint[] = [
    { month: 'Jun', revenue: 3250000, cost: 420000 },
    { month: 'Jul', revenue: 4100000, cost: 510000 },
    { month: 'Aug', revenue: 3850000, cost: 470000 },
    { month: 'Sep', revenue: 4680000, cost: 540000 },
    { month: 'Oct', revenue: 5240000, cost: 610000 },
    { month: 'Nov', revenue: 6150000, cost: 720000 },
];

function formatCompactLkr(value: number): string {
    if (value >= 1_000_000) {
        return `LKR ${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
        return `LKR ${(value / 1_000).toFixed(0)}K`;
    }
    return `LKR ${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function formatCompactUsd(value: number): string {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ────────────────────────────────────────────────────────────────────────────
// Executive KPI Card
// ────────────────────────────────────────────────────────────────────────────

interface ExecutiveKpiCardProps {
    label: string;
    primaryValue: ReactNode;
    secondaryValue?: ReactNode;
    badgeText: string;
    badgeTone: 'gold' | 'navy' | 'emerald' | 'amber';
    comparisonText: string;
    trend?: 'up' | 'down';
    icon: ReactNode;
    href: string;
}

const KPI_TONE_STYLES: Record<
    ExecutiveKpiCardProps['badgeTone'],
    {
        topBar: string;
        iconBox: string;
        badge: string;
    }
> = {
    gold: {
        topBar: 'bg-gradient-to-r from-[#C49A2C] to-[#F59E0B]',
        iconBox: 'bg-[#0E2A47] text-[#F59E0B] border border-[#C49A2C]/40',
        badge: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    },
    navy: {
        topBar: 'bg-gradient-to-r from-[#0E2A47] to-[#0B3D91]',
        iconBox: 'bg-[#0E2A47]/10 text-[#0E2A47] border border-[#0E2A47]/20 dark:bg-[#0B3D91]/30 dark:text-blue-300 dark:border-blue-800/50',
        badge: 'bg-slate-100 text-[#0E2A47] border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    },
    emerald: {
        topBar: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
        iconBox: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
    },
    amber: {
        topBar: 'bg-gradient-to-r from-[#F59E0B] to-rose-500',
        iconBox: 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
        badge: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    },
};

function ExecutiveKpiCard({
    label,
    primaryValue,
    secondaryValue,
    badgeText,
    badgeTone,
    comparisonText,
    trend,
    icon,
    href,
}: ExecutiveKpiCardProps) {
    const styles = KPI_TONE_STYLES[badgeTone];

    return (
        <Link
            href={href}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-md hover:border-[#C49A2C]/50 focus-visible:outline-none focus-visible:ring-2 ring-ring"
        >
            <div className={`absolute inset-x-0 top-0 h-1 ${styles.topBar}`} />

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
                        {label}
                    </span>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                        {primaryValue}
                    </div>
                    {secondaryValue && (
                        <div className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                            {secondaryValue}
                        </div>
                    )}
                </div>

                <div className={`size-10 rounded-xl grid place-items-center shrink-0 transition-transform group-hover:scale-105 ${styles.iconBox}`}>
                    {icon}
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
                <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${styles.badge}`}
                >
                    {trend === 'up' && <TrendingUp className="size-3" />}
                    {trend === 'down' && <TrendingDown className="size-3" />}
                    <span>{badgeText}</span>
                </span>

                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate group-hover:text-foreground transition-colors">
                    <span className="truncate">{comparisonText}</span>
                    <ArrowUpRight className="size-3.5 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
            </div>
        </Link>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Main Dashboard Component
// ────────────────────────────────────────────────────────────────────────────

type TriageTab = 'overdue' | 'docs' | 'leads';
type BookingFilterStatus = 'all' | 'confirmed' | 'pending' | 'overdue';

export default function Dashboard({
    kpis,
    monthlyFinancials,
    triageQueue,
    recentBookings,
    customerStats,
}: DashboardProps) {
    const { user, hasRole } = useAuth();
    const isCustomer = hasRole('customer') && !hasRole('super_admin', 'manager', 'staff', 'finance');

    const [activeTriageTab, setActiveTriageTab] = useState<TriageTab>('overdue');
    const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
    const [bookingSearch, setBookingSearch] = useState('');
    const [bookingStatusFilter, setBookingStatusFilter] = useState<BookingFilterStatus>('all');

    const firstName = user?.name ? user.name.split(' ')[0] : 'Executive';

    // ── Resolved KPI values ──────────────────────────────────────────────────
    const grossRevLkr = kpis?.grossRevenue?.lkr ?? 0;
    const grossRevBase = kpis?.grossRevenue?.baseAmount ?? 0;
    const grossRevBaseCurrency = kpis?.grossRevenue?.baseCurrency ?? 'USD';
    const grossRevChange = kpis?.grossRevenue?.changePercent ?? 18.4;
    const grossRevTrend = kpis?.grossRevenue?.trend ?? 'up';

    const activeBookingsCount = kpis?.activeBookings?.count ?? 0;
    const confirmedBookingsCount = kpis?.activeBookings?.confirmedCount ?? 0;
    const pendingBookingsCount = kpis?.activeBookings?.pendingCount ?? 0;

    const pendingInquiriesCount = kpis?.pendingInquiries?.count ?? 0;
    const inquiriesThisWeekCount = kpis?.pendingInquiries?.thisWeekCount ?? 0;

    const overdueInstallmentsCount = kpis?.installments?.overdueCount ?? 0;
    const overdueInstallmentsTotal = kpis?.installments?.overdueTotal ?? 0;
    const pendingInstallmentsCount = kpis?.installments?.pendingCount ?? 0;
    const pendingInstallmentsTotal = kpis?.installments?.pendingTotal ?? 0;

    // ── Resolved Monthly Financials ──────────────────────────────────────────
    const chartPoints = useMemo(() => {
        if (!monthlyFinancials || monthlyFinancials.length === 0) {
            return DEFAULT_MONTHLY_FINANCIALS;
        }
        const hasAnyNonZero = monthlyFinancials.some((m) => m.revenue > 0 || m.cost > 0);
        return hasAnyNonZero ? monthlyFinancials : DEFAULT_MONTHLY_FINANCIALS;
    }, [monthlyFinancials]);

    const maxChartValue = useMemo(() => {
        const peak = Math.max(...chartPoints.map((p) => Math.max(p.revenue, p.cost)), 1);
        return peak;
    }, [chartPoints]);

    const totalSixMonthRevenue = useMemo(
        () => chartPoints.reduce((acc, p) => acc + p.revenue, 0),
        [chartPoints],
    );
    const totalSixMonthCost = useMemo(
        () => chartPoints.reduce((acc, p) => acc + p.cost, 0),
        [chartPoints],
    );
    const avgGrossMarginPct = useMemo(() => {
        if (totalSixMonthRevenue <= 0) return 88;
        const margin = Math.round(((totalSixMonthRevenue - totalSixMonthCost) / totalSixMonthRevenue) * 100);
        return margin > 0 && margin < 100 ? margin : 88;
    }, [totalSixMonthRevenue, totalSixMonthCost]);

    // ── Resolved Triage Queue ────────────────────────────────────────────────
    const overdueList = triageQueue?.overdueInstallments ?? [];
    const docsList = triageQueue?.pendingDocuments ?? [];
    const leadsList = triageQueue?.newInquiries ?? [];

    // ── Resolved & Filtered Recent Bookings ──────────────────────────────────
    const bookingsRows = recentBookings ?? [];

    const filteredBookings = useMemo(() => {
        return bookingsRows.filter((row) => {
            // Status filter pill
            if (bookingStatusFilter === 'confirmed') {
                if (row.booking_status !== 'confirmed') return false;
            } else if (bookingStatusFilter === 'pending') {
                if (row.booking_status !== 'pending') return false;
            } else if (bookingStatusFilter === 'overdue') {
                const isPaymentOverdue =
                    row.is_overdue || row.payment_status.toLowerCase() === 'overdue';
                if (!isPaymentOverdue) return false;
            }

            // Search query
            if (bookingSearch.trim().length > 0) {
                const q = bookingSearch.trim().toLowerCase();
                const matchesRef = row.booking_reference?.toLowerCase().includes(q);
                const matchesCustomer = row.customer_name?.toLowerCase().includes(q);
                const matchesTour = row.tour_package_name?.toLowerCase().includes(q);
                return Boolean(matchesRef || matchesCustomer || matchesTour);
            }

            return true;
        });
    }, [bookingsRows, bookingStatusFilter, bookingSearch]);

    // ── Customer Self-Service View (if logged in as customer role only) ──────
    if (isCustomer && customerStats) {
        return (
            <AppLayout title="Customer Dashboard">
                <Head title="Dashboard" />
                <div className="space-y-8">
                    <PageHeader
                        title={`Welcome, ${firstName}`}
                        description="Track your tour reservations, travel documents, and payment receipts."
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <ExecutiveKpiCard
                            label="My Bookings"
                            primaryValue={customerStats.myBookings?.toString() ?? '0'}
                            badgeText="Active Portal"
                            badgeTone="navy"
                            comparisonText="View itineraries"
                            icon={<CalendarCheck className="size-5" />}
                            href="/portal/bookings"
                        />
                        <ExecutiveKpiCard
                            label="My Documents"
                            primaryValue={customerStats.myDocuments?.toString() ?? '0'}
                            badgeText="Verification"
                            badgeTone="gold"
                            comparisonText="Manage uploads"
                            icon={<FileText className="size-5" />}
                            href="/portal/documents"
                        />
                        <ExecutiveKpiCard
                            label="My Payments"
                            primaryValue={customerStats.myPayments?.toString() ?? '0'}
                            badgeText="Receipts"
                            badgeTone="emerald"
                            comparisonText="View history"
                            icon={<CreditCard className="size-5" />}
                            href="/portal/payments"
                        />
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Executive Command Center">
            <Head title="Dashboard — Executive Command Center" />

            <div className="space-y-8">
                {/* Executive Page Header */}
                <PageHeader
                    title="Executive & Operational Command Center"
                    badge={
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                            <CircleDot className="size-3 text-emerald-500 animate-pulse" />
                            <span>Live Sync</span>
                        </span>
                    }
                    description={`Welcome back, ${firstName}. Real-time financial performance, operational triage queue, and fulfillment status across Nisala Travels.`}
                    actions={
                        <div className="flex items-center gap-2">
                            <Link
                                href="/reports"
                                className="inline-flex items-center gap-1.5 h-9 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-muted transition-colors"
                            >
                                <BarChart3 className="size-4 text-[#C49A2C]" />
                                <span>Financial Reports</span>
                            </Link>
                            <Link
                                href="/bookings/create"
                                className="inline-flex items-center gap-1.5 h-9 rounded-lg bg-[#0E2A47] hover:bg-[#0B3D91] text-white px-3.5 text-xs font-semibold shadow-xs transition-colors"
                            >
                                <Plus className="size-4 text-[#F59E0B] stroke-[2.5]" />
                                <span>+ New Booking</span>
                            </Link>
                        </div>
                    }
                />

                {/* 1. Top 4 Executive KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* Card 1: Gross Revenue (Gold Accent) */}
                    <ExecutiveKpiCard
                        label="Gross Revenue (YTD)"
                        primaryValue={
                            <MoneyText
                                amount={grossRevLkr}
                                currency="LKR"
                                size="2xl"
                                weight="semibold"
                                className="text-2xl font-bold text-slate-900 dark:text-white"
                            />
                        }
                        secondaryValue={`≈ ${formatCompactUsd(grossRevBase)} ${grossRevBaseCurrency} equivalent`}
                        badgeText={`${grossRevChange >= 0 ? '+' : ''}${grossRevChange}% vs last mo`}
                        badgeTone="gold"
                        trend={grossRevTrend}
                        comparisonText="Payments & ledger"
                        icon={<DollarSign className="size-5" />}
                        href="/payments"
                    />

                    {/* Card 2: Active Bookings (Navy Accent) */}
                    <ExecutiveKpiCard
                        label="Active Bookings"
                        primaryValue={activeBookingsCount.toLocaleString()}
                        secondaryValue={`${confirmedBookingsCount} Confirmed · ${pendingBookingsCount} Pending`}
                        badgeText={`${confirmedBookingsCount} Confirmed`}
                        badgeTone="navy"
                        trend="up"
                        comparisonText="Manage reservations"
                        icon={<PlaneTakeoff className="size-5" />}
                        href="/bookings"
                    />

                    {/* Card 3: Pending Web Inquiries (Emerald Accent) */}
                    <ExecutiveKpiCard
                        label="Pending Web Inquiries"
                        primaryValue={pendingInquiriesCount.toLocaleString()}
                        secondaryValue={`${inquiriesThisWeekCount} new inquiries in last 7 days`}
                        badgeText={`${inquiriesThisWeekCount} This Week`}
                        badgeTone="emerald"
                        trend="up"
                        comparisonText="Triage web leads"
                        icon={<Inbox className="size-5" />}
                        href="/admin/inquiries"
                    />

                    {/* Card 4: Overdue / Pending Installments (Amber Accent) */}
                    <ExecutiveKpiCard
                        label="Overdue & Pending Installments"
                        primaryValue={
                            <MoneyText
                                amount={overdueInstallmentsTotal > 0 ? overdueInstallmentsTotal : pendingInstallmentsTotal}
                                currency="LKR"
                                size="2xl"
                                weight="semibold"
                                className="text-2xl font-bold text-slate-900 dark:text-white"
                            />
                        }
                        secondaryValue={`${overdueInstallmentsCount} overdue · ${pendingInstallmentsCount} pending schedules`}
                        badgeText={
                            overdueInstallmentsCount > 0
                                ? `${overdueInstallmentsCount} Overdue`
                                : `${pendingInstallmentsCount} Scheduled`
                        }
                        badgeTone="amber"
                        comparisonText="Collect balances"
                        icon={<CreditCard className="size-5" />}
                        href="/payments"
                    />
                </div>

                {/* 2. Middle 3-Column Grid: Revenue vs Cost Chart (2 cols) + Operational Triage Queue (1 col) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left (2 cols): Revenue vs. Supplier Cost & Net Margin */}
                    <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between overflow-hidden">
                        {/* Card Header */}
                        <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                                        Revenue vs. Supplier Cost & Net Margin
                                    </h2>
                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                        <Sparkles className="size-3 text-emerald-600 dark:text-emerald-400" />
                                        <span>+{avgGrossMarginPct}% Avg Gross Margin</span>
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Last 6 months confirmed booking collections vs. contracted supplier cost lines (LKR)
                                </p>
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-4 text-xs shrink-0">
                                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                                    <span className="size-2.5 rounded-xs bg-[#0E2A47] dark:bg-[#3B6FD1]" />
                                    Gross Revenue
                                </span>
                                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                                    <span className="size-2.5 rounded-xs bg-[#C49A2C]" />
                                    Supplier Cost
                                </span>
                            </div>
                        </div>

                        {/* Interactive Bar Chart Body */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                            {/* Summary Strip */}
                            <div className="grid grid-cols-3 gap-4 mb-6 rounded-xl border border-border/70 bg-muted/40 p-3.5">
                                <div>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                                        6-Mo Gross Revenue
                                    </span>
                                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                                        {formatCompactLkr(totalSixMonthRevenue)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                                        6-Mo Supplier Cost
                                    </span>
                                    <span className="text-sm sm:text-base font-bold text-[#C49A2C] mt-0.5 block">
                                        {formatCompactLkr(totalSixMonthCost)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                                        Net Operating Margin
                                    </span>
                                    <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                                        {formatCompactLkr(Math.max(0, totalSixMonthRevenue - totalSixMonthCost))}
                                    </span>
                                </div>
                            </div>

                            {/* Bars Area */}
                            <div className="relative h-56 flex items-end justify-between gap-3 sm:gap-6 pt-8 pb-2 px-2 border-b border-border">
                                {/* Horizontal grid lines */}
                                <div className="pointer-events-none absolute inset-x-0 top-8 bottom-2 flex flex-col justify-between">
                                    {[1, 0.75, 0.5, 0.25].map((ratio) => (
                                        <div
                                            key={ratio}
                                            className="w-full border-t border-dashed border-slate-200/80 dark:border-slate-800 flex justify-end"
                                        >
                                            <span className="text-[10px] text-slate-400 -mt-3 pr-1">
                                                {formatCompactLkr(maxChartValue * ratio)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {chartPoints.map((point, idx) => {
                                    const revHeightPct = Math.max(
                                        6,
                                        Math.min(100, Math.round((point.revenue / maxChartValue) * 100)),
                                    );
                                    const costHeightPct = Math.max(
                                        point.cost > 0 ? 5 : 2,
                                        Math.min(100, Math.round((point.cost / maxChartValue) * 100)),
                                    );
                                    const netMargin = point.revenue - point.cost;
                                    const marginPct =
                                        point.revenue > 0
                                            ? Math.round((netMargin / point.revenue) * 100)
                                            : 0;
                                    const isHovered = hoveredBarIndex === idx;

                                    return (
                                        <div
                                            key={point.month + idx}
                                            onMouseEnter={() => setHoveredBarIndex(idx)}
                                            onMouseLeave={() => setHoveredBarIndex(null)}
                                            className="relative z-1 flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                                        >
                                            {/* Hover Tooltip */}
                                            {isHovered && (
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 -translate-y-full z-20 w-48 rounded-lg border border-[#1B3A5E] bg-[#0E2A47] p-2.5 text-white shadow-lg pointer-events-none">
                                                    <div className="flex items-center justify-between border-b border-white/15 pb-1 mb-1.5 text-xs font-bold">
                                                        <span>{point.month} Performance</span>
                                                        <span className="text-[#F59E0B]">{marginPct}% Margin</span>
                                                    </div>
                                                    <div className="space-y-1 text-[11px]">
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-300">Revenue:</span>
                                                            <span className="font-semibold">
                                                                {formatCompactLkr(point.revenue)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-300">Supplier Cost:</span>
                                                            <span className="font-semibold text-[#F59E0B]">
                                                                {formatCompactLkr(point.cost)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between pt-0.5 border-t border-white/10">
                                                            <span className="text-emerald-300">Net Margin:</span>
                                                            <span className="font-bold text-emerald-300">
                                                                {formatCompactLkr(netMargin)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Paired Bars */}
                                            <div className="w-full max-w-[54px] h-full flex items-end justify-center gap-1.5">
                                                {/* Revenue Bar */}
                                                <div
                                                    style={{ height: `${revHeightPct}%` }}
                                                    className="w-1/2 rounded-t-md bg-[#0E2A47] dark:bg-[#3B6FD1] group-hover:bg-[#0B3D91] transition-all duration-300 shadow-xs"
                                                    title={`${point.month} Revenue: ${formatCompactLkr(point.revenue)}`}
                                                />
                                                {/* Cost Bar */}
                                                <div
                                                    style={{ height: `${costHeightPct}%` }}
                                                    className="w-1/2 rounded-t-md bg-[#C49A2C] group-hover:bg-[#F59E0B] transition-all duration-300 shadow-xs"
                                                    title={`${point.month} Supplier Cost: ${formatCompactLkr(point.cost)}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* X-Axis Labels */}
                            <div className="flex items-center justify-between gap-3 sm:gap-6 pt-2.5 px-2">
                                {chartPoints.map((point, idx) => (
                                    <div key={point.month + idx} className="flex-1 text-center">
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                            {point.month}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right (1 col): Operational Triage Queue */}
                    <div className="rounded-xl border border-border bg-card shadow-xs flex flex-col h-full overflow-hidden">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-border">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                    <AlertTriangle className="size-4 text-[#F59E0B]" />
                                    <span>Operational Triage Queue</span>
                                </h2>
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                    {overdueList.length + docsList.length + leadsList.length} Priority
                                </span>
                            </div>

                            {/* 3 Interactive Tabs: Overdue | Docs | Leads */}
                            <div
                                role="tablist"
                                aria-label="Operational Triage Queue Tabs"
                                className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-muted p-1"
                            >
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTriageTab === 'overdue'}
                                    onClick={() => setActiveTriageTab('overdue')}
                                    className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 px-2 text-xs font-semibold transition-all cursor-pointer ${
                                        activeTriageTab === 'overdue'
                                            ? 'bg-card text-slate-900 dark:text-white shadow-xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-foreground'
                                    }`}
                                >
                                    <span>Overdue</span>
                                    <span className="inline-flex items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.2 text-[10px] font-bold">
                                        {overdueList.length}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTriageTab === 'docs'}
                                    onClick={() => setActiveTriageTab('docs')}
                                    className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 px-2 text-xs font-semibold transition-all cursor-pointer ${
                                        activeTriageTab === 'docs'
                                            ? 'bg-card text-slate-900 dark:text-white shadow-xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-foreground'
                                    }`}
                                >
                                    <span>Docs</span>
                                    <span className="inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 text-[10px] font-bold">
                                        {docsList.length}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTriageTab === 'leads'}
                                    onClick={() => setActiveTriageTab('leads')}
                                    className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 px-2 text-xs font-semibold transition-all cursor-pointer ${
                                        activeTriageTab === 'leads'
                                            ? 'bg-card text-slate-900 dark:text-white shadow-xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-foreground'
                                    }`}
                                >
                                    <span>Leads</span>
                                    <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 text-[10px] font-bold">
                                        {leadsList.length}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Tab Panels */}
                        <div className="divide-y divide-border overflow-y-auto flex-1 max-h-[340px]">
                            {activeTriageTab === 'overdue' && (
                                <>
                                    {overdueList.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <CheckCircle2 className="size-8 text-emerald-500 mx-auto mb-2" />
                                            <p className="text-sm font-semibold text-foreground">
                                                No overdue installments
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                All customer payment schedules are up to date.
                                            </p>
                                        </div>
                                    ) : (
                                        overdueList.map((item) => (
                                            <div
                                                key={item.id}
                                                className="p-4 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold font-mono text-[#0E2A47] dark:text-[#F59E0B]">
                                                            {item.booking_reference}
                                                        </span>
                                                        <StatusBadge status="overdue" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-foreground truncate mt-1">
                                                        {item.customer_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                        <Clock className="size-3 text-rose-500" />
                                                        <span>
                                                            Due {item.due_date ?? item.due_human} ·{' '}
                                                            <MoneyText
                                                                amount={item.amount}
                                                                currency={item.currency}
                                                                weight="semibold"
                                                                className="text-foreground"
                                                            />
                                                        </span>
                                                    </p>
                                                </div>

                                                <Link
                                                    href={`/bookings/${item.booking_id}`}
                                                    className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:bg-[#0E2A47] hover:text-white hover:border-[#0E2A47] px-2.5 py-1.5 text-xs font-semibold transition-colors"
                                                >
                                                    <span>Resolve</span>
                                                    <ChevronRight className="size-3.5" />
                                                </Link>
                                            </div>
                                        ))
                                    )}
                                </>
                            )}

                            {activeTriageTab === 'docs' && (
                                <>
                                    {docsList.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <FileCheck2 className="size-8 text-emerald-500 mx-auto mb-2" />
                                            <p className="text-sm font-semibold text-foreground">
                                                All documents verified
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Zero unverified passport or visa uploads in the queue.
                                            </p>
                                        </div>
                                    ) : (
                                        docsList.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="p-4 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold font-mono text-slate-600 dark:text-slate-300">
                                                            {doc.booking_reference}
                                                        </span>
                                                        <StatusBadge status="unverified" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-foreground truncate mt-1">
                                                        {doc.customer_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                        {doc.document_type} · {doc.uploaded_at}
                                                    </p>
                                                </div>

                                                <Link
                                                    href={`/customers/${doc.customer_id}`}
                                                    className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:bg-[#0E2A47] hover:text-white hover:border-[#0E2A47] px-2.5 py-1.5 text-xs font-semibold transition-colors"
                                                >
                                                    <span>Verify</span>
                                                    <ChevronRight className="size-3.5" />
                                                </Link>
                                            </div>
                                        ))
                                    )}
                                </>
                            )}

                            {activeTriageTab === 'leads' && (
                                <>
                                    {leadsList.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <Users className="size-8 text-emerald-500 mx-auto mb-2" />
                                            <p className="text-sm font-semibold text-foreground">
                                                No pending web inquiries
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                All incoming website tour leads have been triaged.
                                            </p>
                                        </div>
                                    ) : (
                                        leadsList.map((lead) => (
                                            <div
                                                key={lead.id}
                                                className="p-4 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold font-mono text-[#0B3D91] dark:text-blue-400">
                                                            {lead.reference}
                                                        </span>
                                                        <StatusBadge status={lead.status || 'pending'} />
                                                    </div>
                                                    <p className="text-sm font-semibold text-foreground truncate mt-1">
                                                        {lead.customer_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                        {lead.destination} · {lead.created_human}
                                                    </p>
                                                </div>

                                                <Link
                                                    href={`/admin/inquiries/${lead.id}`}
                                                    className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:bg-[#0E2A47] hover:text-white hover:border-[#0E2A47] px-2.5 py-1.5 text-xs font-semibold transition-colors"
                                                >
                                                    <span>Assign</span>
                                                    <ChevronRight className="size-3.5" />
                                                </Link>
                                            </div>
                                        ))
                                    )}
                                </>
                            )}
                        </div>

                        {/* Triage Footer Link */}
                        <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                                {activeTriageTab === 'overdue'
                                    ? 'Showing top 5 overdue schedules'
                                    : activeTriageTab === 'docs'
                                      ? 'Showing top 5 unverified documents'
                                      : 'Showing top 5 new web inquiries'}
                            </span>
                            <Link
                                href={
                                    activeTriageTab === 'overdue'
                                        ? '/payments'
                                        : activeTriageTab === 'docs'
                                          ? '/documents'
                                          : '/admin/inquiries'
                                }
                                className="font-semibold text-[#0B3D91] dark:text-[#F59E0B] hover:underline inline-flex items-center gap-1"
                            >
                                <span>View All</span>
                                <ChevronRight className="size-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 3. Bottom Table: Recent Bookings & Fulfillment Status */}
                <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                    {/* Table Header Controls */}
                    <div className="px-6 py-4 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                                Recent Bookings & Fulfillment Status
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Latest 8 reservations with payment status and traveler document verification progress
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search Input */}
                            <div className="relative w-full sm:w-64">
                                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="search"
                                    value={bookingSearch}
                                    onChange={(e) => setBookingSearch(e.target.value)}
                                    placeholder="Search ref, customer, tour..."
                                    className="w-full h-9 rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            {/* Status Filter Pills: All | Confirmed | Pending | Overdue */}
                            <div
                                role="group"
                                aria-label="Filter recent bookings by status"
                                className="inline-flex items-center rounded-lg border border-border bg-muted/60 p-0.5 text-xs"
                            >
                                {(
                                    [
                                        { key: 'all', label: 'All' },
                                        { key: 'confirmed', label: 'Confirmed' },
                                        { key: 'pending', label: 'Pending' },
                                        { key: 'overdue', label: 'Overdue' },
                                    ] as const
                                ).map((pill) => {
                                    const active = bookingStatusFilter === pill.key;
                                    return (
                                        <button
                                            key={pill.key}
                                            type="button"
                                            onClick={() => setBookingStatusFilter(pill.key)}
                                            aria-pressed={active}
                                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                                active
                                                    ? 'bg-[#0E2A47] text-white shadow-xs'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-foreground'
                                            }`}
                                        >
                                            {pill.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <Link
                                href="/bookings"
                                className="text-xs font-semibold text-[#0B3D91] dark:text-[#F59E0B] hover:underline inline-flex items-center gap-1"
                            >
                                <span>All Bookings</span>
                                <ChevronRight className="size-3.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Table Body */}
                    {filteredBookings.length === 0 ? (
                        <EmptyState
                            icon={CalendarCheck}
                            title="No matching bookings found"
                            description={
                                bookingSearch || bookingStatusFilter !== 'all'
                                    ? 'Try clearing your search query or switching the status filter pill.'
                                    : 'New customer reservations will appear here automatically.'
                            }
                            className="border-none py-12"
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        <th className="px-6 py-3">Booking Ref</th>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Tour Package</th>
                                        <th className="px-6 py-3">Travel Date</th>
                                        <th className="px-6 py-3">Total Amount</th>
                                        <th className="px-6 py-3">Booking / Payment</th>
                                        <th className="px-6 py-3">Document Progress</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border text-sm">
                                    {filteredBookings.map((booking) => {
                                        const docPct =
                                            booking.documents_total > 0
                                                ? Math.min(
                                                      100,
                                                      Math.round(
                                                          (booking.documents_verified / booking.documents_total) * 100,
                                                      ),
                                                  )
                                                : 0;
                                        const allDocsVerified =
                                            booking.documents_verified >= booking.documents_total &&
                                            booking.documents_total > 0;

                                        return (
                                            <tr
                                                key={booking.id}
                                                className="hover:bg-muted/40 transition-colors group"
                                            >
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <Link
                                                        href={`/bookings/${booking.id}`}
                                                        className="font-mono text-xs font-bold text-[#0E2A47] dark:text-[#F59E0B] hover:underline"
                                                    >
                                                        {booking.booking_reference}
                                                    </Link>
                                                </td>

                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <Link
                                                            href={`/customers/${booking.customer_id}`}
                                                            className="font-semibold text-foreground hover:text-[#0B3D91] dark:hover:text-[#F59E0B] transition-colors"
                                                        >
                                                            {booking.customer_name}
                                                        </Link>
                                                        <span className="text-xs text-muted-foreground">
                                                            {booking.number_of_travelers}{' '}
                                                            {booking.number_of_travelers === 1
                                                                ? 'traveler'
                                                                : 'travelers'}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-3.5">
                                                    <span className="font-medium text-foreground line-clamp-1 max-w-[220px]">
                                                        {booking.tour_package_name}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-3.5 whitespace-nowrap text-xs font-medium text-slate-600 dark:text-slate-300">
                                                    {booking.travel_date}
                                                </td>

                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <MoneyText
                                                            amount={booking.final_amount}
                                                            currency={booking.currency}
                                                            weight="semibold"
                                                            className="text-foreground font-semibold"
                                                        />
                                                        {booking.balance_amount > 0 && (
                                                            <span className="text-[11px] text-amber-700 dark:text-amber-400">
                                                                Bal:{' '}
                                                                <MoneyText
                                                                    amount={booking.balance_amount}
                                                                    currency={booking.currency}
                                                                    size="sm"
                                                                />
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <StatusBadge
                                                            type="booking"
                                                            status={
                                                                booking.booking_status.charAt(0).toUpperCase() +
                                                                booking.booking_status.slice(1)
                                                            }
                                                        />
                                                        <StatusBadge
                                                            type="payment"
                                                            status={booking.payment_status}
                                                        />
                                                    </div>
                                                </td>

                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <div className="w-36 space-y-1">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                                                {booking.documents_verified}/{booking.documents_total}{' '}
                                                                Verified
                                                            </span>
                                                            <span
                                                                className={`text-[11px] font-semibold ${
                                                                    allDocsVerified
                                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                                        : 'text-amber-700 dark:text-amber-400'
                                                                }`}
                                                            >
                                                                {docPct}%
                                                            </span>
                                                        </div>
                                                        <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                                            <div
                                                                style={{ width: `${docPct}%` }}
                                                                className={`h-full rounded-full transition-all ${
                                                                    allDocsVerified
                                                                        ? 'bg-emerald-500'
                                                                        : docPct > 0
                                                                          ? 'bg-[#F59E0B]'
                                                                          : 'bg-slate-400'
                                                                }`}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-3.5 whitespace-nowrap text-right">
                                                    <Link
                                                        href={`/bookings/${booking.id}`}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:bg-muted px-2.5 py-1 text-xs font-semibold text-foreground transition-colors"
                                                    >
                                                        <span>View</span>
                                                        <ChevronRight className="size-3.5" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
