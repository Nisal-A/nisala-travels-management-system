import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import BookingForm from './Form';

import { Booking, Customer, TourPackage } from '@/types';

interface Props {
    booking: Booking;
    customers: Customer[];
    packages: TourPackage[];
    travelerTypes: string[];
}

export default function Edit({ booking, customers, packages, travelerTypes }: Props) {
    return (
        <AppLayout>
            <Head title={`Edit Booking ${booking.booking_reference}`} />
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Edit Booking</h1>
                <p className="text-muted-foreground mt-1">Update details for {booking.booking_reference}</p>
            </div>
            
            <BookingForm 
                booking={booking}
                customers={customers} 
                packages={packages} 
                travelerTypes={travelerTypes} 
                isEditing={true} 
            />
        </AppLayout>
    );
}
