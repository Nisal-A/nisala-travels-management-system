import PlaceholderPage from '@/components/PlaceholderPage';
import { Users } from 'lucide-react';

export default function CustomersIndex() {
    return (
        <PlaceholderPage
            title="Customers"
            description="Customer management — view, create, and manage customer profiles and their travel records."
            icon={Users}
            module="NT-Customers"
        />
    );
}
