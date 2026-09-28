import PlaceholderPage from '@/components/PlaceholderPage';
import { CalendarCheck } from 'lucide-react';

export default function PortalBookings() {
    return (
        <PlaceholderPage
            title="My Bookings"
            description="View your upcoming and past travel bookings. Full booking details will be available in a future release."
            icon={CalendarCheck}
            module="NT-Portal"
        />
    );
}
