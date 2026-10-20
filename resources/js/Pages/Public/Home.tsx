import React from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/components/layouts/PublicLayout';
import HeroSection from '@/components/public/home/HeroSection';
import WhyChooseCards from '@/components/public/home/WhyChooseCards';
import FeaturedPackages from '@/components/public/home/FeaturedPackages';
import DestinationsPreview from '@/components/public/home/DestinationsPreview';
import CommitmentSection from '@/components/public/home/CommitmentSection';
import FinalCta from '@/components/public/home/FinalCta';
import type { FeaturedPackage, DestinationItem } from '@/content/home';

export interface HomeProps {
    featuredPackages?: FeaturedPackage[];
    featured_packages?: FeaturedPackage[];
    destinations?: DestinationItem[];
}

export default function Home({
    featuredPackages,
    featured_packages,
    destinations,
}: HomeProps) {
    const packages = featuredPackages || featured_packages || [];
    const destinationList = destinations || [];

    return (
        <PublicLayout>
            <Head title="Handcrafted Journeys & Unforgettable Experiences" />

            {/* Homepage sections rendered in strict prompt order */}
            <div className="flex flex-col">
                {/* 1. Hero (single H1, brand-coloured panel with logo, honest notice) */}
                <HeroSection />

                {/* 2. Why Choose (four cards: guidance, pricing, support, options) */}
                <WhyChooseCards />

                {/* 3. Featured Packages (from Inertia props, with empty state) */}
                <FeaturedPackages packages={packages} />

                {/* 4. Explore Destinations (from Inertia props, with empty state) */}
                <DestinationsPreview destinations={destinationList} />

                {/* 5. Commitment (five commitments to every traveller) */}
                <CommitmentSection />

                {/* 6. Final CTA (WhatsApp link with config value and inquiry button) */}
                <FinalCta />
            </div>
        </PublicLayout>
    );
}
