import React, { useEffect, useState, useCallback } from 'react';
import { Bell, Check, Calendar, CreditCard, FileText, UserPlus, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

export interface NotificationData {
    id: string;
    type: string;
    data: any;
    read_at: string | null;
    created_at: string;
}

export const getNotificationIcon = (type: string) => {
    if (type.includes('Booking') || type.includes('Trip')) return <Calendar className="h-4 w-4 text-blue-500" />;
    if (type.includes('Payment')) return <CreditCard className="h-4 w-4 text-emerald-500" />;
    if (type.includes('Document')) return <FileText className="h-4 w-4 text-orange-500" />;
    if (type.includes('Inquiry')) return <UserPlus className="h-4 w-4 text-purple-500" />;
    return <Info className="h-4 w-4 text-gray-500" />;
};

export const NotificationBell = ({ isCustomer = false }: { isCustomer?: boolean }) => {
    const { auth } = usePage().props as any;
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
            console.error("Failed to fetch notifications", error);
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
            console.error("Failed to fetch unread count", error);
        }
    }, []);

    useEffect(() => {
        setUnreadCount(initialCount);
    }, [initialCount]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchUnreadCount();
            }
        }, 30000); // 30 seconds

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
            setUnreadCount(Math.max(0, unreadCount - 1));
            setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));

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
            setNotifications(notifications.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
        } catch (e) {
            console.error(e);
        }
    };

    const notificationsUrl = isCustomer ? '/portal/notifications' : '/notifications';

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger
                render={
                    <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications, ${unreadCount} unread`}>
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                            >
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </Badge>
                        )}
                        <span className="sr-only" aria-live="polite">
                            {unreadCount} unread notifications
                        </span>
                    </Button>
                }
            />
            <PopoverContent className="w-80 sm:w-96 p-0" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto text-xs p-0 text-blue-600 hover:text-blue-800">
                            Mark all as read
                        </Button>
                    )}
                </div>

                <ScrollArea className="max-h-[400px]">
                    {loading && notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-500">
                            <Bell className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                            You're all caught up!
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map(notification => {
                                const isUnread = !notification.read_at;
                                const data = notification.data || {};

                                return (
                                    <button
                                        key={notification.id}
                                        onClick={() => markAsRead(notification.id, data.url)}
                                        className={`flex items-start gap-3 p-4 text-left border-b hover:bg-gray-50 transition-colors ${isUnread ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <div className="mt-1 bg-white p-2 rounded-full shadow-sm border">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 space-y-1 overflow-hidden">
                                            <p className={`text-sm leading-tight ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-700 font-medium'}`}>
                                                {data.title || data.message || 'Notification'}
                                            </p>
                                            <p className="text-xs text-gray-500 line-clamp-2 leading-snug">
                                                {data.body || ''}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-medium">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {isUnread && (
                                            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-2 border-t flex flex-col gap-1">
                    <Link
                        href={notificationsUrl}
                        onClick={() => setIsOpen(false)}
                        className={buttonVariants({ variant: "ghost", size: "sm", className: "w-full text-xs text-gray-500" })}
                    >
                        View all notifications
                    </Link>
                    <Link
                        href={isCustomer ? '/portal/settings/notifications' : '/settings/notifications'}
                        onClick={() => setIsOpen(false)}
                        className={buttonVariants({ variant: "ghost", size: "sm", className: "w-full text-xs text-gray-500" })}
                    >
                        Notification Settings
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
};
