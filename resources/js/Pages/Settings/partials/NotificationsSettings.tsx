import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

export default function NotificationsSettings({ user }: { user: any }) {
    
    // Default matrix
    const defaultMatrix = {
        payment_received: { in_app: true, email: true },
        booking_confirmed: { in_app: true, email: true },
        document_rejected: { in_app: true, email: true },
        new_inquiry: { in_app: true, email: false },
        document_expiring: { in_app: true, email: true },
    };

    const preferences = user.preferences?.notifications || defaultMatrix;
    
    const { data, setData, put, processing, isDirty, reset } = useForm({
        notifications: preferences,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('settings.notifications.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('Your notification preferences have been updated.'));
            },
        });
    };

    const events = [
        { id: 'payment_received', label: 'Payment received' },
        { id: 'booking_confirmed', label: 'Booking confirmed' },
        { id: 'document_rejected', label: 'Document rejected' },
        { id: 'new_inquiry', label: 'New inquiry' },
        { id: 'document_expiring', label: 'Document expiring' },
    ];

    const toggle = (eventId: string, channel: string) => {
        const val = data.notifications[eventId]?.[channel];
        setData('notifications', {
            ...data.notifications,
            [eventId]: {
                ...data.notifications[eventId],
                [channel]: !val,
            }
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6 relative pb-20">
            <div className="mb-6">
                <h2 className="text-lg font-semibold">{t('Notification Preferences')}</h2>
                <p className="text-sm text-muted-foreground">{t('Choose how and when you want to receive system alerts.')}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('Alert Channels')}</CardTitle>
                    <CardDescription>{t('Configure which events send messages to your email or dashboard.')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-md">{t('Event')}</th>
                                    <th className="px-4 py-3 text-center">{t('In-App')}</th>
                                    <th className="px-4 py-3 text-center">{t('Email')}</th>
                                    <th className="px-4 py-3 text-center rounded-tr-md">
                                        {t('WhatsApp/SMS')} <br />
                                        <span className="text-[10px] font-normal text-muted-foreground">{t('(Coming soon: Provider pending)')}</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((ev, i) => (
                                    <tr key={ev.id} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="px-4 py-4 font-medium">{t(ev.label)}</td>
                                        <td className="px-4 py-4 text-center">
                                            <Switch 
                                                checked={data.notifications[ev.id]?.in_app ?? true} 
                                                onCheckedChange={() => toggle(ev.id, 'in_app')} 
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <Switch 
                                                checked={data.notifications[ev.id]?.email ?? true} 
                                                onCheckedChange={() => toggle(ev.id, 'email')} 
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <Switch disabled checked={false} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {isDirty && (
                <div className="fixed bottom-0 left-0 right-0 md:left-64 z-40 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-t">
                    <p className="text-sm text-muted-foreground">{t('You have unsaved changes.')}</p>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={() => reset()} disabled={processing}>
                            <X className="w-4 h-4 mr-2" />
                            {t('Discard')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {t('Save changes')}
                        </Button>
                    </div>
                </div>
            )}
        </form>
    );
}
