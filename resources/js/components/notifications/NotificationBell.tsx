import { useEffect, useState, useCallback } from 'react';
import { Bell, Calendar, CreditCard, FileText, UserPlus, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button, buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import type { PageProps } from '@/types';

export interface NotificationData {
    id: string;
    type: string;
    data: Record<string, unknown>;
    read_at: string | null;
    created_at: string;
}

export const getNotificationIcon = (type: string) => {
    if (type.includes('Booking') || type.includes('Trip')) return <Calendar className="size-4 text-info" />;
    if (type.includes('Payment')) return <CreditCard className="size-4 text-success" />;
    if (type.includes('Document')) return <FileText className="size-4 text-warning" />;
    if (type.includes('Inquiry')) return <UserPlus className="size-4 text-primary" />;
    return <Info className="size-4 text-muted-foreground" />;
};

export const NotificationBell = ({ isCustomer = false }: { isCustomer?: boolean }) => {
    const { auth } = usePage<PageProps>().props;
    const initialCount = auth?.unreadNotificationsCount || 0;

    const [unreadCount, setUnreadCount] = useState<number>(initialCount);
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const apiPrefix = isCustomer ? '/portal/notifications' : '/admin/notifications';

    const fetchRecent = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${apiPrefix}/recent`);
            setNotifications(res.data.notifications);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await axios.get(`${apiPrefix}/unread-count`);
            const newCount = res.data.count;
            setUnreadCount(newCount);
        } catch (error) {
            console.error('Failed to fetch unread count', error);
        }
    }, [apiPrefix]);

    useEffect(() => {
        setUnreadCount(initialCount);
    }, [initialCount]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchUnreadCount();
            }
        }, 30000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchUnreadCount();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchUnreadCount]);

    useEffect(() => {
        if (isOpen) {
            fetchRecent();
        }
    }, [isOpen]);

    const markAsRead = async (id: string, url?: string) => {
        try {
            await axios.patch(`${apiPrefix}/${id}/mark-as-read`);
            setUnreadCount((prev) => Math.max(0, prev - 1));
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)),
            );

            if (url) {
                setIsOpen(false);
                router.visit(url);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post(`${apiPrefix}/mark-all-as-read`);
            setUnreadCount(0);
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })),
            );
        } catch (e) {
            console.error(e);
        }
    };

    const notificationsUrl = isCustomer ? '/portal/notifications' : '/notifications';

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger
                render={
                    <button
                        type="button"
                        className="relative flex items-center justify-center size-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 ring-ring cursor-pointer"
                        aria-label={`Notifications, ${unreadCount} unread`}
                    >
                        <Bell className="size-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive ring-2 ring-card" />
                        )}
                        <span className="sr-only" aria-live="polite">
                            {unreadCount} unread notifications
                        </span>
                    </button>
                }
            />
            <PopoverContent className="w-80 sm:w-96 p-0 bg-card border-border shadow-md" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            className="h-auto text-xs p-0 text-primary hover:underline font-medium cursor-pointer"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                <ScrollArea className="max-h-[400px]">
                    {loading && notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            <Bell className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                            You're all caught up!
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-border">
                            {notifications.map((notification) => {
                                const isUnread = !notification.read_at;
                                const data = (notification.data || {}) as Record<string, unknown>;
                                const title = typeof data.title === 'string' ? data.title : typeof data.message === 'string' ? data.message : 'Notification';
                                const body = typeof data.body === 'string' ? data.body : '';
                                const targetUrl = typeof data.url === 'string' ? data.url : undefined;

                                return (
                                    <button
                                        type="button"
                                        key={notification.id}
                                        onClick={() => markAsRead(notification.id, targetUrl)}
                                        className={`flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors cursor-pointer ${
                                            isUnread ? 'bg-primary/5' : ''
                                        }`}
                                    >
                                        <div className="mt-1 bg-muted p-2 rounded-full border border-border shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 space-y-1 overflow-hidden">
                                            <p
                                                className={`text-sm leading-tight truncate ${
                                                    isUnread ? 'font-semibold text-foreground' : 'text-muted-foreground font-medium'
                                                }`}
                                            >
                                                {title}
                                            </p>
                                            {body && (
                                                <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                                                    {body}
                                                </p>
                                            )}
                                            <p className="text-[10px] text-muted-foreground/70 font-medium">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {isUnread && (
                                            <div className="size-2 rounded-full bg-primary mt-2 shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-2 border-t border-border flex flex-col gap-1 bg-card">
                    <Link
                        href={notificationsUrl}
                        onClick={() => setIsOpen(false)}
                        className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'w-full text-xs text-muted-foreground justify-center' })}
                    >
                        View all notifications
                    </Link>
                    <Link
                        href={isCustomer ? '/portal/settings/notifications' : '/settings/notifications'}
                        onClick={() => setIsOpen(false)}
                        className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'w-full text-xs text-muted-foreground justify-center' })}
                    >
                        Notification Settings
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
};
