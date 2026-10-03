import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import CustomerPortalLayout from '@/components/layouts/CustomerPortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CalendarCheck, CreditCard, FileText, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import axios from 'axios';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AppNotification {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: number;
    data: {
        message: string;
        payment_id?: number;
        booking_id?: number;
        document_id?: number;
        inquiry_id?: number;
        [key: string]: any;
    };
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    total: number;
}

interface Props {
    notifications: PaginatedData<AppNotification>;
    filter: string;
}

export default function NotificationsIndex({ notifications, filter }: Props) {
    const { user, hasRole } = useAuth();
    const isCustomer = hasRole('customer') && !hasRole('super_admin', 'manager', 'staff', 'finance');
    const Layout = isCustomer ? CustomerPortalLayout : AppLayout;

    const [isMarkingAll, setIsMarkingAll] = useState(false);

    const getIconForNotification = (notification: AppNotification) => {
        const typeStr = notification.type.toLowerCase();
        if (typeStr.includes('booking')) return <CalendarCheck className="h-5 w-5 text-blue-500" />;
        if (typeStr.includes('document')) return <FileText className="h-5 w-5 text-indigo-500" />;
        if (typeStr.includes('payment')) return <CreditCard className="h-5 w-5 text-emerald-500" />;
        if (typeStr.includes('inquiry')) return <MessageSquare className="h-5 w-5 text-amber-500" />;
        if (typeStr.includes('alert')) return <AlertTriangle className="h-5 w-5 text-rose-500" />;
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    };

    const getActionUrl = (notification: AppNotification) => {
        const data = notification.data;
        if (isCustomer) {
            if (data.booking_id) return route('portal.bookings.show', { booking: data.booking_id });
            if (data.payment_id) return route('portal.payments.index');
            if (data.document_id) return route('portal.documents.index');
            return route('portal.dashboard');
        } else {
            if (data.booking_id) return route('bookings.show', { booking: data.booking_id });
            if (data.payment_id) return route('payments.index');
            if (data.document_id) return route('documents.index');
            // Assuming inquiries route might exist, otherwise dashboard
            return route('dashboard');
        }
    };

    const handleFilterChange = (value: string | null) => {
        if (value) {
            router.get(route('notifications.index'), { filter: value }, { preserveState: true });
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await axios.patch(route('notifications.markAsRead', { id }));
            router.reload({ only: ['notifications'] });
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const markAllAsRead = async () => {
        setIsMarkingAll(true);
        try {
            await axios.post(route('notifications.markAllAsRead'));
            router.reload({ only: ['notifications'] });
        } catch (error) {
            console.error('Failed to mark all as read', error);
        } finally {
            setIsMarkingAll(false);
        }
    };

    const unreadCount = notifications.data.filter((n) => !n.read_at).length;

    return (
        <Layout
            title="Notifications"
            breadcrumbs={[
                { label: 'Dashboard', href: route(isCustomer ? 'portal.dashboard' : 'dashboard') },
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
                    <div className="flex items-center gap-4">
                        <Select value={filter} onValueChange={handleFilterChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter notifications" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Notifications</SelectItem>
                                <SelectItem value="unread">Unread Only</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            className="shrink-0"
                            onClick={markAllAsRead}
                            disabled={isMarkingAll || (filter === 'unread' && notifications.data.length === 0)}
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark all as read
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                        <CardTitle className="text-lg">Recent Alerts</CardTitle>
                        <CardDescription>
                            {filter === 'unread'
                                ? `Showing ${notifications.total} unread notifications.`
                                : `Total ${notifications.total} notifications.`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {notifications.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                                <Bell className="mb-4 h-12 w-12 opacity-20" />
                                <h3 className="text-lg font-medium">No notifications</h3>
                                <p className="text-sm">You're all caught up! Check back later.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col divide-y divide-border/50">
                                {notifications.data.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`flex items-start gap-4 p-4 transition-colors hover:bg-muted/50 ${
                                            !notification.read_at ? 'bg-primary/5' : ''
                                        }`}
                                    >
                                        <div
                                            className={`mt-1 flex shrink-0 items-center justify-center rounded-full bg-background p-2 shadow-sm ring-1 ring-border ${
                                                !notification.read_at ? 'ring-primary/30' : ''
                                            }`}
                                        >
                                            {getIconForNotification(notification)}
                                        </div>
                                        <div className="flex flex-1 flex-col gap-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4
                                                    className={`text-sm font-semibold ${!notification.read_at ? 'text-foreground' : 'text-muted-foreground'}`}
                                                >
                                                    {notification.data.message ||
                                                        notification.type
                                                            .split('\\')
                                                            .pop()
                                                            ?.replace('Notification', '')}
                                                </h4>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {new Date(notification.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {/* Optional Call to Action */}
                                            <div className="mt-2 flex gap-4 items-center">
                                                <Link
                                                    href={getActionUrl(notification)}
                                                    className="inline-flex text-xs font-medium text-primary hover:underline"
                                                >
                                                    View details &rarr;
                                                </Link>
                                                {!notification.read_at && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="inline-flex text-xs font-medium text-muted-foreground hover:text-foreground underline"
                                                    >
                                                        Mark as read
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {!notification.read_at && (
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

                {/* Pagination */}
                {notifications.total > 0 && (
                    <div className="flex justify-between items-center py-4">
                        <Button
                            variant="outline"
                            disabled={!notifications.prev_page_url}
                            onClick={() =>
                                router.get(notifications.prev_page_url || '', { filter }, { preserveState: true })
                            }
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {notifications.current_page} of {notifications.last_page}
                        </span>
                        <Button
                            variant="outline"
                            disabled={!notifications.next_page_url}
                            onClick={() =>
                                router.get(notifications.next_page_url || '', { filter }, { preserveState: true })
                            }
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </Layout>
    );
}
