import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Reveal } from '@/components/common/Reveal';
import { DestinationCard } from '@/components/public/DestinationCard';

export default function DestinationsIndex() {
    const [destinations, setDestinations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/public/destinations').then(res => {
            if (res.data.length > 0) {
                const uniqueCountries = Array.from(new Set(res.data.map((d: any) => d.country))).filter(Boolean) as string[];
                const mapped = uniqueCountries.map(country => {
                    const dest = res.data.find((d: any) => d.country === country);
                    return {
                        name: country,
                        description: dest.description || undefined,
                        image: undefined, // No image column in DB schema
                        href: `/our-tours?destination=${encodeURIComponent(country)}`
                    };
                });
                setDestinations(mapped);
            } else {
                setDestinations([
                    {
                        name: 'Thailand',
                        description: 'Escape in Style',
                        image: '/images/thailand/phuket.jpg',
                        href: '/our-tours?destination=Thailand'
                    },
                    {
                        name: 'India',
                        description: 'Journeys Made Comfortable',
                        image: '/images/india/taj-mahal.jpg',
                        href: '/our-tours?destination=India'
                    }
                ]);
            }
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    return (
        <PublicLayout>
            <Head title="Destinations | Nisala Travels" />
            
            <div className="pt-32 pb-16 bg-neutral-900 text-center px-4">
                <div className="container mx-auto max-w-4xl">
                    <Reveal>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6">
                            Explore the World
                        </h1>
                        <p className="text-lg md:text-xl text-white/80 font-serif max-w-2xl mx-auto leading-relaxed">
                            Discover breathtaking destinations curated for your perfect getaway.
                        </p>
                    </Reveal>
                </div>
            </div>

            <section className="py-16 md:py-24 bg-background min-h-[50vh]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse bg-neutral-200 aspect-[4/5] sm:aspect-square md:aspect-[3/4] rounded-2xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-center">
                            {destinations.map((dest, idx) => (
                                <Reveal key={dest.name} delay={idx * 100}>
                                    <DestinationCard
                                        name={dest.name}
                                        description={dest.description}
                                        image={dest.image}
                                        href={dest.href}
                                    />
                                </Reveal>
                            ))}
                        </div>
                    )}
                    
                    {!loading && destinations.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-neutral-100">
                            <p className="text-neutral-500 italic">No destinations available at the moment.</p>
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
