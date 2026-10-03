import { Head, Link } from '@inertiajs/react';
import CustomerPortalLayout from '@/components/layouts/CustomerPortalLayout';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardTitle, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, ArrowRight, PlaneTakeoff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Booking } from '@/types';
import { StatusBadge, MoneyText } from '@/components/common';

interface DashboardProps {
    nextBooking: Booking | null;
    daysRemaining: number | null;
    totalOutstanding: number;
    actionItems: string[];
}

export default function PortalDashboard({ nextBooking, daysRemaining, totalOutstanding, actionItems }: DashboardProps) {
    const { user } = useAuth();
    const firstName = user?.name?.split(' ')[0] || 'Traveler';

    return (
        <CustomerPortalLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* Greeting */}
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Hello, {firstName}! 👋
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Welcome to your personal travel hub.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Hero Card: Next Trip */}
                    <div className="md:col-span-2">
                        {nextBooking ? (
                            <Card className="h-full overflow-hidden border-none shadow-xl bg-gradient-to-br from-primary/90 to-primary text-primary-foreground relative group">
                                <div className="absolute inset-0 bg-[url('/img/pattern.svg')] opacity-10 mix-blend-overlay"></div>
                                <div className="absolute right-0 top-0 opacity-20 -translate-y-1/4 translate-x-1/4 transition-transform group-hover:scale-110 duration-700">
                                    <PlaneTakeoff className="w-64 h-64" />
                                </div>
                                <CardHeader className="relative z-10">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-2xl font-bold text-primary-foreground flex items-center gap-2">
                                            {nextBooking.tour_package?.name || 'Custom Tour'}
                                        </CardTitle>
                                        <StatusBadge 
                                            type="booking" 
                                            status={(nextBooking.booking_status.charAt(0).toUpperCase() + nextBooking.booking_status.slice(1)) as any} 
                                            className="bg-background/20 text-primary-foreground border-none backdrop-blur-sm"
                                        />
                                    </div>
                                    <CardDescription className="text-primary-foreground/80 text-base">
                                        {new Date(nextBooking.travel_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="relative z-10 pt-6">
                                    <div className="flex flex-col">
                                        <span className="text-5xl font-black tracking-tighter">
                                            {daysRemaining}
                                        </span>
                                        <span className="text-lg font-medium text-primary-foreground/80 uppercase tracking-widest">
                                            Days to go
                                        </span>
                                    </div>
                                </CardContent>
                                <CardFooter className="relative z-10 mt-auto">
                                    <Button render={<Link href={route('portal.bookings.show', { booking: nextBooking.id })} />} variant="secondary" className="w-full sm:w-auto font-semibold">
                                        View trip details
                                    </Button>
                                </CardFooter>
                            </Card>
                        ) : (
                            <Card className="h-full flex flex-col items-center justify-center text-center p-8 bg-muted/30 border-dashed border-2">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <PlaneTakeoff className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Ready for your next adventure?</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm">
                                    You don't have any upcoming trips planned. Discover our latest destinations and book your next getaway.
                                </p>
                                <Button render={<a href="/tours" />}>
                                    Browse Tours
                                </Button>
                            </Card>
                        )}
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Outstanding Balance */}
                        <Card className="flex-1 shadow-md border-border/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-primary" />
                                    Outstanding Balance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    <MoneyText amount={totalOutstanding} currency="LKR" />
                                </div>
                                {totalOutstanding > 0 && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Please complete your payments before the travel date.
                                    </p>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button render={<Link href={route('portal.payments.index')} />} variant="outline" className="w-full text-sm h-9" size="sm">
                                    View payments
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Action Needed */}
                        <Card className="flex-1 shadow-md border-border/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                    Action Needed
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {actionItems.length > 0 ? (
                                    <ul className="space-y-3">
                                        {actionItems.map((item, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm">
                                                <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                                                <span className="text-muted-foreground">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-4 text-center">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">All caught up!</p>
                                        <p className="text-xs text-muted-foreground mt-1">No pending actions required.</p>
                                    </div>
                                )}
                            </CardContent>
                            {actionItems.length > 0 && (
                                <CardFooter>
                                    <Button render={<Link href={route('portal.documents.index')} />} variant="ghost" className="w-full text-sm h-9 text-primary" size="sm">
                                        Review documents <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerPortalLayout>
    );
}
