import { Link } from '@inertiajs/react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Fragment } from 'react';

export interface BreadcrumbItemProps {
    label: string;
    href?: string;
}

export interface BreadcrumbsProps {
    items: BreadcrumbItemProps[];
}

/**
 * Breadcrumbs renders an accessible trail using shadcn/ui.
 *
 * @example
 * <Breadcrumbs items={[{label: "Home", href: "/"}, {label: "Users"}]} />
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
    if (!items || items.length === 0) return null;

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <Fragment key={index}>
                            <BreadcrumbItem>
                                {isLast || !item.href ? (
                                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink render={<Link href={item.href}>{item.label}</Link>} />
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
