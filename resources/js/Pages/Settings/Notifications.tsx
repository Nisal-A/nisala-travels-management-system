import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { NotificationSettingsMatrix } from '@/components/notifications/NotificationSettingsMatrix';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function NotificationsSettingsPage({ categories, preferences, smsEnabled, hasPhone }: any) {
    return (
        <AppLayout title="Notification Settings">
            <Head title="Notification Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Manage how you receive notifications. Some notifications are mandatory for important updates.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <NotificationSettingsMatrix 
                                categories={categories} 
                                preferences={preferences} 
                                smsEnabled={smsEnabled} 
                                hasPhone={hasPhone} 
                                updateUrl={route('settings.notifications.update')} 
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
