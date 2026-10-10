import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, XCircle, FileWarning, HelpCircle } from 'lucide-react';

type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
type PaymentStatus = 'Pending' | 'Verified' | 'Completed' | 'Failed' | 'Unpaid' | 'Partial' | 'Paid' | 'Refunded';
type DocumentStatus = 'Pending Review' | 'Verified' | 'Rejected' | 'Expired';
type UserStatus = 'active' | 'inactive' | 'suspended';

export type StatusBadgeProps = (
    | { type: 'booking'; status: BookingStatus }
    | { type: 'payment'; status: PaymentStatus }
    | { type: 'document'; status: DocumentStatus }
    | { type: 'user'; status: UserStatus }
) & { className?: string };

/**
 * StatusBadge displays a consistently styled badge for domain states.
 *
 * @example
 * <StatusBadge type="booking" status="Confirmed" />
 */
export function StatusBadge({ type, status, className }: StatusBadgeProps) {
    let colorClass = 'bg-muted text-muted-foreground';
    let Icon = HelpCircle;

    if (type === 'booking') {
        switch (status) {
            case 'Pending':
                colorClass = 'bg-warning/20 text-warning hover:bg-warning/30 border-warning/50';
                Icon = Clock;
                break;
            case 'Confirmed':
                colorClass = 'bg-success/20 text-success hover:bg-success/30 border-success/50';
                Icon = CheckCircle;
                break;
            case 'Cancelled':
                colorClass = 'bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/50';
                Icon = XCircle;
                break;
            case 'Completed':
                colorClass = 'bg-info/20 text-info hover:bg-info/30 border-info/50';
                Icon = CheckCircle;
                break;
        }
    } else if (type === 'payment') {
        switch (status as any) {
            case 'Pending':
            case 'Unpaid':
                colorClass = 'bg-warning/20 text-warning hover:bg-warning/30 border-warning/50';
                Icon = Clock;
                break;
            case 'Failed':
                colorClass = 'bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/50';
                Icon = AlertCircle;
                break;
            case 'Completed':
            case 'Paid':
            case 'Verified':
                colorClass = 'bg-success/20 text-success hover:bg-success/30 border-success/50';
                Icon = CheckCircle;
                break;
            case 'Refunded':
                colorClass = 'bg-muted/50 text-muted-foreground hover:bg-muted/80 border-muted';
                Icon = XCircle;
                break;
        }
    } else if (type === 'document') {
        switch (status) {
            case 'Pending Review':
                colorClass = 'bg-warning/20 text-warning hover:bg-warning/30 border-warning/50';
                Icon = Clock;
                break;
            case 'Verified':
                colorClass = 'bg-success/20 text-success hover:bg-success/30 border-success/50';
                Icon = CheckCircle;
                break;
            case 'Rejected':
                colorClass = 'bg-error/20 text-error hover:bg-error/30 border-error/50';
                Icon = XCircle;
                break;
            case 'Expired':
                colorClass = 'bg-muted/50 text-muted-foreground hover:bg-muted/80 border-muted';
                Icon = FileWarning;
                break;
        }
    } else if (type === 'user') {
        switch (status) {
            case 'active':
                colorClass = 'bg-success/20 text-success hover:bg-success/30 border-success/50';
                Icon = CheckCircle;
                break;
            case 'inactive':
            case 'suspended':
                colorClass = 'bg-muted text-muted-foreground hover:bg-muted/80 border-muted-foreground/20';
                Icon = XCircle;
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
