import React from 'react';
import { cn } from '@/lib/utils';
import { Compass, Globe, Image as ImageIcon } from 'lucide-react';

export interface MediaPlaceholderProps {
    title?: string;
    aspectRatio?: 'video' | 'square' | 'portrait' | 'wide' | 'auto';
    className?: string;
    label?: string;
    icon?: 'compass' | 'globe' | 'image';
}

export function MediaPlaceholder({
    title,
    aspectRatio = 'video',
    className,
    label = 'Verified photography coming soon',
    icon = 'compass',
}: MediaPlaceholderProps) {
    const aspectClass = {
        video: 'aspect-video',
        square: 'aspect-square',
        portrait: 'aspect-[3/4]',
        wide: 'aspect-[21/9]',
        auto: '',
    }[aspectRatio];

    const IconComponent = {
        compass: Compass,
        globe: Globe,
        image: ImageIcon,
    }[icon];

    return (
        <div
            className={cn(
                'relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-muted to-primary/5 flex flex-col items-center justify-center p-6 text-center select-none border border-border/50',
                aspectClass,
                className
            )}
            role="img"
            aria-label={title ? `${title} preview placeholder` : label}
        >
            {/* Subtle decorative background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#026E9F_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

            <div className="relative z-10 flex flex-col items-center gap-2 max-w-xs">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                    <IconComponent className="h-5 w-5" />
                </div>
                {title && (
                    <span className="font-heading font-semibold text-xs sm:text-sm text-foreground line-clamp-1">
                        {title}
                    </span>
                )}
                <span className="text-[11px] text-muted-foreground font-medium">
                    {label}
                </span>
            </div>
        </div>
    );
}

export default MediaPlaceholder;
