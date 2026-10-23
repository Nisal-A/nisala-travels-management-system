import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import TourPackageForm, { TourPackageData, DestinationOption, TierConfig } from './Form';

interface EditProps {
    tour: TourPackageData;
    destinations: DestinationOption[];
    tiers: Record<string, TierConfig>;
    allowed_by_destination: Record<string, string[]>;
}

export default function Edit({ tour, destinations, tiers, allowed_by_destination }: EditProps) {
    return (
        <AppLayout
            title={`Edit ${tour.package_name}`}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Tour Packages', href: route('tours.index') },
                { label: `Edit ${tour.package_name}` },
            ]}
        >
            <Head title={`Edit ${tour.package_name}`} />
            <div className="py-2">
                <TourPackageForm
                    tour={tour}
                    destinations={destinations}
                    tiers={tiers}
                    allowed_by_destination={allowed_by_destination}
                    isEditing={true}
                />
            </div>
        </AppLayout>
    );
}
