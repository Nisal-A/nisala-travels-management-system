import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import DestinationForm, { DestinationData } from './Form';

interface EditProps {
    destination: DestinationData;
}

export default function Edit({ destination }: EditProps) {
    return (
        <AppLayout
            title={`Edit ${destination.city_region}`}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Destinations', href: route('destinations.index') },
                { label: `Edit ${destination.city_region}` },
            ]}
        >
            <Head title={`Edit ${destination.city_region}`} />
            <div className="py-2">
                <DestinationForm destination={destination} isEditing={true} />
            </div>
        </AppLayout>
    );
}
