import { Compass, MapPin, FileText, Headphones, Layers } from 'lucide-react';
import { Reveal } from '@/components/common/Reveal';

const features = [
    {
        title: "Personalised Travel Planning",
        // [DRAFT: needs owner approval]
        description: "We tailor every aspect of your journey to match your unique preferences and travel style.",
        icon: Compass
    },
    {
        title: "Carefully Organised Tours",
        // [DRAFT: needs owner approval]
        description: "From accommodations to daily itineraries, we ensure a seamless and hassle-free experience.",
        icon: MapPin
    },
    {
        title: "Documentation Assistance",
        // [DRAFT: needs owner approval]
        description: "Expert guidance with visas, tickets, and all necessary paperwork for a smooth departure.",
        icon: FileText
    },
    {
        title: "Dedicated Customer Support",
        // [DRAFT: needs owner approval]
        description: "Our team is available around the clock to assist you before, during, and after your trip.",
        icon: Headphones
    },
    {
        title: "Flexible Package Choices",
        // [DRAFT: needs owner approval]
        description: "Choose from a wide variety of tours and customize them to fit your exact budget and timeline.",
        icon: Layers
    }
];

export function WhyChooseUsSection() {
    return (
        <section className="py-24 md:py-32 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <Reveal>
                        <p className="text-sm font-medium tracking-[0.15em] uppercase text-accent mb-2">The Nisala Difference</p>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-6">
                            Why Choose Us
                        </h2>
                        {/* [DRAFT: needs owner approval] */}
                        <p className="text-lg text-neutral-600 leading-relaxed">
                            We believe travel should be inspiring and effortless. Here is how we make your dream vacations a reality.
                        </p>
                    </Reveal>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8">
                    {features.map((feature, idx) => (
                        <Reveal key={feature.title} delay={idx * 0.1}>
                            <div className="p-8 rounded-2xl bg-neutral-50 border border-neutral-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col">
                                <div className="w-14 h-14 rounded-full bg-primary/5 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-3 font-serif">
                                    {feature.title}
                                </h3>
                                <p className="text-neutral-600 leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
