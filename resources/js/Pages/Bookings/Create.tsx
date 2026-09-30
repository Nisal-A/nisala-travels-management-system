import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import BookingForm from './Form';

import { Customer, TourPackage } from '@/types';

interface Props {
    customers: Customer[];
    packages: TourPackage[];
    travelerTypes: string[];
}

export default function Create({ customers, packages, travelerTypes }: Props) {
    return (
        <AppLayout>
            <Head title="Create Booking" />
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Create Booking</h1>
                <p className="text-muted-foreground mt-1">Add a new booking to the system.</p>
            </div>
            
            <BookingForm 
                customers={customers} 
                packages={packages} 
                travelerTypes={travelerTypes} 
                isEditing={false} 
            />
        </AppLayout>
    );
}
