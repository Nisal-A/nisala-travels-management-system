import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

/**
 * EmptyState is displayed when a list, table, or section has no data.
 * 
 * @example
 * <EmptyState icon={Inbox} title="No bookings yet" description="Start by creating a new booking." />
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 mb-6 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
