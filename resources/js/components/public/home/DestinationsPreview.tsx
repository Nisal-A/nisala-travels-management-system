import React from 'react';
import { Link } from '@inertiajs/react';
import SectionHeading from '@/components/public/shared/SectionHeading';
import MediaPlaceholder from '@/components/public/shared/MediaPlaceholder';
import { Button } from '@/components/ui/button';
import { Globe, MapPin, ArrowRight } from 'lucide-react';
import type { DestinationItem } from '@/content/home';

export interface DestinationsPreviewProps {
    destinations?: DestinationItem[];
}

export function DestinationsPreview({ destinations = [] }: DestinationsPreviewProps) {
    const hasDestinations = Array.isArray(destinations) && destinations.length > 0;

    return (
        <section className="py-14 sm:py-20 bg-background border-t border-border/40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    badge="Explore Destinations"
                    title="Inspiring Places to Discover"
                    description="From vibrant heritage citadels and golden temples to tropical coastal sanctuaries across India, Thailand, and beyond."
                    align="center"
                    headingLevel="h2"
                />

                {hasDestinations ? (
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {destinations.map((dest) => (
                                <Link
                                    key={dest.slug}
                                    href="/our-destinations"
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                                >
                                    {/* Destination Image or Placeholder */}
                                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                                        {dest.hero_image_url ? (
                                            <img
                                                src={dest.hero_image_url}
                                                alt={dest.name}
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <MediaPlaceholder
                                                title={dest.name}
                                                aspectRatio="portrait"
                                                label="Destination guide"
                                                icon="globe"
                                                className="aspect-[4/3]"
                                            />
                                        )}

                                        {dest.country && (
                                            <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-foreground shadow-xs">
                                                <MapPin className="h-3 w-3 text-primary" />
                                                <span>{dest.country}</span>
                                            </div>
                                        )}

                                        {typeof dest.tour_count === 'number' && dest.tour_count > 0 && (
                                            <div className="absolute bottom-3 left-3 rounded-full bg-primary/90 text-primary-foreground px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm shadow-xs">
                                                {dest.tour_count} Tour{dest.tour_count === 1 ? '' : 's'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Destination Details */}
                                    <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-heading text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                                                {dest.name}
                                            </h3>

                                            {(dest.tagline || dest.overview) && (
                                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {dest.tagline || dest.overview}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-4 flex items-center text-xs font-semibold text-primary pt-2 border-t border-border/50">
                                            <span>Explore Destination</span>
                                            <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* View all button */}
                        <div className="text-center pt-2">
                            <Button asChild size="lg" variant="outline" className="rounded-xl px-8 font-semibold">
                                <Link href="/our-destinations">
                                    <span>Explore All Destinations</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* Helpful Empty State */
                    <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border/80 bg-card p-8 sm:p-12 text-center shadow-xs">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Globe className="h-7 w-7" />
                        </div>
                        <h3 className="font-heading text-xl font-bold tracking-tight text-foreground">
                            Destination Guides in Preparation
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                            Our destination guides and regional itineraries are currently being finalized. Contact us
                            directly to ask about any destination in Sri Lanka, India, and Southeast Asia.
                        </p>
                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Button asChild className="w-full sm:w-auto rounded-xl">
                                <Link href="/contact">
                                    <span>Ask About a Destination</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default DestinationsPreview;
