import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import TourPackageForm, { DestinationOption, TierConfig } from './Form';

interface CreateProps {
    destinations: DestinationOption[];
    tiers: Record<string, TierConfig>;
    allowed_by_destination: Record<string, string[]>;
}

export default function Create({ destinations, tiers, allowed_by_destination }: CreateProps) {
    return (
        <AppLayout
            title="Create Tour Package"
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Tour Packages', href: route('tours.index') },
                { label: 'New Tour Package' },
            ]}
        >
            <Head title="Create Tour Package" />
            <div className="py-2">
                <TourPackageForm
                    destinations={destinations}
                    tiers={tiers}
                    allowed_by_destination={allowed_by_destination}
                />
            </div>
        </AppLayout>
    );
}
