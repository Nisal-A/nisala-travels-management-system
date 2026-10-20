import React from 'react';
import { Link } from '@inertiajs/react';
import SectionHeading from '@/components/public/shared/SectionHeading';
import MediaPlaceholder from '@/components/public/shared/MediaPlaceholder';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, ArrowRight, Compass, Users } from 'lucide-react';
import type { FeaturedPackage } from '@/content/home';

export interface FeaturedPackagesProps {
    packages?: FeaturedPackage[];
}

export function FeaturedPackages({ packages = [] }: FeaturedPackagesProps) {
    const hasPackages = Array.isArray(packages) && packages.length > 0;

    return (
        <section className="py-14 sm:py-20 bg-muted/30 border-t border-border/40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    badge="Curated Itineraries"
                    title="Featured Tour Packages"
                    description="Carefully planned routes that balance immersive sightseeing, restful travel, and genuine local encounters."
                    align="center"
                    headingLevel="h2"
                />

                {hasPackages ? (
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {packages.map((pkg) => {
                                const nights =
                                    pkg.duration_nights ??
                                    Math.max(0, pkg.duration_days - 1);

                                return (
                                    <div
                                        key={pkg.slug}
                                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                                    >
                                        {/* Package Image or MediaPlaceholder */}
                                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                            {pkg.hero_image_url ? (
                                                <img
                                                    src={pkg.hero_image_url}
                                                    alt={pkg.title}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <MediaPlaceholder
                                                    title={pkg.title}
                                                    aspectRatio="video"
                                                    label="Verified itinerary"
                                                    icon="compass"
                                                />
                                            )}

                                            {/* Destination Badge */}
                                            {pkg.destination?.name && (
                                                <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-foreground shadow-xs">
                                                    <MapPin className="h-3 w-3 text-primary" />
                                                    <span>{pkg.destination.name}</span>
                                                </div>
                                            )}

                                            {/* Tier Badge */}
                                            {pkg.tier_label && (
                                                <div className="absolute top-3 right-3 rounded-full bg-primary/90 text-primary-foreground px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider shadow-xs">
                                                    {pkg.tier_label}
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Content */}
                                        <div className="flex flex-1 flex-col p-5 sm:p-6 space-y-4">
                                            {/* Meta tags */}
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
                                                <div className="inline-flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5 text-primary" />
                                                    <span>
                                                        {pkg.duration_days} Days / {nights} Nights
                                                    </span>
                                                </div>

                                                {pkg.group_min && pkg.group_max && (
                                                    <div className="inline-flex items-center gap-1">
                                                        <Users className="h-3.5 w-3.5 text-primary" />
                                                        <span>
                                                            {pkg.group_min}–{pkg.group_max} guests
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2 flex-1">
                                                <h3 className="font-heading text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                                                    <Link href={`/our-tours/${pkg.slug}`}>
                                                        {pkg.title}
                                                    </Link>
                                                </h3>

                                                {pkg.summary && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                                        {pkg.summary}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Price and CTA */}
                                            <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                                                <div>
                                                    <span className="block text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                                                        {pkg.price_from_label ? 'Starting from' : 'Package price'}
                                                    </span>
                                                    <span className="text-lg font-extrabold text-foreground font-heading">
                                                        {pkg.currency || 'USD'}{' '}
                                                        {Number(pkg.price).toLocaleString()}
                                                    </span>
                                                </div>

                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="ghost"
                                                    className="group/btn text-primary hover:text-primary font-semibold"
                                                >
                                                    <Link href={`/our-tours/${pkg.slug}`}>
                                                        <span>Details</span>
                                                        <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* View all button */}
                        <div className="text-center pt-2">
                            <Button asChild size="lg" variant="outline" className="rounded-xl px-8 font-semibold">
                                <Link href="/our-tours">
                                    <span>Browse All Tour Packages</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* Helpful Empty State */
                    <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border/80 bg-card p-8 sm:p-12 text-center shadow-xs">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Compass className="h-7 w-7" />
                        </div>
                        <h3 className="font-heading text-xl font-bold tracking-tight text-foreground">
                            Tour Packages Updating
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                            We are currently updating our online tour collection with fresh seasonal itineraries. Our
                            specialists can craft a completely bespoke travel plan tailored to your dates and preferences.
                        </p>
                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Button asChild className="w-full sm:w-auto rounded-xl">
                                <Link href="/contact">
                                    <span>Request a Custom Itinerary</span>
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

export default FeaturedPackages;
