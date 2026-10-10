import React from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

export type LogoVariant = 'full' | 'mark' | 'wordmark' | 'mono';
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
export type LogoTheme = 'auto' | 'light' | 'dark';

export interface LogoProps {
    variant?: LogoVariant;
    size?: LogoSize;
    theme?: LogoTheme;
    className?: string;
    href?: string;
    isDecorative?: boolean;
}

const sizeClasses: Record<LogoSize, string> = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16',
};

export function Logo({
    variant = 'full',
    size = 'md',
    theme = 'auto',
    className,
    href,
    isDecorative = false,
}: LogoProps) {
    const altText = isDecorative ? "" : t('Nisala Travels');
    
    // Determine which image files to load
    // Assuming logos are located in /brand/ with .svg extension
    let lightSrc = `/brand/logo-${variant}.svg`;
    let darkSrc = `/brand/logo-${variant}.svg`; // default fallback

    if (variant === 'full') {
        darkSrc = '/brand/logo-full-light.svg';
    } else if (variant === 'mono') {
        lightSrc = '/brand/logo-mono-black.svg';
        darkSrc = '/brand/logo-mono-gold.svg';
    }

    const imageClassName = "object-contain w-auto h-full max-w-full";

    const renderImages = () => {
        if (theme === 'light') {
            return <img src={lightSrc} alt={altText} className={imageClassName} />;
        }
        if (theme === 'dark') {
            return <img src={darkSrc} alt={altText} className={imageClassName} />;
        }
        
        // Auto theme: show/hide based on .dark class via tailwind
        return (
            <>
                <img src={lightSrc} alt={altText} className={cn(imageClassName, "dark:hidden")} />
                <img src={darkSrc} alt={altText} className={cn(imageClassName, "hidden dark:block")} />
            </>
        );
    };

    const containerClasses = cn(
        "inline-flex items-center shrink-0",
        sizeClasses[size],
        className
    );

    if (href) {
        return (
            <Link 
                href={href} 
                className={cn(containerClasses, "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm transition-opacity hover:opacity-90")}
                aria-label={isDecorative ? t('Nisala Travels') : undefined}
            >
                {renderImages()}
            </Link>
        );
    }

    return (
        <div className={containerClasses}>
            {renderImages()}
        </div>
    );
}
