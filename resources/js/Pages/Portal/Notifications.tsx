import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerPortalLayout from '@/components/layouts/CustomerPortalLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getNotificationIcon, NotificationData } from '@/components/notifications/NotificationBell';
import { formatDistanceToNow } from 'date-fns';
import { Check, Trash2, FilterX } from 'lucide-react';
import axios from 'axios';

interface Props {
    notifications: {
        data: NotificationData[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filter: string;
    group: string;
}

const GROUPS = ['All', 'Bookings', 'Payments', 'Documents', 'System'];

export default function PortalNotifications({ notifications, filter, group }: Props) {
    const markAsRead = (id: string) => {
        axios.patch(`/portal/notifications/${id}/mark-as-read`).then(() => {
            router.reload({ only: ['notifications'] });
        });
    };

    const markAllAsRead = () => {
        axios.post('/portal/notifications/mark-all-as-read').then(() => {
            router.reload({ only: ['notifications'] });
        });
    };

    const deleteNotification = (id: string) => {
        if (confirm('Are you sure you want to delete this notification?')) {
            axios.delete(`/portal/notifications/${id}`).then(() => {
                router.reload({ only: ['notifications'] });
            });
        }
    };

    const handleFilterChange = (value: string) => {
        router.get('/portal/notifications', { filter: value, group }, { preserveState: true });
    };

    const handleGroupChange = (value: string) => {
        router.get('/portal/notifications', { filter, group: value }, { preserveState: true });
    };

    return (
        <CustomerPortalLayout>
            <Head title="My Notifications" />

            <div className="max-w-4xl mx-auto py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <h1 className="text-2xl font-bold tracking-tight">My Notifications</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={markAllAsRead}>
                            <Check className="h-4 w-4 mr-2" />
                            Mark all as read
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg border shadow-sm flex flex-col mb-6">
                    <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 rounded-t-lg">
                        <Tabs value={filter} onValueChange={handleFilterChange} className="w-full sm:w-auto">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="unread">Unread</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="flex flex-wrap gap-2">
                            {GROUPS.map(g => (
                                <Badge 
                                    key={g} 
                                    variant={group === g ? 'default' : 'outline'}
                                    className="cursor-pointer select-none"
                                    onClick={() => handleGroupChange(g)}
                                >
                                    {g}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col">
                        {notifications.data.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
                                <FilterX className="h-12 w-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications found</h3>
                                <p>We couldn't find any notifications matching your filters.</p>
                                {(filter !== 'all' || group !== 'All') && (
                                    <Button variant="link" onClick={() => router.get('/portal/notifications')} className="mt-2">
                                        Clear filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            notifications.data.map((notification) => {
                                const isUnread = !notification.read_at;
                                const data = notification.data || {};
                                
                                return (
                                    <div key={notification.id} className={`flex items-start gap-4 p-4 border-b last:border-0 hover:bg-gray-50 transition-colors ${isUnread ? 'bg-blue-50/30' : ''}`}>
                                        <div className="mt-1 bg-white p-3 rounded-full shadow-sm border flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <h4 className={`text-base font-semibold truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {data.title || 'Notification'}
                                                </h4>
                                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {data.body}
                                            </p>
                                            
                                            <div className="flex items-center gap-3">
                                                {data.url && (
                                                    <a 
                                                        href={data.url} 
                                                        className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'h-8 text-xs' })}
                                                        onClick={(e) => {
                                                            if (isUnread) {
                                                                markAsRead(notification.id);
                                                            }
                                                        }}
                                                    >
                                                        View Details
                                                    </a>
                                                )}
                                                
                                                {isUnread && (
                                                    <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)} className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                        Mark as read
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-2 ml-4">
                                            {isUnread && <div className="w-2 h-2 rounded-full bg-blue-600 mb-2 mt-2" />}
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={() => deleteNotification(notification.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {notifications.links.map((link, i) => (
                            link.url ? (
                                <Link 
                                    key={i}
                                    href={link.url}
                                    className={buttonVariants({
                                        variant: link.active ? 'default' : 'outline',
                                        size: 'sm',
                                        className: link.label.includes('Previous') || link.label.includes('Next') ? 'hidden sm:inline-flex' : ''
                                    })}
                                    dangerouslySetInnerHTML={{ __html: link.label }} 
                                />
                            ) : (
                                <Button 
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled
                                    className={link.label.includes('Previous') || link.label.includes('Next') ? 'hidden sm:inline-flex' : ''}
                                >
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                </Button>
                            )
                        ))}
                    </div>
                )}
            </div>
        </CustomerPortalLayout>
    );
}
