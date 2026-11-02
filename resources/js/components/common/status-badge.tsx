import { CheckCircle, Clock, AlertCircle, XCircle, FileWarning, HelpCircle, AlertTriangle } from 'lucide-react';

export type StatusBadgeProps = {
    type?: 'booking' | 'payment' | 'document' | 'tour' | 'alert' | string;
    status: string;
    className?: string;
};

/**
 * StatusBadge displays a consistently styled badge for domain states.
 *
 * @example
 * <StatusBadge type="booking" status="Confirmed" />
 * <StatusBadge status="Limited Seats" />
 */
export function StatusBadge({ type, status, className = '' }: StatusBadgeProps) {
    let colorClass = 'bg-muted/50 text-muted-foreground border-border';
    let Icon = HelpCircle;

    const normalizedStatus = status ? status.trim() : '';

    // Tour alert statuses
    if (normalizedStatus === 'Starting Soon') {
        colorClass = 'bg-warning/10 text-warning border-warning/20';
        Icon = Clock;
    } else if (normalizedStatus === 'Limited Seats') {
        colorClass = 'bg-destructive/10 text-destructive border-destructive/20';
        Icon = AlertCircle;
    } else if (normalizedStatus === 'Sold Out') {
        colorClass = 'bg-muted/50 text-muted-foreground border-border';
        Icon = XCircle;
    } else if (normalizedStatus === 'Available') {
        colorClass = 'bg-success/10 text-success border-success/20';
        Icon = CheckCircle;
    } else if (
        type === 'booking' ||
        (!type && ['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(normalizedStatus))
    ) {
        switch (normalizedStatus.toLowerCase()) {
            case 'pending':
                colorClass = 'bg-warning/10 text-warning border-warning/20';
                Icon = Clock;
                break;
            case 'confirmed':
                colorClass = 'bg-success/10 text-success border-success/20';
                Icon = CheckCircle;
                break;
            case 'cancelled':
                colorClass = 'bg-destructive/10 text-destructive border-destructive/20';
                Icon = XCircle;
                break;
            case 'completed':
                colorClass = 'bg-info/10 text-info border-info/20';
                Icon = CheckCircle;
                break;
        }
    } else if (
        type === 'payment' ||
        (!type && ['Paid', 'Unpaid', 'Partial', 'Verified', 'Failed', 'Refunded'].includes(normalizedStatus))
    ) {
        switch (normalizedStatus.toLowerCase()) {
            case 'pending':
            case 'unpaid':
            case 'partial':
                colorClass = 'bg-warning/10 text-warning border-warning/20';
                Icon = Clock;
                break;
            case 'failed':
                colorClass = 'bg-destructive/10 text-destructive border-destructive/20';
                Icon = AlertCircle;
                break;
            case 'completed':
            case 'paid':
            case 'verified':
                colorClass = 'bg-success/10 text-success border-success/20';
                Icon = CheckCircle;
                break;
            case 'refunded':
                colorClass = 'bg-muted/50 text-muted-foreground border-border';
                Icon = XCircle;
                break;
        }
    } else if (
        type === 'document' ||
        (!type &&
            [
                'Pending Review',
                'Pending',
                'Verified',
                'Rejected',
                'Expired',
                'Expiring soon',
                'Expiring Soon',
                'Missing',
            ].includes(normalizedStatus))
    ) {
        switch (normalizedStatus.toLowerCase()) {
            case 'missing':
                colorClass = 'bg-destructive/10 text-destructive border-destructive/20';
                Icon = AlertTriangle;
                break;
            case 'expiring soon':
            case 'pending':
            case 'pending review':
                colorClass = 'bg-warning/10 text-warning border-warning/20';
                Icon = Clock;
                break;
            case 'verified':
                colorClass = 'bg-success/10 text-success border-success/20';
                Icon = CheckCircle;
                break;
            case 'rejected':
                colorClass = 'bg-destructive/10 text-destructive border-destructive/20';
                Icon = XCircle;
                break;
            case 'expired':
                colorClass = 'bg-muted/50 text-muted-foreground border-border';
                Icon = FileWarning;
                break;
        }
    } else if (normalizedStatus.toLowerCase() === 'mismatch' || normalizedStatus.toLowerCase().startsWith('mismatch')) {
        colorClass = 'bg-destructive/10 text-destructive border-destructive/20';
        Icon = AlertCircle;
    } else if (
        normalizedStatus.toLowerCase() === 'matched' ||
        normalizedStatus.toLowerCase() === 'reconciled' ||
        normalizedStatus.toLowerCase() === 'active'
    ) {
        colorClass = 'bg-success/10 text-success border-success/20';
        Icon = CheckCircle;
    } else if (normalizedStatus.toLowerCase() === 'inactive' || normalizedStatus.toLowerCase() === 'draft') {
        colorClass = 'bg-muted/50 text-muted-foreground border-border';
        Icon = HelpCircle;
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${colorClass} ${className}`}
        >
            <Icon className="size-3.5 shrink-0" />
            <span>{status}</span>
        </span>
    );
}
