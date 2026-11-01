import React, { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { useAuth } from '@/hooks/use-auth';
import {
    FileText,
    Users,
    CalendarCheck,
    Map,
    CreditCard,
    BarChart3,
    Plus,
    Search,
    type LucideIcon,
} from 'lucide-react';
import axios from 'axios';

// Map icon names from backend to Lucide components
const IconMap: Record<string, LucideIcon> = {
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
    const { hasRole } = useAuth();

    const isMac = typeof window !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.platform || navigator.userAgent);

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
                setOpen((prev) => !prev);
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
                type="button"
                onClick={() => setOpen(true)}
                className="relative hidden sm:flex items-center w-64 h-9 rounded-lg bg-muted pl-10 pr-3 text-sm text-muted-foreground transition-colors hover:text-foreground text-left focus-visible:outline-none focus-visible:ring-2 ring-ring cursor-pointer"
            >
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <span className="truncate">Search...</span>
                <span className="hidden md:flex items-center gap-1 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <kbd className="text-[10px] border border-border rounded px-1.5 py-0.5 bg-card font-mono text-muted-foreground leading-none">
                        {isMac ? '⌘' : 'Ctrl'}
                    </kbd>
                    <kbd className="text-[10px] border border-border rounded px-1.5 py-0.5 bg-card font-mono text-muted-foreground leading-none">
                        K
                    </kbd>
                </span>
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
