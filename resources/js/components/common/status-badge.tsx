import React from 'react';

export type StatusBadgeProps = {
    type?: 'booking' | 'payment' | 'document' | 'tour' | 'alert' | 'inquiry' | string;
    status: string;
    showDot?: boolean;
    className?: string;
};

type BadgeTone = 'emerald' | 'amber' | 'rose' | 'slate';

const TONE_STYLES: Record<BadgeTone, { badge: string; dot: string }> = {
    emerald: {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
        dot: 'bg-emerald-500 dark:bg-emerald-400',
    },
    amber: {
        badge: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
        dot: 'bg-amber-500 dark:bg-amber-400',
    },
    rose: {
        badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
        dot: 'bg-rose-500 dark:bg-rose-400',
    },
    slate: {
        badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/70 dark:text-slate-300 dark:border-slate-700',
        dot: 'bg-slate-500 dark:bg-slate-400',
    },
};

const EMERALD_KEYS = new Set([
    'confirmed',
    'paid',
    'verified',
    'active',
    'available',
    'completed',
    'matched',
    'reconciled',
    'approved',
    'converted',
]);

const AMBER_KEYS = new Set([
    'pending',
    'partial',
    'coming_soon',
    'coming soon',
    'unverified',
    'unpaid',
    'pending_review',
    'pending review',
    'starting_soon',
    'starting soon',
    'expiring_soon',
    'expiring soon',
    'in_progress',
    'in progress',
    'contacted',
    'follow_up',
    'follow up',
]);

const ROSE_KEYS = new Set([
    'overdue',
    'rejected',
    'cancelled',
    'canceled',
    'failed',
    'missing',
    'limited_seats',
    'limited seats',
    'mismatch',
    'lost',
]);

const SLATE_KEYS = new Set([
    'draft',
    'inactive',
    'expired',
    'refunded',
    'sold_out',
    'sold out',
    'archived',
    'closed',
]);

function resolveTone(status: string): BadgeTone {
    const key = status.trim().toLowerCase().replace(/[\s-]+/g, '_');
    const rawKey = status.trim().toLowerCase();

    if (EMERALD_KEYS.has(key) || EMERALD_KEYS.has(rawKey)) {
        return 'emerald';
    }
    if (AMBER_KEYS.has(key) || AMBER_KEYS.has(rawKey)) {
        return 'amber';
    }
    if (ROSE_KEYS.has(key) || ROSE_KEYS.has(rawKey) || rawKey.startsWith('mismatch')) {
        return 'rose';
    }
    if (SLATE_KEYS.has(key) || SLATE_KEYS.has(rawKey)) {
        return 'slate';
    }
    return 'slate';
}

/**
 * StatusBadge displays a consistently styled status pill with a subtle dot indicator.
 *
 * Standardized mappings:
 * - Emerald: `confirmed`, `paid`, `verified`, `active`
 * - Amber/Gold: `pending`, `partial`, `coming_soon`, `unverified`
 * - Rose: `overdue`, `rejected`, `cancelled`
 * - Slate: `draft`, `inactive`
 *
 * @example
 * <StatusBadge type="booking" status="Confirmed" />
 * <StatusBadge status="coming_soon" />
 */
export function StatusBadge({ status, showDot = true, className = '' }: StatusBadgeProps) {
    const normalizedStatus = status ? status.trim() : '';
    const tone = resolveTone(normalizedStatus);
    const styles = TONE_STYLES[tone];

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${styles.badge} ${className}`}
        >
            {showDot && <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${styles.dot}`} />}
            <span>{status}</span>
        </span>
    );
}
