import { Link, useForm, usePage } from '@inertiajs/react';
import { useAuth } from '@/hooks/use-auth';
import { getNavIcon } from '@/lib/nav-icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Globe, LogOut, Menu, PanelLeftClose, PanelLeft, Bell, UserCog, User as UserIcon, Moon, Sun, Laptop } from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { NavigationItem } from '@/types';
import { Fragment, type FormEvent, type ReactNode, useState } from 'react';
import { CommandPalette } from '@/components/CommandPalette';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useTheme } from '@/components/theme-provider';

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    breadcrumbs?: { label: string; href?: string }[];
}

/**
 * Main application layout with role-aware sidebar navigation.
 *
 * The navigation items are provided by the server via Inertia shared
 * props — the frontend renders only what the user is authorized to see.
 * All security enforcement happens server-side via route middleware.
 *
 * NT-005.4 — Protected Route Groups & Role-Based Navigation
 */
export default function AppLayout({ children, title, breadcrumbs }: AppLayoutProps) {
    const { user, navigation, hasRole } = useAuth();
    const { post, processing } = useForm({});
    const [collapsed, setCollapsed] = useState(false);
    const currentUrl = usePage().url;
    const { theme, setTheme } = useTheme();

    function handleLogout(e: FormEvent) {
        e.preventDefault();
        post(route('logout'));
    }

    function isActive(routeName: string): boolean {
        try {
            const routeUrl = route(routeName);
            const pathname = new URL(routeUrl).pathname;
            return currentUrl === pathname || currentUrl.startsWith(pathname + '/');
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

    // -----------------------------------------------------------------
    // Sidebar Nav Section Renderer
    // -----------------------------------------------------------------
    function NavSection({ label, items }: { label?: string; items: NavigationItem[] }) {
        return (
            <div className="space-y-1">
                {label && !collapsed && (
                    <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/60">
                        {label}
                    </p>
                )}
                {items.map((item) => {
                    const Icon = getNavIcon(item.icon);
                    const active = isActive(item.route);

                    const linkContent = (
                        <Link
                            href={route(item.route)}
                            className={`
                                group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                                transition-all duration-200 ease-out
                                ${
                                    active
                                        ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }
                                ${collapsed ? 'justify-center px-2' : ''}
                            `}
                        >
                            <Icon
                                className={`shrink-0 transition-colors ${
                                    active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                                } ${collapsed ? 'h-5 w-5' : 'h-4 w-4'}`}
                            />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                    );

                    if (collapsed) {
                        return (
                            <Tooltip key={item.route}>
                                <TooltipTrigger render={<div className="w-full flex justify-center" />}>
                                    {linkContent}
                                </TooltipTrigger>
                                <TooltipContent side="right" sideOffset={8}>
                                    {item.label}
                                </TooltipContent>
                            </Tooltip>
                        );
                    }

                    return <div key={item.route}>{linkContent}</div>;
                })}
            </div>
        );
    }

    // -----------------------------------------------------------------
    // Sidebar Content (shared between desktop sidebar and mobile sheet)
    // -----------------------------------------------------------------
    function SidebarContent({ mobile = false }: { mobile?: boolean }) {
        const isCollapsed = !mobile && collapsed;

        return (
            <div className="flex h-full flex-col">
                {/* Header */}
                <div
                    className={`flex h-16 shrink-0 items-center border-b border-border/50 ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'}`}
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 to-primary shadow-lg shadow-primary/20">
                        <Globe className="h-5 w-5 text-primary-foreground" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col overflow-hidden">
                            <span className="truncate text-sm font-bold tracking-tight text-foreground">
                                Nisala Travels
                            </span>
                            <span className="truncate text-[0.65rem] text-muted-foreground">Management System</span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 py-4">
                    <nav className={`space-y-6 ${isCollapsed ? 'px-2' : 'px-3'}`}>
                        {navigation.main && <NavSection items={navigation.main} />}

                        {(() => {
                            const managementItems = [...(navigation.management || [])];
                            if (
                                hasRole('super_admin', 'manager') &&
                                !managementItems.some((i) => i.route === 'employees.index' || i.label === 'Employees')
                            ) {
                                managementItems.unshift({
                                    label: 'Employees',
                                    route: 'employees.index',
                                    icon: 'UserCog',
                                });
                            }

                            return managementItems.length > 0 ? (
                                <>
                                    {!isCollapsed && <Separator className="opacity-50" />}
                                    <NavSection label="Management" items={managementItems} />
                                </>
                            ) : null;
                        })()}

                        {navigation.portal && navigation.portal.length > 0 && (
                            <>
                                {!isCollapsed && <Separator className="opacity-50" />}
                                <NavSection label="My Account" items={navigation.portal} />
                            </>
                        )}
                    </nav>
                </ScrollArea>

                {/* User Footer */}
                <div className="shrink-0 border-t border-border/50 p-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <button
                                    className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted ${isCollapsed ? 'justify-center' : ''}`}
                                >
                                    <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    {!isCollapsed && (
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="truncate text-sm font-medium text-foreground">
                                                {user?.name}
                                            </span>
                                            <span className="truncate text-[0.65rem] text-muted-foreground">
                                                {roleBadge}
                                            </span>
                                        </div>
                                    )}
                                </button>
                            }
                        />
                        <DropdownMenuContent side="top" align="start" className="w-64 p-2">
                            <div className="flex items-center gap-3 p-2">
                                <Avatar className="h-10 w-10 shrink-0">
                                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col space-y-0.5 min-w-0">
                                    <span className="truncate text-sm font-semibold text-foreground">
                                        {user?.name}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {user?.email}
                                    </span>
                                    <div className="pt-0.5">
                                        <Badge variant="outline" className="w-fit text-[0.65rem] capitalize">
                                            {roleBadge}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <DropdownMenuSeparator className="my-1.5" />

                            <DropdownMenuItem
                                render={
                                    <Link href={route('profile.edit')} className="w-full cursor-pointer flex items-center px-2 py-1.5">
                                        <UserIcon className="mr-2.5 h-4 w-4 text-muted-foreground" />
                                        <span>My Profile</span>
                                    </Link>
                                }
                            />

                            <DropdownMenuSeparator className="my-1.5" />
                            <DropdownMenuItem
                                onClick={(e: React.MouseEvent) => {
                                    e.preventDefault();
                                    handleLogout(e as unknown as FormEvent);
                                }}
                                disabled={processing}
                                className="text-destructive focus:text-destructive cursor-pointer px-2 py-1.5"
                            >
                                <LogOut className="mr-2.5 h-4 w-4" />
                                <span>{processing ? 'Signing out…' : 'Sign Out'}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="flex h-screen bg-background dark">
                {/* Desktop Sidebar */}
                <aside
                    className={`relative hidden lg:flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-xl transition-all duration-300 ease-out ${
                        collapsed ? 'w-[68px]' : 'w-64'
                    }`}
                >
                    <SidebarContent />

                    {/* Collapse toggle */}
                    <div className="absolute bottom-20 -right-3 z-10 hidden lg:block">
                        <Button
                            variant="outline"
                            size="icon-xs"
                            onClick={() => setCollapsed(!collapsed)}
                            className="rounded-full shadow-md bg-card"
                        >
                            {collapsed ? <PanelLeft className="h-3 w-3" /> : <PanelLeftClose className="h-3 w-3" />}
                        </Button>
                    </div>
                </aside>

                {/* Mobile Sheet */}
                <Sheet>
                    <SheetTrigger
                        render={
                            <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-40 lg:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        }
                    />
                    <SheetContent side="left" className="w-64 p-0">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <SidebarContent mobile />
                    </SheetContent>
                </Sheet>

                {/* Main Content */}
                <main className="flex flex-1 flex-col overflow-hidden">
                    {/* Top Bar */}
                    <header className="flex h-16 shrink-0 items-center border-b border-border/50 bg-card/30 px-6 backdrop-blur-sm">
                        <div className="flex-1 lg:pl-0 pl-12 flex flex-col justify-center">
                            {breadcrumbs && breadcrumbs.length > 0 ? (
                                <Breadcrumb>
                                    <BreadcrumbList>
                                        {breadcrumbs.map((crumb, index) => {
                                            const isLast = index === breadcrumbs.length - 1;
                                            return (
                                                <Fragment key={crumb.label}>
                                                    <BreadcrumbItem>
                                                        {crumb.href && !isLast ? (
                                                            <BreadcrumbLink render={<Link href={crumb.href} />}>
                                                                {crumb.label}
                                                            </BreadcrumbLink>
                                                        ) : (
                                                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                                        )}
                                                    </BreadcrumbItem>
                                                    {!isLast && <BreadcrumbSeparator />}
                                                </Fragment>
                                            );
                                        })}
                                    </BreadcrumbList>
                                </Breadcrumb>
                            ) : title ? (
                                <h1 className="text-lg font-semibold text-foreground tracking-tight">{title}</h1>
                            ) : null}
                        </div>
                        <div className="flex items-center gap-3">
                            {hasRole('super_admin', 'manager', 'staff', 'finance') && <CommandPalette />}
                            <NotificationBell />
                            <Badge variant="outline" className="hidden sm:inline-flex text-[0.65rem] capitalize">
                                {roleBadge}
                            </Badge>
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6">{children}</div>
                    </div>
                </main>
            </div>
        </TooltipProvider>
    );
}
