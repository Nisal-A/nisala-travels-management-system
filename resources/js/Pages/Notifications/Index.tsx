import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Bell,
    CalendarCheck,
    CreditCard,
    FileText,
    MessageSquare,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

// Define a placeholder type for the structure we expect Laravel Notifications to take eventually
interface AppNotification {
    id: string;
    type: 'booking' | 'inquiry' | 'document' | 'payment' | 'alert';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    actionUrl?: string;
}

export default function NotificationsIndex() {
    const { user } = useAuth();

    // Mock data to demonstrate the UI structure, as backend notification workflows are deferred.
    // In production, this would be populated from $page.props.notifications or user.notifications
    const placeholderNotifications: AppNotification[] = [
        {
            id: '1',
            type: 'booking',
            title: 'New Booking Created',
            message: 'A new booking (BKG-2024-001) has been created by John Doe.',
            isRead: false,
            createdAt: '10 minutes ago',
            actionUrl: route('dashboard')
        },
        {
            id: '2',
            type: 'document',
            title: 'Document Uploaded',
            message: 'Jane Smith uploaded a new passport copy for verification.',
            isRead: false,
            createdAt: '2 hours ago'
        },
        {
            id: '3',
            type: 'payment',
            title: 'Payment Recorded',
            message: 'A payment of Rs. 50,000 was recorded for Booking BKG-2024-002.',
            isRead: true,
            createdAt: '1 day ago'
        },
        {
            id: '4',
            type: 'alert',
            title: 'Document Expiry Warning',
            message: 'Passport for customer Michael Lee is expiring in 30 days.',
            isRead: true,
            createdAt: '2 days ago'
        },
        {
            id: '5',
            type: 'inquiry',
            title: 'New Customer Inquiry',
            message: 'A new inquiry was submitted regarding the Maldives Tour Package.',
            isRead: true,
            createdAt: '3 days ago'
        }
    ];

    const getIconForType = (type: AppNotification['type']) => {
        switch (type) {
            case 'booking':
                return <CalendarCheck className="h-5 w-5 text-blue-500" />;
            case 'document':
                return <FileText className="h-5 w-5 text-indigo-500" />;
            case 'payment':
                return <CreditCard className="h-5 w-5 text-emerald-500" />;
            case 'inquiry':
                return <MessageSquare className="h-5 w-5 text-amber-500" />;
            case 'alert':
                return <AlertTriangle className="h-5 w-5 text-rose-500" />;
            default:
                return <Bell className="h-5 w-5 text-muted-foreground" />;
        }
    };

    return (
        <AppLayout 
            title="Notifications" 
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Notifications' },
            ]}
        >
            <Head title="Notifications" />

            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Your Notifications</h2>
                        <p className="text-muted-foreground">Stay updated on system activities and alerts.</p>
                    </div>
                    <Button variant="outline" className="shrink-0" onClick={() => alert('Mark all as read - To be implemented')}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark all as read
                    </Button>
                </div>

                <Card>
                    <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                        <CardTitle className="text-lg">Recent Alerts</CardTitle>
                        <CardDescription>You have 2 unread notifications.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {placeholderNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                                <Bell className="mb-4 h-12 w-12 opacity-20" />
                                <h3 className="text-lg font-medium">No notifications</h3>
                                <p className="text-sm">You're all caught up! Check back later.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col divide-y divide-border/50">
                                {placeholderNotifications.map((notification) => (
                                    <div 
                                        key={notification.id} 
                                        className={`flex items-start gap-4 p-4 transition-colors hover:bg-muted/50 ${
                                            !notification.isRead ? 'bg-primary/5' : ''
                                        }`}
                                    >
                                        <div className={`mt-1 flex shrink-0 items-center justify-center rounded-full bg-background p-2 shadow-sm ring-1 ring-border ${
                                            !notification.isRead ? 'ring-primary/30' : ''
                                        }`}>
                                            {getIconForType(notification.type)}
                                        </div>
                                        <div className="flex flex-1 flex-col gap-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className={`text-sm font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {notification.title}
                                                </h4>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {notification.createdAt}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {notification.message}
                                            </p>
                                            
                                            {/* Optional Call to Action */}
                                            {notification.actionUrl && (
                                                <div className="mt-2">
                                                    <Link 
                                                        href={notification.actionUrl} 
                                                        className="inline-flex text-xs font-medium text-primary hover:underline"
                                                    >
                                                        View details &rarr;
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {!notification.isRead && (
                                            <div className="mt-2 shrink-0">
                                                <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
