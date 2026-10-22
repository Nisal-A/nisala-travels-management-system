import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import DestinationForm from './Form';

export default function Create() {
    return (
        <AppLayout
            title="Create Destination"
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Destinations', href: route('destinations.index') },
                { label: 'New Destination' },
            ]}
        >
            <Head title="Create Destination" />
            <div className="py-2">
                <DestinationForm />
            </div>
        </AppLayout>
    );
}
