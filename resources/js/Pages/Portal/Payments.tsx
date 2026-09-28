import PlaceholderPage from '@/components/PlaceholderPage';
import { CreditCard } from 'lucide-react';

export default function PortalPayments() {
    return (
        <PlaceholderPage
            title="My Payments"
            description="View your payment history and outstanding balances. Full payment details will be available in a future release."
            icon={CreditCard}
            module="NT-Portal"
        />
    );
}
