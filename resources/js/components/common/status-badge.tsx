import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, XCircle, FileWarning, HelpCircle } from 'lucide-react';

type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | string;
type PaymentStatus = 'Pending' | 'Verified' | 'Completed' | 'Failed' | 'Unpaid' | 'Partial' | 'Paid' | 'Refunded' | string;
type DocumentStatus = 'Pending Review' | 'Verified' | 'Rejected' | 'Expired' | string;

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
export function StatusBadge({ type, status, className }: StatusBadgeProps) {
    let colorClass = 'bg-muted text-muted-foreground';
    let Icon = HelpCircle;

    const normalizedStatus = status ? status.trim() : '';

    // Tour alert statuses
    if (normalizedStatus === 'Starting Soon') {
        colorClass = 'bg-warning/20 text-warning hover:bg-warning/30 border-warning/50';
        Icon = Clock;
    } else if (normalizedStatus === 'Limited Seats') {
        colorClass = 'bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/50';
        Icon = AlertCircle;
    } else if (normalizedStatus === 'Sold Out') {
        colorClass = 'bg-muted/50 text-muted-foreground hover:bg-muted/80 border-muted';
        Icon = XCircle;
    } else if (normalizedStatus === 'Available') {
        colorClass = 'bg-success/20 text-success hover:bg-success/30 border-success/50';
        Icon = CheckCircle;
    } else if (type === 'booking' || (!type && ['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(normalizedStatus))) {
        switch (normalizedStatus.toLowerCase()) {
            case 'pending':
                colorClass = 'bg-warning/20 text-warning hover:bg-warning/30 border-warning/50';
                Icon = Clock;
                break;
            case 'confirmed':
                colorClass = 'bg-success/20 text-success hover:bg-success/30 border-success/50';
                Icon = CheckCircle;
                break;
            case 'cancelled':
                colorClass = 'bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/50';
                Icon = XCircle;
                break;
            case 'completed':
                colorClass = 'bg-info/20 text-info hover:bg-info/30 border-info/50';
                Icon = CheckCircle;
                break;
        }
    } else if (type === 'payment' || (!type && ['Paid', 'Unpaid', 'Partial', 'Verified', 'Failed', 'Refunded'].includes(normalizedStatus))) {
        switch (normalizedStatus.toLowerCase()) {
            case 'pending':
            case 'unpaid':
            case 'partial':
                colorClass = 'bg-warning/20 text-warning hover:bg-warning/30 border-warning/50';
                Icon = Clock;
                break;
            case 'failed':
                colorClass = 'bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/50';
                Icon = AlertCircle;
                break;
            case 'completed':
            case 'paid':
            case 'verified':
                colorClass = 'bg-success/20 text-success hover:bg-success/30 border-success/50';
                Icon = CheckCircle;
                break;
            case 'refunded':
                colorClass = 'bg-muted/50 text-muted-foreground hover:bg-muted/80 border-muted';
                Icon = XCircle;
                break;
        }
    } else if (type === 'document' || (!type && ['Pending Review', 'Expired', 'Rejected'].includes(normalizedStatus))) {
        switch (normalizedStatus.toLowerCase()) {
            case 'pending review':
                colorClass = 'bg-warning/20 text-warning hover:bg-warning/30 border-warning/50';
                Icon = Clock;
                break;
            case 'verified':
                colorClass = 'bg-success/20 text-success hover:bg-success/30 border-success/50';
                Icon = CheckCircle;
                break;
            case 'rejected':
                colorClass = 'bg-error/20 text-error hover:bg-error/30 border-error/50';
                Icon = XCircle;
                break;
            case 'expired':
                colorClass = 'bg-muted/50 text-muted-foreground hover:bg-muted/80 border-muted';
                Icon = FileWarning;
                break;
        }
    }

    return (
        <Badge variant="outline" className={`gap-1.5 whitespace-nowrap font-medium ${colorClass} ${className || ''}`}>
            <Icon className="h-3.5 w-3.5" />
            {status}
        </Badge>
    );
}
