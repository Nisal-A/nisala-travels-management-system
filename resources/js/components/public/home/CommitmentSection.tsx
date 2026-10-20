import React from 'react';
import SectionHeading from '@/components/public/shared/SectionHeading';
import BenefitCard from '@/components/public/shared/BenefitCard';
import { commitmentItems } from '@/content/home';
import {
    MessageSquareCheck,
    FileCheck2,
    HeartHandshake,
    ShieldCheck,
    Compass,
} from 'lucide-react';

const iconMap = {
    MessageSquareCheck,
    FileCheck2,
    HeartHandshake,
    ShieldCheck,
    Compass,
};

export function CommitmentSection() {
    return (
        <section className="py-14 sm:py-20 bg-muted/30 border-t border-border/40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    badge="Our Standard of Care"
                    title="Our Commitment to Every Traveller"
                    description="The foundational principles that guide every interaction, itinerary, and journey we deliver."
                    align="center"
                    headingLevel="h2"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {commitmentItems.map((item, index) => {
                        const IconComponent =
                            iconMap[item.icon as keyof typeof iconMap] || Compass;

                        return (
                            <BenefitCard
                                key={item.id}
                                icon={IconComponent}
                                title={item.title}
                                description={item.description}
                                badge={`Commitment 0${index + 1}`}
                                className={
                                    index === 4
                                        ? 'md:col-span-2 lg:col-span-1'
                                        : undefined
                                }
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default CommitmentSection;
