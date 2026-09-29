import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface BookingIndexProps {
    bookings: {
        data: any[];
        links: any[];
    };
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'confirmed': return 'bg-blue-100 text-blue-800';
        case 'completed': return 'bg-green-100 text-green-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default function BookingIndex({ bookings }: BookingIndexProps) {
    const { hasRole } = useAuth();
    const canCreate = hasRole(['super_admin', 'manager', 'staff']);

    return (
        <AppLayout>
            <Head title="Bookings" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
                    <p className="text-muted-foreground mt-1">Manage tour and travel bookings.</p>
                </div>
                <div className="flex space-x-2">
                    {canCreate && (
                        <Button asChild>
                            <Link href={route('bookings.create')}>
                                <Plus className="mr-2 h-4 w-4" /> New Booking
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <Card className="mb-6">
                <CardContent className="p-4 flex gap-4 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search bookings..." className="pl-9" />
                    </div>
                    <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filters</Button>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reference</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Package</TableHead>
                                <TableHead>Travel Date</TableHead>
                                <TableHead>Travelers</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No bookings found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bookings.data.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">{booking.booking_reference}</TableCell>
                                        <TableCell>{booking.customer?.first_name} {booking.customer?.last_name}</TableCell>
                                        <TableCell>{booking.tour_package?.name}</TableCell>
                                        <TableCell>{booking.travel_date}</TableCell>
                                        <TableCell>{booking.number_of_travelers}</TableCell>
                                        <TableCell>{Number(booking.final_amount).toLocaleString()} {booking.currency}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getStatusColor(booking.booking_status)}>
                                                {booking.booking_status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={route('bookings.show', booking.id)}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
