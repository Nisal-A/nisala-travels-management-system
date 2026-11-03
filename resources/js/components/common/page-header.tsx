import React from 'react';
import { Breadcrumbs, type BreadcrumbItemProps } from './breadcrumbs';

export interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItemProps[];
    badge?: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}

/**
 * PageHeader provides a consistent executive page title, optional status/sync badge,
 * description, breadcrumbs trail, and right-aligned actions slot.
 *
 * @example
 * <PageHeader
 *   title="Bookings"
 *   badge={<StatusBadge status="active" />}
 *   description="Manage customer reservations and tour schedules."
 *   actions={<Button>New Booking</Button>}
 * />
 */
export function PageHeader({ title, description, breadcrumbs, badge, actions, className = '' }: PageHeaderProps) {
    return (
        <div
            className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5 ${className}`}
        >
            <div className="flex flex-col gap-1 min-w-0">
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <div className="mb-1.5">
                        <Breadcrumbs items={breadcrumbs} />
                    </div>
                )}
                <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl tracking-tight font-bold text-slate-900 dark:text-white">{title}</h1>
                    {badge && <div className="inline-flex items-center shrink-0">{badge}</div>}
                </div>
                {description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2 shrink-0 sm:justify-end">{actions}</div>}
        </div>
    );
}
