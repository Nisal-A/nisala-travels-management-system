import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerPortalLayout from '@/components/layouts/CustomerPortalLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { StatusBadge, MoneyText, EmptyState } from '@/components/common';
import { CalendarCheck, Search, Users, CalendarDays, ArrowRight } from 'lucide-react';
import { PaginatedData } from '@/types';

interface PortalBooking {
    id: number;
    booking_reference: string;
    tour_name: string | null;
    travel_date: string;
    return_date: string | null;
    booking_status: string;
    payment_status: string;
    number_of_travelers: number;
    final_amount: number;
    paid_amount: number;
    currency: 'LKR' | 'USD';
}

interface Props {
    bookings: PaginatedData<PortalBooking>;
    filters: { search?: string; status?: string };
}

export default function PortalBookings({ bookings, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('portal.bookings.index'), { search, status }, { preserveState: true });
    };

    const handleTabChange = (newStatus: string) => {
        setStatus(newStatus);
        router.get(route('portal.bookings.index'), { search, status: newStatus }, { preserveState: true });
    };

    return (
        <CustomerPortalLayout title="My Bookings">
            <Head title="My Bookings" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <Tabs value={status} onValueChange={handleTabChange} className="w-full sm:w-auto">
                        <TabsList className="grid w-full grid-cols-4 sm:w-auto">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                            <TabsTrigger value="completed">Completed</TabsTrigger>
                            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search destination or ref..."
                            className="pl-8 bg-background"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                </div>

                {bookings.data.length === 0 ? (
                    <EmptyState
                        icon={CalendarCheck}
                        title="No bookings found"
                        description={
                            search || status !== 'all'
                                ? "Try adjusting your filters to find what you're looking for."
                                : "You haven't made any bookings yet."
                        }
                    />
                ) : (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                        {bookings.data.map((booking) => {
                            const progress =
                                booking.final_amount > 0 ? (booking.paid_amount / booking.final_amount) * 100 : 0;
                            return (
                                <Card
                                    key={booking.id}
                                    className="group overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300"
                                >
                                    <CardHeader className="pb-4 bg-muted/20">
                                        <div className="flex justify-between items-start gap-4 mb-2">
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl line-clamp-1">
                                                    {booking.tour_name || 'Custom Destination'}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground font-mono">
                                                    #{booking.booking_reference}
                                                </p>
                                            </div>
                                            <StatusBadge
                                                type="booking"
                                                status={
                                                    (booking.booking_status.charAt(0).toUpperCase() +
                                                        booking.booking_status.slice(1)) as any
                                                }
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 flex-1">
                                        <div className="space-y-4 text-sm">
                                            <div className="flex items-center gap-3 text-muted-foreground">
                                                <CalendarDays className="h-4 w-4 text-primary" />
                                                <span>
                                                    {new Date(booking.travel_date).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                    {booking.return_date &&
                                                        ` - ${new Date(booking.return_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-muted-foreground">
                                                <Users className="h-4 w-4 text-primary" />
                                                <span>
                                                    {booking.number_of_travelers} traveler
                                                    {booking.number_of_travelers !== 1 ? 's' : ''}
                                                </span>
                                            </div>

                                            <div className="pt-4 border-t space-y-2 mt-4">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-muted-foreground">Payment Progress</span>
                                                    <span className="font-medium">
                                                        {Math.min(Math.round(progress), 100)}%
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-500 ease-out"
                                                        style={{ width: `${Math.min(Math.round(progress), 100)}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-end mt-2">
                                                    <div className="text-lg font-bold">
                                                        <MoneyText
                                                            amount={booking.final_amount}
                                                            currency={booking.currency || 'LKR'}
                                                        />
                                                    </div>
                                                    <StatusBadge
                                                        type="payment"
                                                        status={
                                                            (booking.payment_status.charAt(0).toUpperCase() +
                                                                booking.payment_status.slice(1)) as any
                                                        }
                                                        className="text-[10px] px-1.5 py-0 h-5"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0 border-t bg-muted/10 p-0">
                                        <Button
                                            render={
                                                <Link href={route('portal.bookings.show', { booking: booking.id })} />
                                            }
                                            variant="ghost"
                                            className="w-full rounded-none rounded-b-lg h-12 justify-between px-6 hover:bg-primary/5 hover:text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                        >
                                            View booking details{' '}
                                            <ArrowRight className="h-4 w-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </CustomerPortalLayout>
    );
}
