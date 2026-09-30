import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

export interface ErrorStateProps {
  icon: LucideIcon
  title: string
  description: string
  retryLabel?: string
  onRetry?: () => void
  className?: string
}

/**
 * ErrorState is used for failed data fetches or unexpected errors.
 * 
 * @example
 * <ErrorState icon={AlertTriangle} title="Failed to load" description="Please try again." onRetry={fetchData} />
 */
export function ErrorState({
  icon: Icon,
  title,
  description,
  retryLabel = "Retry",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center animate-in fade-in-50 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-destructive">{title}</h3>
      <p className="mt-2 mb-6 max-w-sm text-sm text-destructive/80">
        {description}
      </p>
      {onRetry && (
        <Button variant="destructive" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
