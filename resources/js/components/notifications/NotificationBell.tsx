import React, { useEffect, useState } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
    id: string;
    data: {
        message: string;
        [key: string]: any;
    };
    read_at: string | null;
    created_at: string;
}

export function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUnreadCount = async () => {
        try {
            const { data } = await axios.get('/notifications/unread-count');
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Failed to fetch unread count', error);
        }
    };

    const fetchRecent = async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get('/notifications/recent');
            setNotifications(data.notifications);
        } catch (error) {
            console.error('Failed to fetch recent notifications', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            fetchRecent();
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await axios.patch(`/notifications/${id}/mark-as-read`);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id ? { ...n, read_at: new Date().toISOString() } : n
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/mark-all-as-read');
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-primary"
                            onClick={markAllAsRead}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
                
                <ScrollArea className="h-80">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                            <Bell className="mb-2 h-8 w-8 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">No recent notifications</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`flex items-start gap-4 border-b p-4 transition-colors hover:bg-muted/50 ${
                                        !notification.read_at ? 'bg-primary/5' : ''
                                    }`}
                                >
                                    <div className="flex-1 space-y-1">
                                        <p className={`text-sm ${!notification.read_at ? 'font-medium' : ''}`}>
                                            {notification.data.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(notification.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {!notification.read_at && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 shrink-0 rounded-full"
                                            onClick={() => markAsRead(notification.id)}
                                            title="Mark as read"
                                        >
                                            <Check className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                
                <div className="border-t p-2">
                    <Button asChild variant="ghost" className="w-full justify-center text-sm">
                        <Link href={route('notifications.index')}>
                            View all notifications
                        </Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
