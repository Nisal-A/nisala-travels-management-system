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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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

interface DashboardProps {
    officeStats?: {
        totalCustomers?: number;
        totalEmployees?: number;
        activeBookings?: number | null;
        pendingDocuments?: number | null;
        paymentsThisMonth?: number | null;
    };
    recentBookings?: any[];
    recentCustomers?: any[];
    recentPayments?: any[];
    customerStats?: {
        myBookings?: number | null;
        myDocuments?: number | null;
        myPayments?: number | null;
    };
}

export default function Dashboard({ officeStats, recentBookings, recentCustomers, recentPayments, customerStats }: DashboardProps) {
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
                        {officeStats?.totalCustomers !== undefined && (
                            <StatCard
                                title="Total Customers"
                                value={officeStats.totalCustomers.toString()}
                                description="Active customer profiles"
                                icon={<Users className="h-4 w-4" />}
                            />
                        )}
                        {officeStats?.totalEmployees !== undefined && (
                            <StatCard
                                title="Total Employees"
                                value={officeStats.totalEmployees.toString()}
                                description="System users"
                                icon={<Users className="h-4 w-4" />}
                            />
                        )}
                        {officeStats?.activeBookings !== undefined && (
                            <StatCard
                                title="Active Bookings"
                                value={officeStats.activeBookings === null ? '—' : officeStats.activeBookings.toString()}
                                description="Currently in progress"
                                icon={<CalendarCheck className="h-4 w-4" />}
                            />
                        )}
                        {officeStats?.paymentsThisMonth !== undefined && (
                            <StatCard
                                title="Payments"
                                value={officeStats.paymentsThisMonth === null ? '—' : `Rs. ${officeStats.paymentsThisMonth.toLocaleString()}`}
                                description="This month's collections"
                                icon={<CreditCard className="h-4 w-4" />}
                            />
                        )}
                        {officeStats?.pendingDocuments !== undefined && (
                            <StatCard
                                title="Pending Documents"
                                value={officeStats.pendingDocuments === null ? '—' : officeStats.pendingDocuments.toString()}
                                description="Awaiting verification"
                                icon={<FileText className="h-4 w-4" />}
                            />
                        )}
                    </div>
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

                {/* Operational Widgets */}
                {isOffice && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
                        {/* Recent Bookings Widget */}
                        {recentBookings && (
                            <Card className="col-span-4 flex flex-col h-full">
                                <CardHeader>
                                    <CardTitle>Recent Bookings</CardTitle>
                                    <CardDescription>
                                        Latest bookings created in the system.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    {recentBookings.length === 0 ? (
                                        <div className="flex h-32 flex-col items-center justify-center text-center text-muted-foreground">
                                            <CalendarCheck className="mb-2 h-6 w-6 opacity-50" />
                                            <p className="text-sm">No recent bookings found.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Ref</TableHead>
                                                        <TableHead>Customer</TableHead>
                                                        <TableHead>Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {recentBookings.map((booking: any) => (
                                                        <TableRow key={booking.id}>
                                                            <TableCell className="font-medium text-xs">{booking.booking_reference}</TableCell>
                                                            <TableCell>{booking.customer?.full_name}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="text-[0.65rem]">
                                                                    {booking.booking_status}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Recent Customers or Payments Widget */}
                        <div className="col-span-3 flex flex-col gap-4">
                            {recentCustomers && (
                                <Card className="flex-1">
                                    <CardHeader>
                                        <CardTitle>Recent Customers</CardTitle>
                                        <CardDescription>
                                            Newly registered customers.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {recentCustomers.length === 0 ? (
                                            <div className="flex h-24 flex-col items-center justify-center text-center text-muted-foreground">
                                                <Users className="mb-2 h-6 w-6 opacity-50" />
                                                <p className="text-sm">No recent customers.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {recentCustomers.slice(0, 4).map((customer: any) => (
                                                    <div key={customer.id} className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                                            {customer.full_name.charAt(0)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">{customer.full_name}</span>
                                                            <span className="text-xs text-muted-foreground">{customer.phone}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {recentPayments && (
                                <Card className="flex-1">
                                    <CardHeader>
                                        <CardTitle>Recent Payments</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {recentPayments.length === 0 ? (
                                            <div className="flex h-24 flex-col items-center justify-center text-center text-muted-foreground">
                                                <CreditCard className="mb-2 h-6 w-6 opacity-50" />
                                                <p className="text-sm">No recent payments.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {recentPayments.slice(0, 4).map((payment: any) => (
                                                    <div key={payment.id} className="flex items-center justify-between gap-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">{payment.customer?.full_name}</span>
                                                            <span className="text-xs text-muted-foreground">{payment.payment_method}</span>
                                                        </div>
                                                        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                            Rs. {Number(payment.amount).toLocaleString()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
