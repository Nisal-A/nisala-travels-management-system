import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { PageHeader, EmptyState } from '@/components/common';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    BarChart3,
    ArrowRight,
    TrendingUp,
    Briefcase,
    CalendarCheck,
    FileSpreadsheet,
    Receipt,
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
    format?: 'text' | 'number' | 'money' | 'date' | 'datetime' | 'badge';
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
    reports: ReportDescriptor[];
    grouped: {
        financial: ReportDescriptor[];
        operational: ReportDescriptor[];
    };
}

function getReportIcon(key: string, category: string) {
    if (key.includes('booking')) {
        return CalendarCheck;
    }
    if (key.includes('income') || key.includes('profit') || key.includes('cash')) {
        return Receipt;
    }
    return category === 'financial' ? TrendingUp : Briefcase;
}

export default function ReportsIndex({ reports = [], grouped = { financial: [], operational: [] } }: ReportsIndexProps) {
    const hasAnyReports = reports.length > 0;
    const hasFinancial = grouped.financial && grouped.financial.length > 0;
    const hasOperational = grouped.operational && grouped.operational.length > 0;

    return (
        <AppLayout
            title="Reports"
            breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Reports' },
            ]}
        >
            <Head title="Reports Hub" />

            <div className="w-full max-w-full space-y-8">
                <PageHeader
                    title="Reports Hub"
                    description="Access financial statements, operational summaries, and key performance analytics."
                />

                {!hasAnyReports ? (
                    <EmptyState
                        icon={BarChart3}
                        title="No reports available"
                        description="You do not currently have permission to access any reports in the system. Contact your administrator if you need access."
                    />
                ) : (
                    <div className="space-y-10">
                        {/* Financial Reports */}
                        {hasFinancial && (
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-border pb-3">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-semibold tracking-tight text-foreground">
                                                Financial Reports
                                            </h2>
                                            <Badge variant="secondary" className="font-mono text-xs">
                                                {grouped.financial.length}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Cash flow, revenue calculations, outstanding balances, and profitability.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {grouped.financial.map((report) => {
                                        const IconComponent = getReportIcon(report.key, report.category);

                                        return (
                                            <Link
                                                key={report.key}
                                                href={`/reports/${report.key}`}
                                                className="group focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl block"
                                            >
                                                <Card className="h-full flex flex-col justify-between border-border/80 transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-md bg-card">
                                                    <CardHeader className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="p-2 rounded-md bg-muted text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                                <IconComponent className="h-5 w-5" />
                                                            </div>
                                                            <Badge variant="outline" className="text-xs uppercase tracking-wider">
                                                                Financial
                                                            </Badge>
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                                                                {report.title}
                                                            </CardTitle>
                                                            <CardDescription className="text-xs leading-relaxed text-muted-foreground mt-1.5 line-clamp-2">
                                                                {report.description}
                                                            </CardDescription>
                                                        </div>
                                                    </CardHeader>
                                                    <CardFooter className="pt-0">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-xs font-medium text-primary hover:bg-transparent p-0 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                                                        >
                                                            Open Report
                                                            <ArrowRight className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Operational Reports */}
                        {hasOperational && (
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-border pb-3">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <Briefcase className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-semibold tracking-tight text-foreground">
                                                Operational Reports
                                            </h2>
                                            <Badge variant="secondary" className="font-mono text-xs">
                                                {grouped.operational.length}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Tour registers, upcoming departures, passenger rosters, and operational statuses.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {grouped.operational.map((report) => {
                                        const IconComponent = getReportIcon(report.key, report.category);

                                        return (
                                            <Link
                                                key={report.key}
                                                href={`/reports/${report.key}`}
                                                className="group focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl block"
                                            >
                                                <Card className="h-full flex flex-col justify-between border-border/80 transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-md bg-card">
                                                    <CardHeader className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="p-2 rounded-md bg-muted text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                                <IconComponent className="h-5 w-5" />
                                                            </div>
                                                            <Badge variant="outline" className="text-xs uppercase tracking-wider">
                                                                Operational
                                                            </Badge>
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                                                                {report.title}
                                                            </CardTitle>
                                                            <CardDescription className="text-xs leading-relaxed text-muted-foreground mt-1.5 line-clamp-2">
                                                                {report.description}
                                                            </CardDescription>
                                                        </div>
                                                    </CardHeader>
                                                    <CardFooter className="pt-0">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-xs font-medium text-primary hover:bg-transparent p-0 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                                                        >
                                                            Open Report
                                                            <ArrowRight className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
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
