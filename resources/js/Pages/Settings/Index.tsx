import PlaceholderPage from '@/components/PlaceholderPage';
import { Settings } from 'lucide-react';

export default function SettingsIndex() {
    return (
        <PlaceholderPage
            title="Settings"
            description="System settings — configure application preferences, roles, and system-wide options."
            icon={Settings}
            module="NT-Settings"
        />
    );
}
