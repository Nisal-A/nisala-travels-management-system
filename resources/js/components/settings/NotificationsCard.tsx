import { buttonVariants } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Bell, ArrowRight, Mail, MessageCircle, Smartphone } from 'lucide-react';
import { SettingsPanel } from './SettingsPanel';

interface NotificationsCardProps {
    notificationSettingsUrl: string;
}

const CHANNELS = [
    { label: 'Email Notifications', icon: Mail },
    { label: 'In-App Alerts', icon: Bell },
    { label: 'WhatsApp Alerts', icon: MessageCircle },
    { label: 'SMS Gateway', icon: Smartphone },
];

export function NotificationsCard({ notificationSettingsUrl }: NotificationsCardProps) {
    return (
        <SettingsPanel
            title="Notification Preferences"
            description="Configure notification channels, delivery matrices and automated alerts for travelers and team members."
            icon={Bell}
        >
            <h3 className="text-base font-bold mb-4 text-foreground">Notification matrix &amp; channel controls</h3>
            <p className="text-sm text-muted-foreground">
                Manage how alerts for bookings, payments, document submissions and inquiry follow-ups are routed across channels.
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
                {CHANNELS.map(({ label, icon: Icon }) => (
                    <span
                        key={label}
                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground"
                    >
                        <Icon className="size-3.5" />
                        {label}
                    </span>
                ))}
            </div>

            <div className="my-8 border-t" />

            <Link
                href={notificationSettingsUrl}
                className={buttonVariants({ className: 'h-9 px-4 gap-2 font-semibold' })}
            >
                Configure notifications
                <ArrowRight className="size-4" />
            </Link>
        </SettingsPanel>
    );
}
