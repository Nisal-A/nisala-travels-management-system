import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface RevealProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

/**
 * Scroll reveal component.
 * Animates from opacity: 0, y: 24 to opacity: 1, y: 0 over 0.5s with easeOut
 * using whileInView with viewport={{ once: true, amount: 0.2 }}.
 * Accepts optional delay prop (in seconds, default 0).
 * When useReducedMotion is true, renders final state immediately with no movement.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export default Reveal;
