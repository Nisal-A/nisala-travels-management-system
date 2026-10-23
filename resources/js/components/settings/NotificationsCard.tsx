import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { Bell, ArrowRight, Mail, MessageCircle, Smartphone, Sliders } from 'lucide-react';

interface NotificationsCardProps {
    notificationSettingsUrl: string;
}

export function NotificationsCard({ notificationSettingsUrl }: NotificationsCardProps) {
    return (
        <Card className="border shadow-sm">
            <CardHeader className="pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                        <Bell className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Notification Preferences</CardTitle>
                        <CardDescription>
                            Configure notification channels, delivery matrices, and automated alerts for travelers and team members.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                <div className="rounded-xl border bg-card p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="font-semibold text-base flex items-center gap-2">
                                <Sliders className="h-4 w-4 text-primary" />
                                Notification Matrix & Channel Controls
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Manage how alerts for bookings, payments, document submissions, and inquiry follow-ups are routed across channels.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        <Badge variant="outline" className="gap-1.5 py-1 px-3 bg-muted/40">
                            <Mail className="h-3.5 w-3.5 text-blue-500" />
                            Email Notifications
                        </Badge>
                        <Badge variant="outline" className="gap-1.5 py-1 px-3 bg-muted/40">
                            <Bell className="h-3.5 w-3.5 text-amber-500" />
                            In-App Alerts
                        </Badge>
                        <Badge variant="outline" className="gap-1.5 py-1 px-3 bg-muted/40">
                            <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                            WhatsApp Alerts
                        </Badge>
                        <Badge variant="outline" className="gap-1.5 py-1 px-3 bg-muted/40">
                            <Smartphone className="h-3.5 w-3.5 text-indigo-500" />
                            SMS Gateway
                        </Badge>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t bg-muted/20 px-6 py-4">
                <span className="text-xs text-muted-foreground">
                    Direct access to the notification settings matrix
                </span>
                <Button asChild className="gap-2 shadow-sm">
                    <Link href={notificationSettingsUrl}>
                        Configure Notifications
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
