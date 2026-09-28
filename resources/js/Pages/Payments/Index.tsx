import PlaceholderPage from '@/components/PlaceholderPage';
import { CreditCard } from 'lucide-react';

export default function PaymentsIndex() {
    return (
        <PlaceholderPage
            title="Payments"
            description="Payment management — record, track, and manage customer payments and financial transactions."
            icon={CreditCard}
            module="NT-Payments"
        />
    );
}
