import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import {
    PageHeader,
    Card, CardHeader, CardTitle, CardContent,
    EmptyState, ErrorState,
    MoneyText, StatusBadge,
    Tabs, TabsList, TabsTrigger, TabsContent,
    Skeleton,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Button,
    Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from '@/components/common';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Briefcase, CreditCard, Download, Activity } from 'lucide-react';
import { t } from '@/lib/i18n';

interface KPI {
    value: number;
    change: number;
}

interface ReportsProps {
    kpis: {
        revenue: KPI;
        bookings: KPI;
        outstanding: KPI;
        conversion_rate: KPI;
    };
    tabData: Record<string, any>;
    activeTab: string;
    dateRange: string;
    compare: boolean;
    dates: { start: string; end: string };
}

const COLORS = ['var(--color-primary)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)'];

export default function ReportsIndex({ kpis, tabData, activeTab, dateRange, compare, dates }: ReportsProps) {
    const [loading, setLoading] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState('csv');
    const [exportReport, setExportReport] = useState('all');
    const [exportRange, setExportRange] = useState(dateRange);

    const handleFilterChange = (range: string, isCompare: boolean) => {
        setLoading(true);
        router.get(route('reports.index'), { range, compare: isCompare ? '1' : '0', tab: activeTab }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false)
        });
    };

    const handleRangeChange = (range: string) => handleFilterChange(range, compare);
    const handleCompareChange = (checked: boolean) => handleFilterChange(dateRange, checked);

    const handleTabChange = (tab: string) => {
        setLoading(true);
        router.get(route('reports.index'), { range: dateRange, compare: compare ? '1' : '0', tab }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false)
        });
    };

    const renderKPICard = (title: string, value: string | number, change: number, icon: React.ReactNode, isMoney = false) => {
        const isPositive = change >= 0;
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                            {isMoney ? <MoneyText amount={Number(value)} /> : value}
                        </div>
                        <div className={`flex items-center text-xs ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                            {compare && (
                                <>
                                    {isPositive ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                                    {Math.abs(change)}%
                                </>
                            )}
                        </div>
                    </div>
                    {compare && <p className="text-xs text-muted-foreground mt-1 text-right">vs previous period</p>}
                </CardContent>
            </Card>
        );
    };

    // Data for charts
    const { revenue_chart = [], destination_share = [], bookings_by_status = [], top_packages = [], departures_chart = [], receivables_aging = [], payment_methods = [], outstanding_balances = [], funnel = [] } = tabData || {};

    return (
        <AppLayout title="Reports">
            <Head title="Reports & Analytics" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <PageHeader
                    title="Reports & Analytics"
                    description={`Performance overview from ${dates.start} to ${dates.end}`}
                />
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-2 mr-4">
                        <Switch id="compare" checked={compare} onCheckedChange={handleCompareChange} />
                        <Label htmlFor="compare" className="text-sm font-normal">Compare</Label>
                    </div>
                    <Select value={dateRange} onValueChange={(val) => handleRangeChange(val as string)}>
                        <SelectTrigger className="w-[180px] bg-background">
                            <SelectValue placeholder="Select Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="7_days">Last 7 Days</SelectItem>
                            <SelectItem value="this_month">This Month</SelectItem>
                            <SelectItem value="last_month">Last Month</SelectItem>
                            <SelectItem value="this_year">This Year</SelectItem>
                        </SelectContent>
                    </Select>

                    <Dialog open={exportOpen} onOpenChange={setExportOpen}>
                        <DialogTrigger
                            render={
                                <Button variant="outline">
                                    <Download className="mr-2 h-4 w-4" /> Export
                                </Button>
                            }
                        />
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Export Reports</DialogTitle>
                                <DialogDescription>Download your report data. Excel and PDF formats are coming soon.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Report Type</Label>
                                    <Select value={exportReport} onValueChange={(val) => setExportReport(val as string)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Full Overview</SelectItem>
                                            <SelectItem value="bookings">Bookings Data</SelectItem>
                                            <SelectItem value="finance">Financial Data</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Date Range</Label>
                                    <Select value={exportRange} onValueChange={(val) => setExportRange(val as string)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="today">Today</SelectItem>
                                            <SelectItem value="7_days">Last 7 Days</SelectItem>
                                            <SelectItem value="this_month">This Month</SelectItem>
                                            <SelectItem value="last_month">Last Month</SelectItem>
                                            <SelectItem value="this_year">This Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Format</Label>
                                    <Select value={exportFormat} onValueChange={(val) => setExportFormat(val as string)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                                            <SelectItem value="excel" disabled>Excel (.xlsx) - Coming soon</SelectItem>
                                            <SelectItem value="pdf" disabled>PDF Document - Coming soon</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setExportOpen(false)}>Cancel</Button>
                                <Button onClick={() => {
                                    setExportOpen(false);
                                    // In a real app, this would trigger the actual download
                                    window.open(`/reports/export?type=${exportReport}&range=${exportRange}&format=${exportFormat}`, '_blank');
                                }}>Download</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {loading && !kpis ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[120px] rounded-xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {renderKPICard('Total Revenue', kpis.revenue.value, kpis.revenue.change, <DollarSign />, true)}
                    {renderKPICard('Total Bookings', kpis.bookings.value, kpis.bookings.change, <Briefcase />)}
                    {renderKPICard('Outstanding Balance', kpis.outstanding.value, kpis.outstanding.change, <CreditCard />, true)}
                    {renderKPICard('Conversion Rate', `${kpis.conversion_rate.value}%`, kpis.conversion_rate.change, <Activity />)}
                </div>
            )}

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="bg-background border">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                    <TabsTrigger value="finance">Finance</TabsTrigger>
                    <TabsTrigger value="leads">Leads</TabsTrigger>
                </TabsList>

                <div className="min-h-[400px]">
                    {loading ? (
                        <Card><CardContent className="p-10"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
                    ) : (
                        <>
                            <TabsContent value="overview" className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <Card className="lg:col-span-2">
                                        <CardHeader>
                                            <CardTitle>Revenue & Bookings Trend</CardTitle>
                                        </CardHeader>
                                        <CardContent className="h-[350px]">
                                            {revenue_chart.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={revenue_chart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                                        <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                                        <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} />
                                                        <RechartsTooltip />
                                                        <Legend />
                                                        <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                                        <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            ) : <EmptyState title="No data" description="No revenue data for this period." />}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Destination Share</CardTitle>
                                        </CardHeader>
                                        <CardContent className="h-[350px]">
                                            {destination_share.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={destination_share} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                            {destination_share.map((entry: any, index: number) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <RechartsTooltip />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : <EmptyState title="No data" description="No destination data for this period." />}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="bookings" className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Bookings by Status</CardTitle>
                                        </CardHeader>
                                        <CardContent className="h-[300px]">
                                            {bookings_by_status.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={bookings_by_status} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                        <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                                                        <YAxis dataKey="name" type="category" fontSize={12} tickLine={false} axisLine={false} width={80} className="capitalize" />
                                                        <RechartsTooltip />
                                                        <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : <EmptyState title="No bookings" description="No bookings found in this period." />}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Upcoming Departures</CardTitle>
                                        </CardHeader>
                                        <CardContent className="h-[300px]">
                                            {departures_chart.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={departures_chart}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                                        <RechartsTooltip />
                                                        <Bar dataKey="departures" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : <EmptyState title="No departures" description="No upcoming departures found." />}
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Top Packages</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Package Name</TableHead>
                                                    <TableHead className="text-right">Total Bookings</TableHead>
                                                    <TableHead className="text-right">Revenue</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {top_packages.length > 0 ? top_packages.map((pkg: any, idx: number) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className="font-medium">{pkg.name}</TableCell>
                                                        <TableCell className="text-right">{pkg.total_bookings}</TableCell>
                                                        <TableCell className="text-right"><MoneyText amount={pkg.revenue} /></TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No data available.</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="finance" className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Receivables Aging</CardTitle>
                                        </CardHeader>
                                        <CardContent className="h-[300px]">
                                            {receivables_aging.some((a: any) => a.value > 0) ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={receivables_aging} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                                                        <RechartsTooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                                                        <Bar dataKey="value" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : <EmptyState title="No outstanding" description="No receivables data." />}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Payment Methods Split</CardTitle>
                                        </CardHeader>
                                        <CardContent className="h-[300px]">
                                            {payment_methods.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={payment_methods} cx="50%" cy="50%" innerRadius={0} outerRadius={80} dataKey="value" nameKey="name" label>
                                                            {payment_methods.map((entry: any, index: number) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <RechartsTooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                                                        <Legend formatter={(value) => <span className="capitalize">{value}</span>} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : <EmptyState title="No payments" description="No payment data for this period." />}
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Outstanding Balances</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Customer</TableHead>
                                                    <TableHead>Booking Ref</TableHead>
                                                    <TableHead>Due Date</TableHead>
                                                    <TableHead className="text-right">Total Amount</TableHead>
                                                    <TableHead className="text-right">Balance Due</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {outstanding_balances.length > 0 ? outstanding_balances.map((booking: any) => (
                                                    <TableRow key={booking.id}>
                                                        <TableCell className="font-medium">{booking.customer_name}</TableCell>
                                                        <TableCell>{booking.reference}</TableCell>
                                                        <TableCell>{booking.due_date || 'N/A'}</TableCell>
                                                        <TableCell className="text-right"><MoneyText amount={booking.total_amount} /></TableCell>
                                                        <TableCell className="text-right font-semibold text-destructive"><MoneyText amount={booking.balance_amount} /></TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No outstanding balances.</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="leads">
                                <Card>
                                    <CardContent className="p-12 flex justify-center">
                                        {funnel.length === 0 ? (
                                            <EmptyState
                                                title="Leads Module Not Enabled"
                                                description="The CRM leads funnel is not yet activated for your account. Please check back later."
                                                icon={Activity}
                                            />
                                        ) : null}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </>
                    )}
                </div>
            </Tabs>
        </AppLayout>
    );
}
