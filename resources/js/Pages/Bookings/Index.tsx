import PlaceholderPage from '@/components/PlaceholderPage';
import { CalendarCheck } from 'lucide-react';

export default function BookingsIndex() {
    return (
        <PlaceholderPage
            title="Bookings"
            description="Booking management — create, view, and manage customer bookings and reservations."
            icon={CalendarCheck}
            module="NT-Bookings"
        />
    );
}
