import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { CalendarCheck, FileText, CreditCard } from 'lucide-react';

/**
 * Customer Portal Dashboard — NT-005.4
 *
 * Landing page for customers. Shows a summary of their own
 * bookings, documents, and payments.
 */
export default function PortalDashboard() {
    const { user } = useAuth();

    return (
        <AppLayout title="My Portal">
            <Head title="My Portal" />

            <div className="space-y-8">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Welcome, {user?.name?.split(' ')[0]}
                    </h2>
                    <p className="text-muted-foreground">
                        View your travel bookings, documents, and payment history.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            title: 'My Bookings',
                            description: 'View your upcoming and past travel bookings.',
                            icon: CalendarCheck,
                            route: 'portal.bookings',
                        },
                        {
                            title: 'My Documents',
                            description: 'Upload and track your travel documents.',
                            icon: FileText,
                            route: 'portal.documents',
                        },
                        {
                            title: 'My Payments',
                            description: 'View your payment history and outstanding balances.',
                            icon: CreditCard,
                            route: 'portal.payments',
                        },
                    ].map((item) => (
                        <a key={item.route} href={route(item.route)} className="group">
                            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="mb-4 rounded-2xl bg-primary/5 p-4 transition-colors group-hover:bg-primary/10">
                                        <item.icon className="h-8 w-8 text-primary/60 transition-colors group-hover:text-primary" />
                                    </div>
                                    <CardTitle className="mb-1 text-base">{item.title}</CardTitle>
                                    <CardDescription className="text-xs">{item.description}</CardDescription>
                                </CardContent>
                            </Card>
                        </a>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
