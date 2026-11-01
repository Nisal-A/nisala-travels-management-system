import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { NotificationSettingsMatrix } from '@/components/notifications/NotificationSettingsMatrix';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/common';

interface Category {
    label: string;
    types: Record<string, {
        label: string;
        description: string;
        audience: string[];
        channels: string[];
        default_enabled: string[];
        mandatory: boolean;
    }>;
}

interface NotificationsSettingsPageProps {
    categories: Record<string, Category>;
    preferences: Record<string, Record<string, boolean>>;
    smsEnabled: boolean;
    hasPhone: boolean;
}

export default function NotificationsSettingsPage({
    categories,
    preferences,
    smsEnabled,
    hasPhone,
}: NotificationsSettingsPageProps) {
    return (
        <AppLayout title="Notification Settings">
            <Head title="Notification Settings" />

            <div className="space-y-6">
                <PageHeader
                    title="Notification Settings"
                    description="Manage how you receive notifications across channels. Some notifications are mandatory for important operational updates."
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>
                            Configure notification channels. Some notifications are mandatory for important updates.
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
        </AppLayout>
    );
}
