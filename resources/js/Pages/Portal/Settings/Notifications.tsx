import React from 'react';
import CustomerPortalLayout from '@/components/layouts/CustomerPortalLayout';
import { Head, Link } from '@inertiajs/react';
import { NotificationSettingsMatrix } from '@/components/notifications/NotificationSettingsMatrix';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default function NotificationsSettingsPage({ categories, preferences, smsEnabled, hasPhone }: any) {
    return (
        <CustomerPortalLayout title="Notification Settings">
            <Head title="Notification Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {!hasPhone && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md flex items-center justify-between">
                            <div>
                                <h3 className="text-yellow-800 dark:text-yellow-200 font-medium">Missing Phone Number</h3>
                                <p className="text-yellow-700 dark:text-yellow-300 text-sm">Add a phone number to enable SMS and WhatsApp notifications.</p>
                            </div>
                            <Link href={route('portal.profile.edit')} className={buttonVariants({ variant: "outline", size: "sm" })}>
                                Update Profile <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                    )}
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Manage how you receive notifications from Nisala Travels.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <NotificationSettingsMatrix 
                                categories={categories} 
                                preferences={preferences} 
                                smsEnabled={smsEnabled} 
                                hasPhone={hasPhone} 
                                updateUrl={route('portal.settings.notifications.update')} 
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CustomerPortalLayout>
    );
}
