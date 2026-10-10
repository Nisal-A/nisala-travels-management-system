import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export interface DestinationCardProps {
    name: string;
    description?: string;
    image?: string;
    href: string;
}

export function DestinationCard({ name, description, image, href }: DestinationCardProps) {
    return (
        <Link
            href={href}
            className="group block relative w-full aspect-[4/5] sm:aspect-square md:aspect-[3/4] overflow-hidden rounded-2xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
            <div className="absolute inset-0 bg-neutral-200">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 p-6 text-center">
                        <span className="mb-2 italic">[Image missing]</span>
                    </div>
                )}
            </div>

            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent transition-opacity duration-300" />

            {/* Hover subtle gold underline */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100" />

            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2 transition-transform duration-300 group-hover:-translate-y-1">
                    {name}
                </h3>

                {description && (
                    <p className="text-white/80 text-sm md:text-base line-clamp-2 mb-4 transition-transform duration-300 group-hover:-translate-y-1">
                        {description}
                    </p>
                )}

                <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    Explore Tours <ArrowRight className="w-4 h-4" />
                </span>
            </div>
        </Link>
    );
}
