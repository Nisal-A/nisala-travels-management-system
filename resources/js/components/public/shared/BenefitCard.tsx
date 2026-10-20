import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface BenefitCardProps {
    icon: LucideIcon | React.ComponentType<{ className?: string }> | React.ReactNode;
    title: string;
    description: string;
    badge?: string;
    className?: string;
}

export function BenefitCard({
    icon,
    title,
    description,
    badge,
    className,
}: BenefitCardProps) {
    const renderIcon = () => {
        if (!icon) return null;

        if (React.isValidElement(icon)) {
            return icon;
        }

        const IconComponent = icon as React.ComponentType<{ className?: string }>;
        return <IconComponent className="h-6 w-6 text-primary" />;
    };

    return (
        <div
            className={cn(
                'group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-6 sm:p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md',
                className
            )}
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        {renderIcon()}
                    </div>
                    {badge && (
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {badge}
                        </span>
                    )}
                </div>

                <div className="space-y-2">
                    <h3 className="font-heading text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                        {title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default BenefitCard;
