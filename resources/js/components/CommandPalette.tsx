import React, { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { useAuth } from '@/hooks/use-auth';
import {
    FileText,
    Users,
    CalendarCheck,
    Map,
    CreditCard,
    LayoutDashboard,
    Settings,
    UserCog,
    BarChart3,
    Plus,
    Search,
} from 'lucide-react';
import axios from 'axios';

// Map icon names from backend to Lucide components
const IconMap: Record<string, React.FC<any>> = {
    Users: Users,
    CalendarCheck: CalendarCheck,
    CreditCard: CreditCard,
    Map: Map,
    FileText: FileText,
};

interface SearchResult {
    id: number;
    title: string;
    subtitle: string;
    url: string;
    group: string;
    icon: string;
}

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Record<string, SearchResult[]>>({});
    const [loading, setLoading] = useState(false);
    const { hasRole, user } = useAuth();

    // Quick Actions based on roles
    const quickActions = [];
    if (hasRole('super_admin', 'manager', 'staff')) {
        quickActions.push({ label: 'New Booking', icon: Plus, url: route('bookings.create') });
        quickActions.push({ label: 'New Customer', icon: Plus, url: route('customers.create') });
    }
    if (hasRole('super_admin', 'manager', 'finance')) {
        quickActions.push({ label: 'Go to Reports', icon: BarChart3, url: route('reports.index') });
    }

    // Toggle on Ctrl+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const fetchResults = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults({});
            return;
        }
        setLoading(true);
        try {
            const res = await axios.get(route('admin.search'), { params: { q } });
            const data: SearchResult[] = res.data.data;
            const grouped = data.reduce(
                (acc, item) => {
                    if (!acc[item.group]) acc[item.group] = [];
                    acc[item.group].push(item);
                    return acc;
                },
                {} as Record<string, SearchResult[]>,
            );
            setResults(grouped);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchResults(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, fetchResults]);

    const handleSelect = (url: string) => {
        setOpen(false);
        router.visit(url);
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
            >
                <Search className="h-4 w-4" />
                <span className="hidden lg:inline-flex">Search...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." value={query} onValueChange={setQuery} />
                <CommandList>
                    <CommandEmpty>{loading ? 'Searching...' : 'No results found.'}</CommandEmpty>

                    {query.length < 2 && (
                        <CommandGroup heading="Quick Actions">
                            {quickActions.map((action, i) => {
                                const Icon = action.icon;
                                return (
                                    <CommandItem key={i} onSelect={() => handleSelect(action.url)}>
                                        <Icon className="mr-2 h-4 w-4" />
                                        <span>{action.label}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    )}

                    {Object.entries(results).map(([group, items]) => (
                        <CommandGroup key={group} heading={group}>
                            {items.map((item) => {
                                const Icon = IconMap[item.icon] || FileText;
                                return (
                                    <CommandItem key={`${group}-${item.id}`} onSelect={() => handleSelect(item.url)}>
                                        <Icon className="mr-2 h-4 w-4" />
                                        <div className="flex flex-col">
                                            <span>{item.title}</span>
                                            {item.subtitle && (
                                                <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                                            )}
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    ))}
                </CommandList>
            </CommandDialog>
        </>
    );
}
