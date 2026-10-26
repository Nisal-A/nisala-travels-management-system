import React, { useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export interface FadeInImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    width?: number | string;
    height?: number | string;
    loading?: 'lazy' | 'eager';
}

/**
 * FadeInImage wraps <img>.
 * Starts at opacity: 0, transitions to opacity: 1 over 0.4s when onLoad fires.
 * Passes through src, alt, className, width, height, loading, and additional img attributes.
 * When useReducedMotion is true, renders opacity: 1 immediately with no fade duration.
 */
export const FadeInImage = React.forwardRef<HTMLImageElement, FadeInImageProps>(
    (
        {
            src,
            alt,
            className = '',
            width,
            height,
            loading = 'lazy',
            style,
            onLoad,
            ...props
        },
        ref
    ) => {
        const shouldReduceMotion = useReducedMotion();
        const [isLoaded, setIsLoaded] = useState(false);

        const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            setIsLoaded(true);
            if (onLoad) {
                onLoad(e);
            }
        };

        const isVisible = shouldReduceMotion || isLoaded;

        return (
            <img
                ref={ref}
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading={loading}
                onLoad={handleLoad}
                style={{
                    ...style,
                    opacity: isVisible ? 1 : 0,
                    transition: shouldReduceMotion ? 'none' : 'opacity 0.4s ease-out',
                }}
                className={className}
                {...props}
            />
        );
    }
);

FadeInImage.displayName = 'FadeInImage';

export default FadeInImage;
