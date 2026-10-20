import React from 'react';
import SectionHeading from '@/components/public/shared/SectionHeading';
import BenefitCard from '@/components/public/shared/BenefitCard';
import { whyChooseItems } from '@/content/home';
import { Compass, ReceiptText, Headphones, SlidersHorizontal } from 'lucide-react';

const iconMap = {
    Compass,
    ReceiptText,
    Headphones,
    SlidersHorizontal,
};

export function WhyChooseCards() {
    return (
        <section className="py-14 sm:py-20 bg-background border-t border-border/40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    badge="Why Choose Nisala Travels"
                    title="Travel Designed Around Care and Clarity"
                    description="We believe planning a holiday should be straightforward, honest, and tailored to the kind of journey you envision."
                    align="center"
                    headingLevel="h2"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {whyChooseItems.map((item) => {
                        const IconComponent =
                            iconMap[item.icon as keyof typeof iconMap] || Compass;

                        return (
                            <BenefitCard
                                key={item.id}
                                icon={IconComponent}
                                title={item.title}
                                description={item.description}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default WhyChooseCards;
