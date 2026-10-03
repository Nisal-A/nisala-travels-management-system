import { Head } from '@inertiajs/react';
import CustomerPortalLayout from '@/components/layouts/CustomerPortalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge, MoneyText } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    CalendarDays,
    Download,
    MapPin,
    Map,
    Plane,
    Clock,
    ShieldCheck,
    FileText,
    CheckCircle2,
    CreditCard,
    Receipt,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Traveler {
    first_name: string;
    last_name: string;
    traveler_type: string;
}

interface Payment {
    id: number;
    receipt_number: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    status: string;
}

interface Document {
    id: number;
    document_type: string;
    file_name: string;
    status: string;
    created_at: string;
}

interface BookingDetail {
    id: number;
    booking_reference: string;
    tour_package: { id: number; name: string } | null;
    travelers: Traveler[];
    booking_date: string;
    travel_date: string;
    return_date: string | null;
    booking_status: string;
    payment_status: string;
    number_of_travelers: number;
    final_amount: number;
    paid_amount: number;
    balance_amount: number;
    currency: 'LKR' | 'USD';
    notes: string | null;
    payments: Payment[];
    documents: Document[];
}

export default function PortalBookingDetail({ booking }: { booking: BookingDetail }) {
    const handleDownloadItinerary = () => {
        window.open(route('portal.bookings.itinerary', { booking: booking.id }), '_blank');
    };

    return (
        <CustomerPortalLayout title={`Booking #${booking.booking_reference}`}>
            <Head title={`Booking ${booking.booking_reference}`} />

            <div className="space-y-6">
                {/* Header Card */}
                <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-card to-muted/50">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight">
                                {booking.tour_package?.name || 'Custom Travel Package'}
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                                <span className="flex items-center gap-1 font-mono bg-muted px-2 py-1 rounded-md text-xs">
                                    #{booking.booking_reference}
                                </span>
                                <span className="flex items-center gap-1">
                                    <CalendarDays className="h-4 w-4" />
                                    {booking.travel_date} {booking.return_date && `to ${booking.return_date}`}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="flex gap-2 justify-start md:justify-end">
                                <StatusBadge
                                    type="booking"
                                    status={
                                        (booking.booking_status.charAt(0).toUpperCase() +
                                            booking.booking_status.slice(1)) as any
                                    }
                                    className="text-sm px-3 py-1"
                                />
                                <StatusBadge
                                    type="payment"
                                    status={
                                        (booking.payment_status.charAt(0).toUpperCase() +
                                            booking.payment_status.slice(1)) as any
                                    }
                                    className="text-sm px-3 py-1"
                                />
                            </div>
                            <Button
                                onClick={handleDownloadItinerary}
                                className="gap-2 shrink-0 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform"
                            >
                                <Download className="h-4 w-4" />
                                Itinerary PDF
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Tabs Area */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50 rounded-xl mb-6 flex-nowrap hide-scrollbar">
                        <TabsTrigger
                            value="overview"
                            className="rounded-lg py-2.5 px-4 font-medium min-w-fit data-[state=active]:shadow-sm"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="travelers"
                            className="rounded-lg py-2.5 px-4 font-medium min-w-fit data-[state=active]:shadow-sm"
                        >
                            Travelers
                        </TabsTrigger>
                        <TabsTrigger
                            value="itinerary"
                            className="rounded-lg py-2.5 px-4 font-medium min-w-fit data-[state=active]:shadow-sm"
                        >
                            Itinerary
                        </TabsTrigger>
                        <TabsTrigger
                            value="payments"
                            className="rounded-lg py-2.5 px-4 font-medium min-w-fit data-[state=active]:shadow-sm"
                        >
                            Payments
                        </TabsTrigger>
                        <TabsTrigger
                            value="documents"
                            className="rounded-lg py-2.5 px-4 font-medium min-w-fit data-[state=active]:shadow-sm"
                        >
                            Documents
                        </TabsTrigger>
                    </TabsList>

                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <TabsContent value="overview" className="mt-0 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card className="shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Plane className="h-5 w-5 text-primary" /> Trip Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-1">
                                                <span className="text-muted-foreground text-xs">Destination</span>
                                                <p className="font-medium">{booking.tour_package?.name || 'Various'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-muted-foreground text-xs">Travelers</span>
                                                <p className="font-medium">{booking.number_of_travelers}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-muted-foreground text-xs">Departure</span>
                                                <p className="font-medium">{booking.travel_date}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-muted-foreground text-xs">Return</span>
                                                <p className="font-medium">{booking.return_date || 'TBD'}</p>
                                            </div>
                                        </div>
                                        {booking.notes && (
                                            <div className="pt-4 border-t">
                                                <span className="text-muted-foreground text-xs block mb-1">Notes</span>
                                                <p className="text-sm">{booking.notes}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm bg-primary/5 border-primary/10">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-primary" /> Payment Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Total Amount</span>
                                            <span className="font-medium">
                                                <MoneyText amount={booking.final_amount} currency={booking.currency} />
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Amount Paid</span>
                                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                                <MoneyText amount={booking.paid_amount} currency={booking.currency} />
                                            </span>
                                        </div>
                                        <div className="pt-4 border-t border-primary/10 flex justify-between items-center">
                                            <span className="font-medium">Balance Due</span>
                                            <span className="text-xl font-bold text-primary">
                                                <MoneyText
                                                    amount={booking.balance_amount}
                                                    currency={booking.currency}
                                                />
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="travelers" className="mt-0">
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Travelers ({booking.travelers.length})</CardTitle>
                                    <CardDescription>
                                        People going on this trip and their document status.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Documents</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {booking.travelers.map((t, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="font-medium">
                                                        {t.first_name} {t.last_name}
                                                    </TableCell>
                                                    <TableCell className="capitalize">{t.traveler_type}</TableCell>
                                                    <TableCell>
                                                        {i === 0 ? (
                                                            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-500/10 w-fit px-2 py-1 rounded-full">
                                                                <CheckCircle2 className="h-3 w-3" /> All set
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium bg-muted w-fit px-2 py-1 rounded-full">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="itinerary" className="mt-0">
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Trip Itinerary</CardTitle>
                                    <CardDescription>Your day-by-day travel plan.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-2 pb-8 px-8">
                                    <div className="relative border-l-2 border-muted-foreground/20 ml-3 space-y-8 pl-8 py-2">
                                        <div className="relative group">
                                            <div className="absolute -left-[41px] bg-primary rounded-full p-1.5 shadow-md ring-4 ring-background transition-transform group-hover:scale-110">
                                                <Plane className="h-4 w-4 text-primary-foreground" />
                                            </div>
                                            <div className="bg-muted/30 rounded-lg p-4 border border-border/50 transition-all hover:bg-muted/50 hover:shadow-md">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-bold text-foreground">
                                                        Day 1: Arrival & Check-in
                                                    </h4>
                                                    <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border shadow-sm">
                                                        08:00 AM
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Arrive at the airport, transfer to hotel. Rest and acclimatize.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute -left-[41px] bg-primary rounded-full p-1.5 shadow-md ring-4 ring-background transition-transform group-hover:scale-110">
                                                <Map className="h-4 w-4 text-primary-foreground" />
                                            </div>
                                            <div className="bg-muted/30 rounded-lg p-4 border border-border/50 transition-all hover:bg-muted/50 hover:shadow-md">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-bold text-foreground">Day 2: City Tour</h4>
                                                    <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border shadow-sm">
                                                        09:30 AM
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Guided city tour exploring major landmarks, historical sites, and
                                                    local markets.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute -left-[41px] bg-secondary rounded-full p-1.5 shadow-md ring-4 ring-background transition-transform group-hover:scale-110">
                                                <Plane className="h-4 w-4 text-secondary-foreground" />
                                            </div>
                                            <div className="bg-muted/30 rounded-lg p-4 border border-border/50 transition-all hover:bg-muted/50 hover:shadow-md">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-bold text-foreground">Day 3: Departure</h4>
                                                    <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border shadow-sm">
                                                        11:00 AM
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Transfer to airport for departure.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="payments" className="mt-0">
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Payment History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {booking.payments.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                                            <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            No payments recorded yet.
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Receipt No</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Method</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {booking.payments.map((p) => (
                                                    <TableRow key={p.id}>
                                                        <TableCell className="font-mono text-sm">
                                                            {p.receipt_number}
                                                        </TableCell>
                                                        <TableCell>{p.payment_date}</TableCell>
                                                        <TableCell className="capitalize">{p.payment_method}</TableCell>
                                                        <TableCell className="font-medium">
                                                            <MoneyText amount={p.amount} currency={booking.currency} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge
                                                                type="payment"
                                                                status={
                                                                    (p.status.charAt(0).toUpperCase() +
                                                                        p.status.slice(1)) as any
                                                                }
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="documents" className="mt-0">
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Associated Documents</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {booking.documents.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            No documents available.
                                        </div>
                                    ) : (
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {booking.documents.map((d) => (
                                                <div
                                                    key={d.id}
                                                    className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                                                >
                                                    <div className="bg-primary/10 p-2 rounded-lg">
                                                        <FileText className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div className="flex-1 space-y-1 overflow-hidden">
                                                        <h4
                                                            className="font-medium text-sm line-clamp-1"
                                                            title={d.document_type || 'Document'}
                                                        >
                                                            {d.document_type || 'Document'}
                                                        </h4>
                                                        <p
                                                            className="text-xs text-muted-foreground truncate"
                                                            title={d.file_name}
                                                        >
                                                            {d.file_name}
                                                        </p>
                                                        <div className="pt-2">
                                                            <StatusBadge
                                                                type="document"
                                                                status={
                                                                    (d.status.charAt(0).toUpperCase() +
                                                                        d.status.slice(1)) as any
                                                                }
                                                                className="text-[10px] px-2 py-0"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </CustomerPortalLayout>
    );
}
