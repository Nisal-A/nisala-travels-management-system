import React from "react"
import { Breadcrumbs, type BreadcrumbItemProps } from "./breadcrumbs"

export interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItemProps[]
  actions?: React.ReactNode
}

/**
 * PageHeader provides a consistent page title, breadcrumbs, and actions area.
 * 
 * @example
 * <PageHeader title="Bookings" description="Manage all bookings" />
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-6 md:flex-row md:items-start md:justify-between">
      <div className="flex flex-col gap-1">
        {breadcrumbs && (
          <div className="mb-2">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
