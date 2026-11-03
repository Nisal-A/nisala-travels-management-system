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
    Calendar,
    Building2,
    RotateCcw,
    HelpCircle,
    BookOpen,
    Inbox,
    Globe,
    Camera,
    Sparkles,
    Compass,
    MessageSquare,
    type LucideIcon,
} from 'lucide-react';

export { HelpCircle, BookOpen };

/**
 * Maps icon name strings (shared from the Laravel backend or layout config) to Lucide
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
    Calendar,
    Building2,
    RotateCcw,
    HelpCircle,
    BookOpen,
    Inbox,
    Globe,
    Camera,
    Sparkles,
    Compass,
    MessageSquare,
};

export function getNavIcon(name: string): LucideIcon {
    return iconMap[name] ?? LayoutDashboard;
}
