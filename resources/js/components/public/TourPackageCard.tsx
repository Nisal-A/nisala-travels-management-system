import { Link } from '@inertiajs/react';
import { Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/common/Reveal';

export interface TourPackageCardProps {
    tour: {
        id: number;
        slug?: string;
        package_name: string;
        short_description?: string;
        hero_image?: string;
        duration_days?: number;
        price_from?: number;
        currency?: string;
        destination?: string;
    };
    level?: string;
}

export function TourPackageCard({ tour, level }: TourPackageCardProps) {
    const formattedPrice = tour.price_from ? `${tour.currency || 'LKR'} ${tour.price_from.toLocaleString()}` : null;
    const linkHref = `/our-tours/${tour.slug || tour.id}`;

    return (
        <Reveal>
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-neutral-100 relative group-hover:-translate-y-1">
                {level && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-accent/90 backdrop-blur-sm text-accent-foreground text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-widest uppercase">
                            {level}
                        </span>
                    </div>
                )}
                
                <Link href={linkHref} className="block h-56 overflow-hidden bg-neutral-200 relative aspect-[4/3] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                    {tour.hero_image ? (
                        <img 
                            src={tour.hero_image} 
                            alt={tour.package_name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400">
                            [Image coming soon]
                        </div>
                    )}
                    {tour.destination && (
                        <div className="absolute bottom-4 left-4 z-10">
                            <span className="bg-white/95 backdrop-blur-sm text-primary text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                {tour.destination}
                            </span>
                        </div>
                    )}
                </Link>
                
                <div className="p-6 flex-grow flex flex-col">
                    <Link href={linkHref} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md">
                        <h3 className="text-xl font-serif font-bold text-primary mb-2 line-clamp-2 transition-colors">
                            {tour.package_name}
                        </h3>
                    </Link>
                    
                    {tour.short_description ? (
                        <p className="text-neutral-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                            {tour.short_description}
                        </p>
                    ) : (
                        <p className="text-neutral-400 italic text-sm mb-4">
                            [Details coming soon]
                        </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                        {tour.duration_days ? (
                            <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100">
                                <Clock className="w-4 h-4 text-primary" /> {tour.duration_days} Days
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100 italic">
                                [Duration TBA]
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-5 border-t border-neutral-100">
                        <div>
                            {formattedPrice ? (
                                <>
                                    <span className="text-xs text-neutral-500 font-medium block mb-0.5">From per person</span>
                                    <span className="text-xl font-black text-primary">{formattedPrice}</span>
                                </>
                            ) : (
                                <span className="text-sm font-medium text-neutral-400 italic">
                                    [Price coming soon]
                                </span>
                            )}
                        </div>
                        <div className="shrink-0 ml-4">
                            <Button
                                render={<Link href={linkHref} />}
                                variant="public-accent"
                                size="public-sm"
                                className="rounded-full px-4 h-10 shadow-accent/20"
                            >
                                Explore <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Reveal>
    );
}

export function TourPackageCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl h-[400px] animate-pulse border border-neutral-100 p-4 flex flex-col justify-end relative overflow-hidden">
            <div className="absolute inset-0 bg-neutral-100" />
            <div className="relative z-10 bg-white p-4 rounded-xl mt-auto shadow-sm">
                <div className="h-4 bg-neutral-200 rounded w-1/3 mb-3" />
                <div className="h-6 bg-neutral-200 rounded w-3/4 mb-4" />
                <div className="flex justify-between items-center border-t border-neutral-100 pt-4">
                    <div className="h-5 bg-neutral-200 rounded w-1/2" />
                    <div className="h-8 bg-neutral-200 rounded-full w-20" />
                </div>
            </div>
        </div>
    );
}
