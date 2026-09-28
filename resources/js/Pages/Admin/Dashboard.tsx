import PlaceholderPage from '@/components/PlaceholderPage';
import { LayoutDashboard } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <PlaceholderPage
            title="Admin Dashboard"
            description="System-wide administration and configuration dashboard. Full functionality will be available in a future release."
            icon={LayoutDashboard}
            module="NT-Admin"
        />
    );
}
