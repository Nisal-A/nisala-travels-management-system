import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeadingProps {
    badge?: string;
    title: string;
    description?: string;
    align?: 'left' | 'center';
    className?: string;
    headingLevel?: 'h2' | 'h3';
}

export function SectionHeading({
    badge,
    title,
    description,
    align = 'center',
    className,
    headingLevel = 'h2',
}: SectionHeadingProps) {
    const HeadingTag = headingLevel;
    const isCenter = align === 'center';

    return (
        <div
            className={cn(
                'space-y-3 mb-10 sm:mb-14',
                isCenter ? 'text-center mx-auto max-w-3xl' : 'text-left max-w-2xl',
                className
            )}
        >
            {badge && (
                <div
                    className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary uppercase tracking-wider',
                        isCenter ? 'mx-auto' : ''
                    )}
                >
                    <span>{badge}</span>
                </div>
            )}

            <HeadingTag
                className={cn(
                    'font-heading font-extrabold tracking-tight text-foreground',
                    headingLevel === 'h2'
                        ? 'text-2xl sm:text-3xl lg:text-4xl'
                        : 'text-xl sm:text-2xl lg:text-3xl'
                )}
            >
                {title}
            </HeadingTag>

            {description && (
                <p
                    className={cn(
                        'text-muted-foreground text-sm sm:text-base leading-relaxed',
                        isCenter ? 'mx-auto max-w-2xl' : ''
                    )}
                >
                    {description}
                </p>
            )}
        </div>
    );
}

export default SectionHeading;
