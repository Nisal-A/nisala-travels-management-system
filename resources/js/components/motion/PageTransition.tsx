import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * PageTransition component wrapping public page content.
 * Animates from opacity: 0, y: 12 to opacity: 1, y: 0 over 0.35s with easeOut.
 * When useReducedMotion is true, renders final state immediately with no movement.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export default PageTransition;
