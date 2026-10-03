import { Link, useForm, usePage } from '@inertiajs/react';
import { useAuth } from '@/hooks/use-auth';
import { Globe, LogOut, LayoutDashboard, CalendarCheck, FileText, CreditCard, UserRound } from 'lucide-react';
import { FormEvent, ReactNode } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface CustomerPortalLayoutProps {
    children: ReactNode;
    title?: string;
}

const NAV_LINKS = [
    { name: 'Dashboard', href: 'portal.dashboard', icon: LayoutDashboard },
    { name: 'Bookings', href: 'portal.bookings.index', icon: CalendarCheck },
    { name: 'Documents', href: 'portal.documents.index', icon: FileText },
    { name: 'Payments', href: 'portal.payments.index', icon: CreditCard },
    { name: 'Profile', href: 'portal.profile.edit', icon: UserRound },
];

export default function CustomerPortalLayout({ children, title }: CustomerPortalLayoutProps) {
    const { user } = useAuth();
    const { post, processing } = useForm({});
    const currentUrl = usePage().url;

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

    return (
        <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
            {/* Desktop Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link
                            href={route('portal.dashboard')}
                            className="flex items-center gap-2 transition-opacity hover:opacity-80"
                        >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                                <Globe className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-foreground hidden sm:inline-block">
                                Nisala Travels
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {NAV_LINKS.map((link) => {
                                const active = isActive(link.href);
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={route(link.href)}
                                        className={cn(
                                            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                                            active
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                        <Avatar className="h-9 w-9 border border-primary/10">
                                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    render={
                                        <Link href={route('portal.profile.edit')} className="cursor-pointer w-full">
                                            Profile Settings
                                        </Link>
                                    }
                                />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    disabled={processing}
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    {processing ? 'Logging out...' : 'Log out'}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-6xl animate-in fade-in duration-500 slide-in-from-bottom-4">
                {title && (
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                    </div>
                )}
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-safe">
                <nav className="flex items-center justify-around p-2">
                    {NAV_LINKS.map((link) => {
                        const active = isActive(link.href);
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={route(link.href)}
                                className={cn(
                                    'flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-xl transition-colors',
                                    active
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                                )}
                            >
                                <div
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200',
                                        active ? 'bg-primary/10' : 'bg-transparent',
                                    )}
                                >
                                    <Icon className={cn('h-5 w-5', active && 'fill-primary/20')} />
                                </div>
                                <span className="text-[10px] font-medium">{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
