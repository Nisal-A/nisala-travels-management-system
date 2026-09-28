import PlaceholderPage from '@/components/PlaceholderPage';
import { Bell } from 'lucide-react';

export default function NotificationsIndex() {
    return (
        <PlaceholderPage
            title="Notifications"
            description="Manage your system alerts and messages."
            icon={Bell}
            module="NT-Notifications"
        />
    );
}
