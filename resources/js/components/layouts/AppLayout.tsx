import { Link, useForm, usePage } from '@inertiajs/react';
import { useAuth } from '@/hooks/use-auth';
import { getNavIcon } from '@/lib/nav-icons';
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
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { LogOut, Menu, User as UserIcon } from 'lucide-react';
import type { NavigationItem } from '@/types';
import { type FormEvent, type ReactNode, useState } from 'react';
import { CommandPalette } from '@/components/CommandPalette';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    breadcrumbs?: { label: string; href?: string }[];
}

export default function AppLayout({ children, title, breadcrumbs }: AppLayoutProps) {
    const { user, navigation, hasRole } = useAuth();
    const { post, processing } = useForm({});
    const [sheetOpen, setSheetOpen] = useState(false);
    const currentUrl = usePage().url;

    function handleLogout(e?: FormEvent | React.MouseEvent) {
        if (e) e.preventDefault();
        post(route('logout'));
    }

    function isActive(routeName: string): boolean {
        try {
            const routeUrl = route(routeName);
            const targetPath = new URL(routeUrl, window.location.origin).pathname;
            const currentPath = currentUrl.split('?')[0];
            if (targetPath === '/' || targetPath === '/dashboard') {
                return currentPath === targetPath;
            }
            return currentPath === targetPath || currentPath.startsWith(targetPath + '/');
        } catch {
            return false;
        }
    }

    const initials =
        user?.name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() ?? '?';

    const roleBadge = user?.roles?.[0]?.replace('_', ' ') ?? 'user';

    // Collect and deduplicate nav items
    const rawItems: NavigationItem[] = [
        ...(navigation.main || []),
        ...(navigation.management || []),
        ...(navigation.portal || []),
    ];

    if (
        hasRole('super_admin', 'manager') &&
        !rawItems.some((i) => i.route === 'employees.index' || i.label === 'Employees')
    ) {
        rawItems.push({
            label: 'Employees',
            route: 'employees.index',
            icon: 'UserCog',
        });
    }

    const seen = new Set<string>();
    const allItems: NavigationItem[] = [];
    for (const item of rawItems) {
        if (!seen.has(item.route)) {
            seen.add(item.route);
            allItems.push(item);
        }
    }

    const overviewOrder = ['dashboard', 'notifications'];
    const workspaceOrder = ['customers', 'documents', 'tours', 'bookings', 'payments', 'inquiries', 'calendar'];
    const managementOrder = ['reports', 'suppliers', 'refunds', 'employees', 'settings'];

    const overviewItems: NavigationItem[] = [];
    const workspaceItems: NavigationItem[] = [];
    const managementItems: NavigationItem[] = [];

    for (const item of allItems) {
        const l = item.label.toLowerCase();
        const r = item.route.toLowerCase();

        if (l === 'dashboard' || r === 'dashboard' || l === 'notifications' || r.includes('notification')) {
            overviewItems.push(item);
        } else if (
            l === 'customers' ||
            r.includes('customer') ||
            l === 'documents' ||
            r.includes('document') ||
            l === 'tours' ||
            r.includes('tour') ||
            l === 'bookings' ||
            r.includes('booking') ||
            l === 'payments' ||
            r.includes('payment') ||
            l === 'inquiries' ||
            r.includes('inquir') ||
            l === 'calendar' ||
            r.includes('calendar')
        ) {
            workspaceItems.push(item);
        } else {
            managementItems.push(item);
        }
    }

    function sortByOrder(items: NavigationItem[], order: string[]): NavigationItem[] {
        return [...items].sort((a, b) => {
            const idxA = order.findIndex((k) => a.label.toLowerCase() === k || a.route.toLowerCase().includes(k));
            const idxB = order.findIndex((k) => b.label.toLowerCase() === k || b.route.toLowerCase().includes(k));
            const posA = idxA === -1 ? 999 : idxA;
            const posB = idxB === -1 ? 999 : idxB;
            return posA - posB;
        });
    }

    const navSections = [
        { label: 'Overview', items: sortByOrder(overviewItems, overviewOrder) },
        { label: 'Workspace', items: sortByOrder(workspaceItems, workspaceOrder) },
        { label: 'Management', items: sortByOrder(managementItems, managementOrder) },
    ];

    function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
        return (
            <div className="flex h-full flex-col bg-card">
                {/* Logo row */}
                <div className="h-16 px-6 border-b flex items-center shrink-0">
                    <Link
                        href={route('dashboard')}
                        onClick={onItemClick}
                        className="flex items-center focus-visible:outline-none focus-visible:ring-2 ring-ring rounded"
                    >
                        <img
                            src="/images/nisala-travels-logo.png"
                            alt="Nisala Travels"
                            className="h-8 w-auto object-contain"
                        />
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navSections.map((section) => {
                        if (section.items.length === 0) return null;
                        return (
                            <div key={section.label} className="space-y-1">
                                <p className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {section.label}
                                </p>
                                {section.items.map((item) => {
                                    const Icon = getNavIcon(item.icon);
                                    const active = isActive(item.route);
                                    return (
                                        <Link
                                            key={item.route}
                                            href={route(item.route)}
                                            onClick={onItemClick}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                active
                                                    ? 'bg-primary/10 text-primary font-medium'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                        >
                                            <Icon className="size-5 shrink-0" />
                                            <span className="truncate">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t shrink-0">
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={processing}
                        className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
                    >
                        <LogOut className="size-4 shrink-0" />
                        <span>{processing ? 'Logging out...' : 'Log out'}</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="flex h-screen bg-background text-foreground overflow-hidden">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-64 flex-col border-r bg-card shrink-0">
                    <SidebarContent />
                </aside>

                {/* Mobile Sheet Drawer */}
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetContent side="left" className="w-64 p-0">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <SidebarContent onItemClick={() => setSheetOpen(false)} />
                    </SheetContent>
                </Sheet>

                {/* Main Content Area */}
                <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                    {/* Header */}
                    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 sm:px-6 lg:px-8">
                        {/* Left */}
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
                            <span className="text-sm font-semibold text-foreground truncate">
                                {title || (breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : 'Nisala Travels')}
                            </span>
                        </div>

                        {/* Right */}
                        <div className="flex items-center gap-6">
                            {hasRole('super_admin', 'manager', 'staff', 'finance') && <CommandPalette />}

                            <div className="hidden sm:block h-6 w-px bg-border" />

                            <NotificationBell />

                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <button
                                            type="button"
                                            className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 ring-ring rounded-lg cursor-pointer"
                                        >
                                            <div className="hidden sm:flex flex-col text-right">
                                                <span className="text-sm font-semibold text-foreground leading-tight truncate max-w-[140px]">
                                                    {user?.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground capitalize leading-tight">
                                                    {roleBadge}
                                                </span>
                                            </div>
                                            <Avatar className="size-9 rounded-full border-2 border-card shadow-sm">
                                                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                        </button>
                                    }
                                />
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none text-foreground">{user?.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                                            <div className="pt-1">
                                                <Badge variant="outline" className="text-[10px] capitalize">
                                                    {roleBadge}
                                                </Badge>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        render={
                                            <Link href={route('profile.edit')} className="w-full flex items-center cursor-pointer">
                                                <UserIcon className="mr-2 size-4 text-muted-foreground" />
                                                <span>My Profile</span>
                                            </Link>
                                        }
                                    />
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
                        <div className="max-w-7xl mx-auto space-y-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
