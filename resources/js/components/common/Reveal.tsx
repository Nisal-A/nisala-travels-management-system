import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

interface RevealProps {
    children: ReactNode;
    width?: 'fit-content' | '100%';
    delay?: number;
    className?: string;
    /** Direction of motion. Default 'up'. */
    direction?: 'up' | 'down' | 'left' | 'right';
    /** Distance in px to fade in from. Default 20. */
    distance?: number;
}

export function Reveal({
    children,
    width = '100%',
    delay = 0,
    className = '',
    direction = 'up',
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

    const getInitialOffset = () => {
        switch (direction) {
            case 'down':
                return { x: 0, y: -distance };
            case 'left':
                return { x: distance, y: 0 };
            case 'right':
                return { x: -distance, y: 0 };
            case 'up':
            default:
                return { x: 0, y: distance };
        }
    };

    const offset = getInitialOffset();

    return (
        <motion.div
            style={{ width }}
            className={className}
            variants={{
                hidden: { opacity: 0, x: offset.x, y: offset.y },
                visible: { opacity: 1, x: 0, y: 0 },
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
