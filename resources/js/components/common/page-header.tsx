import React from 'react';
import { Breadcrumbs, type BreadcrumbItemProps } from './breadcrumbs';

export interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItemProps[];
    actions?: React.ReactNode;
    className?: string;
}

/**
 * PageHeader provides a consistent page title, description, optional breadcrumbs, and right-side actions slot.
 *
 * @example
 * <PageHeader title="Bookings" description="Manage all bookings" actions={<Button>New</Button>} />
 */
export function PageHeader({ title, description, breadcrumbs, actions, className = '' }: PageHeaderProps) {
    return (
        <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5 ${className}`}>
            <div className="flex flex-col gap-1 min-w-0">
                {breadcrumbs && (
                    <div className="mb-2">
                        <Breadcrumbs items={breadcrumbs} />
                    </div>
                )}
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
    );
}
