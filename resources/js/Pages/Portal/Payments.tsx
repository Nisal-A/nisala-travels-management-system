import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import CustomerPortalLayout from '@/components/layouts/CustomerPortalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge, MoneyText } from '@/components/common';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Download, Search, Info, CalendarClock, Receipt, ArrowRight, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Payment {
    id: number;
    receipt_number: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    status: string;
    booking: {
        id: number;
        booking_reference: string;
        tour_package: {
            name: string;
        } | null;
    };
}

interface Installment {
    booking_id: number;
    booking_reference: string;
    tour_name: string;
    description: string;
    amount: number;
    due_date: string | null;
    status: string;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export default function Payments({
    payments,
    summary,
    filters,
    installments,
    customerBookings,
    payment_instructions,
}: {
    payments: { data: Payment[]; meta: PaginationMeta };
    summary: { total_paid: number; total_outstanding: number; next_due_date: string | null };
    filters: { booking_id?: string; date_from?: string; date_to?: string };
    installments: Installment[];
    customerBookings: { id: number; reference: string }[];
    payment_instructions: { bank: string; account_name: string; account_number: string; branch: string; notes: string };
}) {
    const [bookingFilter, setBookingFilter] = useState(filters.booking_id || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleFilter = () => {
        router.get(
            route('portal.payments.index'),
            {
                booking_id: bookingFilter !== 'all' ? bookingFilter : undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleClearFilters = () => {
        setBookingFilter('all');
        setDateFrom('');
        setDateTo('');
        router.get(route('portal.payments.index'));
    };

    const handleDownloadReceipt = (paymentId: number) => {
        window.open(route('portal.payments.receipt', { payment: paymentId }), '_blank');
    };

    return (
        <CustomerPortalLayout title="Payments & Billing">
            <Head title="Payments & Billing" />

            <div className="space-y-6">
                {/* Summary Strip */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-200 dark:border-emerald-900/50">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400 mb-1">
                                    Total Paid
                                </p>
                                <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-500">
                                    <MoneyText amount={summary.total_paid} currency="LKR" />
                                </h3>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-200 dark:border-orange-900/50">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-800 dark:text-orange-400 mb-1">
                                    Total Outstanding
                                </p>
                                <h3 className="text-2xl font-bold text-orange-700 dark:text-orange-500">
                                    <MoneyText amount={summary.total_outstanding} currency="LKR" />
                                </h3>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                                <CreditCard className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-200 dark:border-blue-900/50">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-1">
                                    Next Due Date
                                </p>
                                <h3 className="text-xl font-bold text-blue-700 dark:text-blue-500">
                                    {summary.next_due_date || 'No pending payments'}
                                </h3>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                <CalendarClock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end">
                    <Dialog>
                        <DialogTrigger>
                            <Button variant="outline" className="gap-2">
                                <Info className="h-4 w-4" /> Payment Instructions
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>How to Pay</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <p className="text-sm text-muted-foreground">
                                    You can make payments via bank transfer to the following account:
                                </p>
                                <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                                    <p>
                                        <strong>Bank:</strong> {payment_instructions.bank}
                                    </p>
                                    <p>
                                        <strong>Account Name:</strong> {payment_instructions.account_name}
                                    </p>
                                    <p>
                                        <strong>Account Number:</strong> {payment_instructions.account_number}
                                    </p>
                                    <p>
                                        <strong>Branch:</strong> {payment_instructions.branch}
                                    </p>
                                </div>
                                <p className="text-sm text-muted-foreground">{payment_instructions.notes}</p>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <Tabs defaultValue="transactions" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="transactions">Transaction History</TabsTrigger>
                        <TabsTrigger value="schedule">Installment Schedule</TabsTrigger>
                    </TabsList>

                    <TabsContent value="transactions" className="space-y-4">
                        {/* Filters */}
                        <Card>
                            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
                                <div className="space-y-1 w-full md:w-1/3">
                                    <label className="text-xs font-medium">Filter by Booking</label>
                                    <Select value={bookingFilter} onValueChange={(v) => setBookingFilter(v || 'all')}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Bookings" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Bookings</SelectItem>
                                            {customerBookings.map((b) => (
                                                <SelectItem key={b.id} value={b.id.toString()}>
                                                    {b.reference}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1 w-full md:w-1/4">
                                    <label className="text-xs font-medium">From Date</label>
                                    <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                                </div>
                                <div className="space-y-1 w-full md:w-1/4">
                                    <label className="text-xs font-medium">To Date</label>
                                    <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <Button onClick={handleFilter} className="w-full md:w-auto">
                                        <Search className="h-4 w-4 mr-2" /> Search
                                    </Button>
                                    {(filters.booking_id || filters.date_from || filters.date_to) && (
                                        <Button variant="ghost" onClick={handleClearFilters}>
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-0">
                                {payments.data.length === 0 ? (
                                    <div className="text-center py-16 px-4">
                                        <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Receipt className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">No payments found</h3>
                                        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                                            We couldn't find any transactions matching your current criteria.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Desktop Table */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Date</TableHead>
                                                        <TableHead>Booking</TableHead>
                                                        <TableHead>Method</TableHead>
                                                        <TableHead>Amount</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="text-right">Action</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {payments.data.map((payment) => (
                                                        <TableRow key={payment.id}>
                                                            <TableCell>{payment.payment_date}</TableCell>
                                                            <TableCell>
                                                                <div className="font-medium">
                                                                    {payment.booking.booking_reference ??
                                                                        `BKG-${payment.booking.id}`}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {payment.booking.tour_package?.name ||
                                                                        'Custom Tour'}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="capitalize">
                                                                {payment.payment_method}
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                <MoneyText amount={payment.amount} currency="LKR" />
                                                            </TableCell>
                                                            <TableCell>
                                                                <StatusBadge
                                                                    type="payment"
                                                                    status={
                                                                        (payment.status.charAt(0).toUpperCase() +
                                                                            payment.status.slice(1)) as any
                                                                    }
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {payment.status === 'completed' && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleDownloadReceipt(payment.id)
                                                                        }
                                                                    >
                                                                        <Download className="h-4 w-4 mr-2" /> Receipt
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Mobile Cards */}
                                        <div className="md:hidden space-y-4 p-4">
                                            {payments.data.map((payment) => (
                                                <div
                                                    key={payment.id}
                                                    className="border rounded-lg p-4 space-y-3 bg-card shadow-sm"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-medium">
                                                                {payment.booking.booking_reference ??
                                                                    `BKG-${payment.booking.id}`}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {payment.payment_date}
                                                            </div>
                                                        </div>
                                                        <StatusBadge
                                                            type="payment"
                                                            status={
                                                                (payment.status.charAt(0).toUpperCase() +
                                                                    payment.status.slice(1)) as any
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 border-t">
                                                        <div className="font-bold text-lg">
                                                            <MoneyText amount={payment.amount} currency="LKR" />
                                                        </div>
                                                        {payment.status === 'completed' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDownloadReceipt(payment.id)}
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {payments.meta.last_page > 1 && (
                                            <div className="p-4 flex items-center justify-between border-t">
                                                <div className="text-sm text-muted-foreground">
                                                    Showing {(payments.meta.current_page - 1) * 10 + 1} to{' '}
                                                    {Math.min(payments.meta.current_page * 10, payments.meta.total)} of{' '}
                                                    {payments.meta.total} entries
                                                </div>
                                                <div className="flex gap-1">
                                                    {payments.meta.links.map((link, i) => (
                                                        <Button
                                                            key={i}
                                                            variant={link.active ? 'default' : 'outline'}
                                                            size="sm"
                                                            disabled={!link.url}
                                                            onClick={() => link.url && router.get(link.url)}
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="schedule" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming & Past Installments</CardTitle>
                                <CardDescription>Your payment schedule based on active bookings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {installments.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        No active installment schedules.
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {Array.from(new Set(installments.map((i) => i.booking_id))).map((bookingId) => {
                                            const bookingInstallments = installments.filter(
                                                (i) => i.booking_id === bookingId,
                                            );
                                            const bookingRef = bookingInstallments[0].booking_reference;
                                            const tourName = bookingInstallments[0].tour_name;
                                            return (
                                                <div key={bookingId} className="space-y-4">
                                                    <h4 className="font-semibold text-lg flex items-center gap-2">
                                                        <ArrowRight className="h-4 w-4 text-primary" />
                                                        {bookingRef} - {tourName}
                                                    </h4>
                                                    <div className="relative border-l-2 border-muted ml-3 pl-6 space-y-6 py-2">
                                                        {bookingInstallments.map((inst, idx) => (
                                                            <div key={idx} className="relative">
                                                                <div
                                                                    className={`absolute -left-[31px] rounded-full p-1 ring-4 ring-background ${inst.status === 'Paid' ? 'bg-emerald-500' : inst.status === 'Overdue' ? 'bg-destructive' : 'bg-muted-foreground'}`}
                                                                >
                                                                    <div className="h-2 w-2 rounded-full bg-white" />
                                                                </div>
                                                                <div className="bg-card border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                                                                    <div>
                                                                        <div className="font-bold">
                                                                            {inst.description}
                                                                        </div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            Due: {inst.due_date || 'TBD'}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="text-lg font-bold">
                                                                            <MoneyText
                                                                                amount={inst.amount}
                                                                                currency="LKR"
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${inst.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : inst.status === 'Overdue' ? 'bg-destructive/10 text-destructive' : 'bg-orange-100 text-orange-700'}`}
                                                                        >
                                                                            {inst.status}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </CustomerPortalLayout>
    );
}
