import {
    LayoutDashboard,
    Users,
    FileText,
    Map,
    CalendarCheck,
    CreditCard,
    UserCog,
    BarChart3,
    Settings,
    Bell,
    type LucideIcon,
} from 'lucide-react';

/**
 * Maps icon name strings (shared from the Laravel backend) to Lucide
 * icon components. This keeps the backend from needing to know about
 * React components while allowing dynamic icon rendering.
 */
const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    Users,
    FileText,
    Map,
    CalendarCheck,
    CreditCard,
    UserCog,
    BarChart3,
    Settings,
    Bell,
};

export function getNavIcon(name: string): LucideIcon {
    return iconMap[name] ?? LayoutDashboard;
}
