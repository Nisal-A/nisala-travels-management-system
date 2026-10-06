import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

interface RevealProps {
    children: ReactNode;
    width?: 'fit-content' | '100%';
    delay?: number;
    className?: string;
    /** Distance in px to fade-up from. Default 20. */
    distance?: number;
}

export function Reveal({
    children,
    width = '100%',
    delay = 0,
    className = '',
    distance = 20,
}: RevealProps) {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
        return (
            <div style={{ width }} className={className}>
                {children}
            </div>
        );
    }

    return (
        <motion.div
            style={{ width }}
            className={className}
            variants={{
                hidden: { opacity: 0, y: distance },
                visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.25, 0.1, 0.25, 1],
            }}
        >
            {children}
        </motion.div>
    );
}
