import { useState, useEffect } from 'react';

/**
 * Hook that listens for matches to a CSS media query.
 * Returns true if the document matches the given query.
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQueryList = window.matchMedia(query);
        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Set initial value
        setMatches(mediaQueryList.matches);

        mediaQueryList.addEventListener('change', listener);
        return () => mediaQueryList.removeEventListener('change', listener);
    }, [query]);

    return matches;
}
