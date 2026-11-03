import { Link, useForm, usePage } from '@inertiajs/react';
import { useAuth } from '@/hooks/use-auth';
import { getNavIcon, HelpCircle, BookOpen } from '@/lib/nav-icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    CheckCircle2,
    ExternalLink,
    Keyboard,
    LogOut,
    Menu,
    Moon,
    Plus,
    Sparkles,
    Sun,
    TableProperties,
    User as UserIcon,
} from 'lucide-react';
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { CommandPalette } from '@/components/CommandPalette';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export type SidebarTheme = 'navy' | 'light' | 'dark';
export type TableDensity = 'comfortable' | 'compact';

const SIDEBAR_THEME_STORAGE_KEY = 'ntms_sidebar_theme';
const TABLE_DENSITY_STORAGE_KEY = 'ntms_table_density';

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    breadcrumbs?: { label: string; href?: string }[];
}

interface PortalNavItem {
    label: string;
    href: string;
    routeName?: string;
    matchPrefixes: string[];
    icon: string;
    roles?: string[];
}

interface PortalNavSection {
    label: string;
    items: PortalNavItem[];
}

interface ContextualGuideContent {
    moduleTitle: string;
    summary: string;
    tips: string[];
    workflowSteps: string[];
}

function getContextualGuide(pathname: string): ContextualGuideContent {
    if (pathname.startsWith('/bookings')) {
        return {
            moduleTitle: 'Bookings & Reservations Guide',
            summary:
                'Create multi-traveler tour reservations, track installment schedules, assign staff owners, and manage booking lifecycle transitions.',
            workflowSteps: [
                'Use "+ New Booking" to launch the guided 6-step reservation wizard.',
                'Verify customer passport & visa expiry dates before confirming international departures.',
                'Record advance deposits or full payments directly from the booking detail drawer.',
            ],
            tips: [
                'Switch table density to "Compact" when auditing high-volume seasonal departures.',
                'Draft bookings auto-save so you can resume unfinished client quotes anytime.',
            ],
        };
    }

    if (pathname.startsWith('/calendar')) {
        return {
            moduleTitle: 'Departure & Operations Calendar',
            summary:
                'Visualize confirmed departures, payment due dates, and tour capacity milestones across month, week, and agenda views.',
            workflowSteps: [
                'Filter events by tour package or booking status to isolate upcoming departures.',
                'Click any calendar event to inspect traveler counts and quick-jump to the booking record.',
            ],
            tips: [
                'Use Agenda view during weekly operations standups to review upcoming 7-day movements.',
            ],
        };
    }

    if (pathname.includes('/inquiries')) {
        return {
            moduleTitle: 'Web Inquiries & Lead Triage',
            summary:
                'Respond to incoming website tour inquiries, assign sales consultants, and convert qualified leads into confirmed bookings.',
            workflowSteps: [
                'Review new inquiries marked as Pending and assign a staff member.',
                'Update status to Contacted or Converted once the client itinerary is finalized.',
            ],
            tips: [
                'Fast response times (< 2 hours) significantly improve Thailand & India package conversion.',
            ],
        };
    }

    if (pathname.startsWith('/customers') || pathname.startsWith('/documents')) {
        return {
            moduleTitle: 'Customer CRM & Document Verification',
            summary:
                'Maintain traveler profiles, emergency contacts, passport scans, and visa verification statuses.',
            workflowSteps: [
                'Ensure NIC/Passport numbers match uploaded bio-page scans before clicking Verify.',
                'Flag expiring passports (< 6 months validity from return date) for immediate renewal.',
            ],
            tips: [
                'Use Ctrl/Cmd + K to search any traveler by name, phone, or passport number from anywhere.',
            ],
        };
    }

    if (pathname.startsWith('/tours') || pathname.startsWith('/destinations') || pathname.includes('/memories') || pathname.startsWith('/suppliers')) {
        return {
            moduleTitle: 'Catalog, Website Content & Suppliers',
            summary:
                'Curate public tour packages, destination guides, photo memories, and contracted ground/airline suppliers.',
            workflowSteps: [
                'Keep package cost lines updated in LKR and foreign currency to preserve accurate margin reports.',
                'Toggle publish states on Memories and Tours to control visibility on the public website.',
            ],
            tips: [
                'Clear the public website cache in Settings after major catalog pricing updates.',
            ],
        };
    }

    if (pathname.startsWith('/payments') || pathname.startsWith('/refunds') || pathname.startsWith('/reports')) {
        return {
            moduleTitle: 'Finance, Refunds & Executive Reporting',
            summary:
                'Reconcile customer receipts, process cancellation refund workflows, and export financial & operational reports.',
            workflowSteps: [
                'Verify payment reference numbers against bank statements before marking receipts Verified.',
                'Refund requests require Manager or Super Admin approval before disbursement.',
            ],
            tips: [
                'Export reports to CSV/PDF for monthly accounting close.',
            ],
        };
    }

    return {
        moduleTitle: 'Executive Admin Portal Guide',
        summary:
            'Welcome to the Nisala Travels Management System. Use the sidebar to navigate across Operations, Catalog, and Finance modules.',
        workflowSteps: [
            'Press Cmd/Ctrl + K at any time to search bookings, customers, tours, or trigger quick actions.',
            'Customize your workspace using the Navy / Light / Dark theme pills and Compact / Comfort table density toggle.',
            'Use "+ New Booking" in the top bar to start a customer reservation from any screen.',
        ],
        tips: [
            'Preferences for sidebar theme and table density are automatically saved to your browser.',
            'Visit the Help & Guides center (/help) for complete standard operating procedures.',
        ],
    };
}

function resolveRouteUrl(routeName: string | undefined, fallbackHref: string): string {
    if (!routeName) return fallbackHref;
    try {
        if (typeof route === 'function') {
            return route(routeName);
        }
    } catch {
        // Fallback to direct path if Ziggy route is not registered
    }
    return fallbackHref;
}

export default function AppLayout({ children, title, breadcrumbs }: AppLayoutProps) {
    const { user, hasRole } = useAuth();
    const { post, processing } = useForm({});
    const [sheetOpen, setSheetOpen] = useState(false);
    const [guideOpen, setGuideOpen] = useState(false);
    const currentUrl = usePage().url;
    const currentPath = currentUrl.split('?')[0] || '/dashboard';

    const [sidebarTheme, setSidebarTheme] = useState<SidebarTheme>(() => {
        if (typeof window === 'undefined') return 'navy';
        const saved = window.localStorage.getItem(SIDEBAR_THEME_STORAGE_KEY);
        if (saved === 'navy' || saved === 'light' || saved === 'dark') {
            return saved;
        }
        return 'navy';
    });

    const [density, setDensity] = useState<TableDensity>(() => {
        if (typeof window === 'undefined') return 'comfortable';
        const saved = window.localStorage.getItem(TABLE_DENSITY_STORAGE_KEY);
        if (saved === 'compact' || saved === 'comfortable') {
            return saved;
        }
        return 'comfortable';
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(SIDEBAR_THEME_STORAGE_KEY, sidebarTheme);
        } catch {
            // Ignore storage errors
        }
        const root = document.documentElement;
        if (sidebarTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [sidebarTheme]);

    useEffect(() => {
        try {
            window.localStorage.setItem(TABLE_DENSITY_STORAGE_KEY, density);
        } catch {
            // Ignore storage errors
        }
    }, [density]);

    function handleLogout(e?: FormEvent | React.MouseEvent) {
        if (e) e.preventDefault();
        post(route('logout'));
    }

    function isItemActive(item: PortalNavItem): boolean {
        for (const prefix of item.matchPrefixes) {
            if (prefix === '/dashboard' || prefix === '/') {
                if (currentPath === prefix) return true;
            } else if (currentPath === prefix || currentPath.startsWith(prefix + '/')) {
                return true;
            }
        }
        if (item.routeName) {
            try {
                const routeUrl = route(item.routeName);
                const targetPath = new URL(routeUrl, window.location.origin).pathname;
                if (targetPath === '/' || targetPath === '/dashboard') {
                    return currentPath === targetPath;
                }
                return currentPath === targetPath || currentPath.startsWith(targetPath + '/');
            } catch {
                return false;
            }
        }
        return false;
    }

    const initials =
        user?.name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() ?? '?';

    const roleBadge = user?.roles?.[0]?.replace('_', ' ') ?? 'user';

    const rawSections: PortalNavSection[] = useMemo(
        () => [
            {
                label: 'OPERATIONS',
                items: [
                    {
                        label: 'Dashboard',
                        href: '/dashboard',
                        routeName: 'dashboard',
                        matchPrefixes: ['/dashboard'],
                        icon: 'LayoutDashboard',
                    },
                    {
                        label: 'Bookings',
                        href: '/bookings',
                        routeName: 'bookings.index',
                        matchPrefixes: ['/bookings'],
                        icon: 'CalendarCheck',
                        roles: ['super_admin', 'manager', 'staff'],
                    },
                    {
                        label: 'Calendar',
                        href: '/calendar',
                        routeName: 'calendar',
                        matchPrefixes: ['/calendar'],
                        icon: 'Calendar',
                        roles: ['super_admin', 'manager', 'staff', 'finance'],
                    },
                    {
                        label: 'Web Inquiries',
                        href: '/admin/inquiries',
                        routeName: 'admin.inquiries.index',
                        matchPrefixes: ['/inquiries', '/admin/inquiries'],
                        icon: 'Inbox',
                        roles: ['super_admin', 'manager', 'staff'],
                    },
                    {
                        label: 'Customers',
                        href: '/customers',
                        routeName: 'customers.index',
                        matchPrefixes: ['/customers'],
                        icon: 'Users',
                        roles: ['super_admin', 'manager', 'staff'],
                    },
                    {
                        label: 'Documents',
                        href: '/documents',
                        routeName: 'documents.index',
                        matchPrefixes: ['/documents'],
                        icon: 'FileText',
                        roles: ['super_admin', 'manager', 'staff'],
                    },
                ],
            },
            {
                label: 'CATALOG & WEB',
                items: [
                    {
                        label: 'Tour Packages',
                        href: '/tours',
                        routeName: 'tours.index',
                        matchPrefixes: ['/tours'],
                        icon: 'Map',
                        roles: ['super_admin', 'manager', 'staff'],
                    },
                    {
                        label: 'Destinations',
                        href: '/destinations',
                        routeName: 'destinations.index',
                        matchPrefixes: ['/destinations'],
                        icon: 'Globe',
                        roles: ['super_admin', 'manager', 'staff'],
                    },
                    {
                        label: 'Memories',
                        href: '/admin/memories',
                        routeName: 'admin.memories.index',
                        matchPrefixes: ['/admin/memories'],
                        icon: 'Camera',
                        roles: ['super_admin', 'manager'],
                    },
                    {
                        label: 'Suppliers',
                        href: '/suppliers',
                        routeName: 'suppliers.index',
                        matchPrefixes: ['/suppliers'],
                        icon: 'Building2',
                        roles: ['super_admin', 'manager', 'finance'],
                    },
                ],
            },
            {
                label: 'FINANCE & ADMIN',
                items: [
                    {
                        label: 'Payments',
                        href: '/payments',
                        routeName: 'payments.index',
                        matchPrefixes: ['/payments'],
                        icon: 'CreditCard',
                        roles: ['super_admin', 'manager', 'finance'],
                    },
                    {
                        label: 'Refunds',
                        href: '/refunds',
                        routeName: 'refunds.index',
                        matchPrefixes: ['/refunds'],
                        icon: 'RotateCcw',
                        roles: ['super_admin', 'manager', 'finance'],
                    },
                    {
                        label: 'Reports',
                        href: '/reports',
                        routeName: 'reports.index',
                        matchPrefixes: ['/reports'],
                        icon: 'BarChart3',
                        roles: ['super_admin', 'manager', 'staff', 'finance'],
                    },
                    {
                        label: 'Employees',
                        href: '/employees',
                        routeName: 'employees.index',
                        matchPrefixes: ['/employees'],
                        icon: 'UserCog',
                        roles: ['super_admin', 'manager'],
                    },
                    {
                        label: 'Settings',
                        href: '/settings',
                        routeName: 'settings.index',
                        matchPrefixes: ['/settings'],
                        icon: 'Settings',
                        roles: ['super_admin'],
                    },
                ],
            },
            {
                label: 'SUPPORT',
                items: [
                    {
                        label: 'Help & Guides',
                        href: '/help',
                        routeName: 'help.index',
                        matchPrefixes: ['/help'],
                        icon: 'BookOpen',
                    },
                ],
            },
        ],
        [],
    );

    const navSections = useMemo(() => {
        // Show role-permitted items when user roles are loaded; if no role matches (e.g., dev preview), fall back to showing all
        const hasAnyOfficeRole = hasRole('super_admin', 'manager', 'staff', 'finance');
        return rawSections
            .map((section) => ({
                ...section,
                items: section.items.filter((item) => {
                    if (!item.roles || item.roles.length === 0 || !hasAnyOfficeRole) {
                        return true;
                    }
                    return hasRole(...item.roles);
                }),
            }))
            .filter((section) => section.items.length > 0);
    }, [rawSections, user]);

    const contextualGuide = useMemo(() => getContextualGuide(currentPath), [currentPath]);

    const isNavySidebar = sidebarTheme === 'navy';
    const isDarkSidebar = sidebarTheme === 'dark';

    const sidebarContainerClasses = isNavySidebar
        ? 'bg-[#0E2A47] text-slate-100 border-[#1B3A5E]'
        : isDarkSidebar
          ? 'bg-[#0C1B2E] text-slate-100 border-[#1E293B]'
          : 'bg-white text-slate-900 border-slate-200';

    const sidebarHeaderBorder = isNavySidebar
        ? 'border-[#1B3A5E]'
        : isDarkSidebar
          ? 'border-[#1E293B]'
          : 'border-slate-200';

    const sectionHeadingClasses = isNavySidebar
        ? 'text-slate-400/90'
        : isDarkSidebar
          ? 'text-slate-400'
          : 'text-slate-400';

    function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
        return (
            <div className={`flex h-full flex-col border-r transition-colors ${sidebarContainerClasses}`}>
                {/* Brand Logo Header */}
                <div className={`h-16 px-5 border-b flex items-center justify-between shrink-0 ${sidebarHeaderBorder}`}>
                    <Link
                        href={resolveRouteUrl('dashboard', '/dashboard')}
                        onClick={onItemClick}
                        className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 ring-[#C49A2C] rounded"
                    >
                        <img
                            src="/images/nisala-travels-logo.png"
                            alt="Nisala Travels"
                            className={`h-8 w-auto object-contain ${
                                isNavySidebar || isDarkSidebar ? 'brightness-0 invert' : ''
                            }`}
                        />
                        <div className="flex flex-col">
                            <span
                                className={`text-sm font-bold tracking-tight leading-none ${
                                    isNavySidebar || isDarkSidebar ? 'text-white' : 'text-[#0E2A47]'
                                }`}
                            >
                                NISALA TRAVELS
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#C49A2C] mt-0.5">
                                Executive Portal
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Grouped Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                    {navSections.map((section) => (
                        <div key={section.label} className="space-y-1">
                            <p
                                className={`px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider ${sectionHeadingClasses}`}
                            >
                                {section.label}
                            </p>
                            {section.items.map((item) => {
                                const Icon = getNavIcon(item.icon);
                                const active = isItemActive(item);
                                const targetHref = resolveRouteUrl(item.routeName, item.href);

                                const itemClasses =
                                    isNavySidebar || isDarkSidebar
                                        ? active
                                            ? 'bg-white/10 text-white font-semibold border-l-3 border-[#C49A2C] pl-[9px]'
                                            : 'text-slate-300 hover:bg-white/5 hover:text-white border-l-3 border-transparent pl-[9px]'
                                        : active
                                          ? 'bg-[#0E2A47]/8 text-[#0E2A47] font-semibold border-l-3 border-[#C49A2C] pl-[9px]'
                                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-3 border-transparent pl-[9px]';

                                const iconClasses = active
                                    ? 'text-[#C49A2C]'
                                    : isNavySidebar || isDarkSidebar
                                      ? 'text-slate-400 group-hover:text-[#F59E0B]'
                                      : 'text-slate-400 group-hover:text-[#0E2A47]';

                                const handleHelpIntercept = (e: React.MouseEvent) => {
                                    if (item.href === '/help' && !item.routeName) {
                                        e.preventDefault();
                                        setGuideOpen(true);
                                    }
                                    onItemClick?.();
                                };

                                // If Ziggy doesn't have `help.index`, open the Help & Guides drawer gracefully or navigate to `/help`
                                const isUnregisteredHelp =
                                    item.href === '/help' &&
                                    (() => {
                                        try {
                                            route('help.index');
                                            return false;
                                        } catch {
                                            return true;
                                        }
                                    })();

                                if (isUnregisteredHelp) {
                                    return (
                                        <Link
                                            key={item.label}
                                            href="/help"
                                            onClick={(e) => {
                                                // Open contextual help drawer while also allowing middle-click / direct /help navigation
                                                if (!e.metaKey && !e.ctrlKey) {
                                                    e.preventDefault();
                                                    setGuideOpen(true);
                                                    onItemClick?.();
                                                }
                                            }}
                                            className={`group flex items-center gap-3 pr-3 py-2 rounded-r-lg text-sm transition-all ${itemClasses}`}
                                        >
                                            <Icon className={`size-4.5 shrink-0 transition-colors ${iconClasses}`} />
                                            <span className="truncate">{item.label}</span>
                                        </Link>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.label}
                                        href={targetHref}
                                        onClick={handleHelpIntercept}
                                        className={`group flex items-center gap-3 pr-3 py-2 rounded-r-lg text-sm transition-all ${itemClasses}`}
                                    >
                                        <Icon className={`size-4.5 shrink-0 transition-colors ${iconClasses}`} />
                                        <span className="truncate">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className={`p-3 border-t shrink-0 ${sidebarHeaderBorder}`}>
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={processing}
                        className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer ${
                            isNavySidebar || isDarkSidebar
                                ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    >
                        <LogOut className="size-4 shrink-0 text-[#C49A2C]" />
                        <span>{processing ? 'Logging out...' : 'Log out'}</span>
                    </button>
                </div>
            </div>
        );
    }

    const newBookingHref = resolveRouteUrl('bookings.create', '/bookings/create');

    return (
        <TooltipProvider>
            <div
                data-density={density}
                data-sidebar-theme={sidebarTheme}
                className="flex h-screen bg-background text-foreground overflow-hidden"
            >
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-64 flex-col shrink-0">
                    <SidebarContent />
                </aside>

                {/* Mobile Sheet Drawer */}
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetContent side="left" className="w-64 p-0 border-r-0">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <SidebarContent onItemClick={() => setSheetOpen(false)} />
                    </SheetContent>
                </Sheet>

                {/* Contextual Help & Guides Drawer */}
                <Sheet open={guideOpen} onOpenChange={setGuideOpen}>
                    <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                        <SheetHeader className="border-b border-border pb-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C49A2C]">
                                <BookOpen className="size-4" />
                                <span>Contextual Page Guide</span>
                            </div>
                            <SheetTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                                {contextualGuide.moduleTitle}
                            </SheetTitle>
                            <SheetDescription className="text-sm text-slate-600 dark:text-slate-400">
                                {contextualGuide.summary}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="py-5 space-y-6">
                            {/* Key Workflow Steps */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <CheckCircle2 className="size-3.5 text-[#0E2A47] dark:text-[#C49A2C]" />
                                    Recommended Workflow
                                </h4>
                                <ol className="space-y-2.5">
                                    {contextualGuide.workflowSteps.map((step, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 p-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                                        >
                                            <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0E2A47] text-[11px] font-bold text-[#F59E0B]">
                                                {index + 1}
                                            </span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Pro Tips */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <Sparkles className="size-3.5 text-[#F59E0B]" />
                                    Executive Tips
                                </h4>
                                <ul className="space-y-2">
                                    {contextualGuide.tips.map((tip, index) => (
                                        <li
                                            key={index}
                                            className="rounded-lg border border-amber-200/70 bg-amber-50/60 dark:border-amber-800/40 dark:bg-amber-950/30 p-3 text-xs text-amber-900 dark:text-amber-200 leading-relaxed"
                                        >
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Keyboard Shortcuts */}
                            <div className="rounded-lg border border-border bg-card p-3.5 space-y-2.5">
                                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                                    <Keyboard className="size-4 text-[#C49A2C]" />
                                    <span>Keyboard Shortcuts</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Global Command Palette</span>
                                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                                        Ctrl / ⌘ + K
                                    </kbd>
                                </div>
                            </div>

                            {/* Link to Full Help Center */}
                            <div className="pt-2 border-t border-border flex items-center justify-between">
                                <Link
                                    href="/help"
                                    onClick={() => setGuideOpen(false)}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B3D91] dark:text-[#F59E0B] hover:underline"
                                >
                                    <span>Open Full Help & Guides Center</span>
                                    <ExternalLink className="size-3.5" />
                                </Link>
                                <Button variant="outline" size="sm" onClick={() => setGuideOpen(false)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Main Content Area */}
                <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                    {/* Executive Top Header Bar */}
                    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 sm:px-6 lg:px-8">
                        {/* Left: Mobile Trigger + Page Title + Command Palette */}
                        <div className="flex items-center gap-3 min-w-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden size-9 text-muted-foreground hover:text-foreground"
                                onClick={() => setSheetOpen(true)}
                                aria-label="Open sidebar menu"
                            >
                                <Menu className="size-5" />
                            </Button>

                            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate max-w-[180px] xl:max-w-[240px]">
                                {title ||
                                    (breadcrumbs && breadcrumbs.length > 0
                                        ? breadcrumbs[breadcrumbs.length - 1].label
                                        : 'Nisala Travels')}
                            </span>

                            <div className="hidden md:block">
                                <CommandPalette />
                            </div>
                        </div>

                        {/* Right: Theme Switcher, Density Toggle, ? Guide, + New Booking, Notifications, User Profile */}
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            {/* Quick Theme Switcher Pills (Navy / Light / Dark) */}
                            <div
                                role="group"
                                aria-label="Sidebar and portal theme"
                                className="hidden xl:inline-flex items-center rounded-lg border border-border bg-muted/60 p-0.5 text-xs"
                            >
                                {(['navy', 'light', 'dark'] as const).map((mode) => {
                                    const active = sidebarTheme === mode;
                                    const label = mode === 'navy' ? 'Navy' : mode === 'light' ? 'Light' : 'Dark';
                                    return (
                                        <button
                                            key={mode}
                                            type="button"
                                            onClick={() => setSidebarTheme(mode)}
                                            aria-pressed={active}
                                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                                                active
                                                    ? mode === 'navy'
                                                        ? 'bg-[#0E2A47] text-white shadow-xs'
                                                        : 'bg-card text-foreground shadow-xs font-semibold'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Table Density Toggle Pills (Compact / Comfort) */}
                            <div
                                role="group"
                                aria-label="Table density"
                                className="hidden xl:inline-flex items-center rounded-lg border border-border bg-muted/60 p-0.5 text-xs"
                            >
                                <button
                                    type="button"
                                    onClick={() => setDensity('compact')}
                                    aria-pressed={density === 'compact'}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                                        density === 'compact'
                                            ? 'bg-card text-foreground shadow-xs font-semibold'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Compact
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDensity('comfortable')}
                                    aria-pressed={density === 'comfortable'}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                                        density === 'comfortable'
                                            ? 'bg-card text-foreground shadow-xs font-semibold'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Comfort
                                </button>
                            </div>

                            {/* ? Guide Contextual Help Button */}
                            <button
                                type="button"
                                onClick={() => setGuideOpen(true)}
                                className="inline-flex items-center gap-1.5 h-9 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-muted transition-colors cursor-pointer"
                                title="Open contextual page guide"
                            >
                                <HelpCircle className="size-4 text-[#C49A2C]" />
                                <span className="hidden sm:inline">? Guide</span>
                            </button>

                            {/* Primary CTA: + New Booking */}
                            {hasRole('super_admin', 'manager', 'staff') && (
                                <Link
                                    href={newBookingHref}
                                    className="inline-flex items-center gap-1.5 h-9 rounded-lg bg-[#0E2A47] hover:bg-[#0B3D91] text-white px-3 text-xs font-semibold shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 ring-[#C49A2C]"
                                >
                                    <Plus className="size-4 text-[#F59E0B] stroke-[2.5]" />
                                    <span className="hidden sm:inline">+ New Booking</span>
                                    <span className="sm:hidden">Booking</span>
                                </Link>
                            )}

                            <div className="hidden sm:block h-5 w-px bg-border" />

                            {/* Notification Bell */}
                            <NotificationBell />

                            {/* User Profile Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <button
                                            type="button"
                                            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 ring-ring rounded-lg cursor-pointer"
                                        >
                                            <div className="hidden sm:flex flex-col text-right">
                                                <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[130px]">
                                                    {user?.name}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground capitalize leading-tight">
                                                    {roleBadge}
                                                </span>
                                            </div>
                                            <Avatar className="size-9 rounded-full border-2 border-[#C49A2C]/40 shadow-sm">
                                                <AvatarFallback className="bg-[#0E2A47] text-white font-semibold text-xs">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                        </button>
                                    }
                                />
                                <DropdownMenuContent align="end" className="w-60">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-semibold leading-none text-foreground">
                                                {user?.name}
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground truncate">
                                                {user?.email}
                                            </p>
                                            <div className="pt-1.5">
                                                <Badge variant="outline" className="text-[10px] capitalize">
                                                    {roleBadge}
                                                </Badge>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    {/* Compact Theme & Density controls for smaller screens inside user menu */}
                                    <div className="xl:hidden px-2 py-1.5 space-y-2 border-b border-border">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                {sidebarTheme === 'dark' ? (
                                                    <Moon className="size-3.5" />
                                                ) : (
                                                    <Sun className="size-3.5" />
                                                )}
                                                Theme
                                            </span>
                                            <div className="inline-flex rounded border border-border p-0.5">
                                                {(['navy', 'light', 'dark'] as const).map((m) => (
                                                    <button
                                                        key={m}
                                                        type="button"
                                                        onClick={() => setSidebarTheme(m)}
                                                        className={`px-1.5 py-0.5 rounded text-[10px] capitalize ${
                                                            sidebarTheme === m
                                                                ? 'bg-[#0E2A47] text-white font-semibold'
                                                                : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {m}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <TableProperties className="size-3.5" />
                                                Density
                                            </span>
                                            <div className="inline-flex rounded border border-border p-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setDensity('compact')}
                                                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                                                        density === 'compact'
                                                            ? 'bg-[#0E2A47] text-white font-semibold'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    Compact
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDensity('comfortable')}
                                                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                                                        density === 'comfortable'
                                                            ? 'bg-[#0E2A47] text-white font-semibold'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    Comfort
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <DropdownMenuItem
                                        render={
                                            <Link
                                                href={resolveRouteUrl('profile.edit', '/profile')}
                                                className="w-full flex items-center cursor-pointer"
                                            >
                                                <UserIcon className="mr-2 size-4 text-muted-foreground" />
                                                <span>My Profile</span>
                                            </Link>
                                        }
                                    />
                                    <DropdownMenuItem
                                        onClick={() => setGuideOpen(true)}
                                        className="cursor-pointer"
                                    >
                                        <BookOpen className="mr-2 size-4 text-[#C49A2C]" />
                                        <span>Help & Guides</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        disabled={processing}
                                        className="text-destructive focus:text-destructive cursor-pointer"
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        <span>{processing ? 'Signing out…' : 'Sign Out'}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    {/* Main Scrollable View */}
                    <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
                        <div className="max-w-7xl mx-auto space-y-8">{children}</div>
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
