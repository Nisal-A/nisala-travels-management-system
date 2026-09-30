import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, StatusBadge, MoneyText, EmptyState, PageHeader } from '@/components/common';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PaginatedData, Booking } from '@/types';
import { CalendarCheck } from 'lucide-react';

interface Props {
    bookings: PaginatedData<Booking>;
}

export default function PortalBookings({ bookings }: Props) {
    return (
        <AppLayout title="My Bookings">
            <Head title="My Bookings" />

            <div className="space-y-6">
                <PageHeader
                    title="My Bookings"
                    description="View and manage your travel bookings."
                />

                <Card>
                    <CardContent className="p-0">
                        {bookings.data.length === 0 ? (
                            <EmptyState
                                icon={CalendarCheck}
                                title="No bookings found"
                                description="You haven't made any bookings yet."
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Tour Package</TableHead>
                                            <TableHead>Travel Date</TableHead>
                                            <TableHead>Travelers</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bookings.data.map((booking) => (
                                            <TableRow key={booking.id}>
                                                <TableCell className="font-medium">
                                                    {booking.booking_reference}
                                                </TableCell>
                                                <TableCell>
                                                    {booking.tour_package?.name || 'Custom Tour'}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(booking.travel_date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>{booking.number_of_travelers}</TableCell>
                                                <TableCell>
                                                    <MoneyText amount={Number(booking.final_amount)} currency={booking.currency || 'LKR'} />
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge 
                                                        type="booking" 
                                                        status={
                                                            (booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)) as "Pending" | "Confirmed" | "Cancelled" | "Completed"
                                                        } 
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
