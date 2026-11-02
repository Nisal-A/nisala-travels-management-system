import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { PageHeader, EmptyState } from '@/components/common';
import {
    BarChart3,
    TrendingUp,
    ClipboardList,
    Wallet,
    Landmark,
    AlertCircle,
    CalendarDays,
    Users,
    FileCheck,
    MessageSquare,
    FileText,
    ChevronRight,
    type LucideIcon,
} from 'lucide-react';

export interface ReportFilterOption {
    value: string | number;
    label: string;
}

export interface ReportFilterDef {
    name: string;
    label: string;
    type: 'date_range' | 'select' | 'text' | 'date';
    placeholder?: string;
    options?: ReportFilterOption[];
    default?: unknown;
}

export interface ReportColumnDef {
    key: string;
    label: string;
    sortable?: boolean;
    align?: 'left' | 'center' | 'right';
    format?: 'text' | 'number' | 'money' | 'date' | 'datetime' | 'badge' | 'percentage';
    currency?: string;
}

export interface ReportDescriptor {
    key: string;
    title: string;
    description: string;
    category: 'financial' | 'operational';
    permission: string;
    filters: ReportFilterDef[];
    columns: ReportColumnDef[];
}

export interface ReportsIndexProps {
    reports?: ReportDescriptor[];
    grouped?: {
        financial?: ReportDescriptor[];
        operational?: ReportDescriptor[];
    };
}

interface ReportIconConfig {
    icon: LucideIcon;
    tintClass: string;
}

function getReportIconConfig(key: string, category: 'financial' | 'operational' | string): ReportIconConfig {
    switch (key) {
        case 'income-expenses':
            return { icon: Wallet, tintClass: 'bg-success/10 text-success' };
        case 'cash-bank':
            return { icon: Landmark, tintClass: 'bg-info/10 text-info' };
        case 'outstanding-balances':
            return { icon: AlertCircle, tintClass: 'bg-warning/10 text-warning' };
        case 'tour-profitability':
            return { icon: BarChart3, tintClass: 'bg-info/10 text-info' };
        case 'booking-register':
            return { icon: ClipboardList, tintClass: 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary' };
        case 'upcoming-tours':
            return { icon: CalendarDays, tintClass: 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary' };
        case 'passenger-count':
            return { icon: Users, tintClass: 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary' };
        case 'document-status':
            return { icon: FileCheck, tintClass: 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary' };
        case 'inquiry-followup':
            return { icon: MessageSquare, tintClass: 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary' };
        default:
            if (category === 'financial') {
                return { icon: BarChart3, tintClass: 'bg-primary/10 text-primary' };
            }
            return { icon: FileText, tintClass: 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary' };
    }
}

export default function ReportsIndex({ reports = [], grouped = { financial: [], operational: [] } }: ReportsIndexProps) {
    const financialReports = (grouped?.financial && grouped.financial.length > 0)
        ? grouped.financial
        : reports.filter((r) => r.category === 'financial');

    const operationalReports = (grouped?.operational && grouped.operational.length > 0)
        ? grouped.operational
        : reports.filter((r) => r.category === 'operational');

    const hasFinancial = financialReports.length > 0;
    const hasOperational = operationalReports.length > 0;
    const hasAnyReports = hasFinancial || hasOperational || reports.length > 0;

    return (
        <AppLayout
            title="Reports"
            breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Reports' },
            ]}
        >
            <Head title="Reports" />

            <div className="space-y-8">
                <PageHeader
                    title="Reports"
                    description="Access financial statements, operational summaries and key performance analytics."
                />

                {!hasAnyReports ? (
                    <EmptyState
                        icon={BarChart3}
                        title="No reports available"
                        description="You do not currently have permission to access any reports in the system. Contact your administrator if you need access."
                    />
                ) : (
                    <div className="space-y-10">
                        {/* Financial Reports Section */}
                        {hasFinancial && (
                            <section>
                                <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-foreground">
                                    <TrendingUp className="size-5 text-primary shrink-0" />
                                    <span>Financial Reports</span>
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {financialReports.map((report) => {
                                        const { icon: Icon, tintClass } = getReportIconConfig(report.key, report.category);

                                        return (
                                            <Link
                                                key={report.key}
                                                href={`/reports/${report.key}`}
                                                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 ring-ring"
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className={`size-8 rounded-lg grid place-items-center transition-colors ${tintClass}`}>
                                                            <Icon className="size-4" />
                                                        </div>
                                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                            {report.category || 'Financial'}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-lg font-bold text-foreground mt-4 group-hover:text-primary transition-colors">
                                                        {report.title}
                                                    </h3>

                                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                                                        {report.description}
                                                    </p>
                                                </div>

                                                <div className="mt-6 text-sm font-medium text-primary flex items-center gap-1">
                                                    <span>Open report</span>
                                                    <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Operational Reports Section */}
                        {hasOperational && (
                            <section>
                                <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-foreground">
                                    <ClipboardList className="size-5 text-warning shrink-0" />
                                    <span>Operational Reports</span>
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {operationalReports.map((report) => {
                                        const { icon: Icon } = getReportIconConfig(report.key, report.category);

                                        return (
                                            <Link
                                                key={report.key}
                                                href={`/reports/${report.key}`}
                                                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 ring-ring"
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="size-8 rounded-lg grid place-items-center bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                            <Icon className="size-4" />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                            {report.category || 'Operational'}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-base font-bold text-foreground mt-3 group-hover:text-primary transition-colors">
                                                        {report.title}
                                                    </h3>

                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                                        {report.description}
                                                    </p>
                                                </div>

                                                <div className="mt-6 text-sm font-medium text-primary flex items-center gap-1">
                                                    <span>Open report</span>
                                                    <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
