import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Plus, Search, Edit, Trash2, MapPin, ExternalLink, Package } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { PaginatedData, PageProps } from '@/types';
import { toast } from 'sonner';

export interface DestinationItem {
    id: number;
    country: string;
    city_region: string;
    slug: string;
    listing_state: 'live' | 'coming_soon' | 'hidden';
    status: 'active' | 'inactive';
    region?: string | null;
    tagline?: string | null;
    hero_image?: string | null;
    tour_packages_count?: number;
    created_at?: string;
}

interface IndexProps {
    destinations: PaginatedData<DestinationItem>;
    filters: {
        search?: string;
        status?: string;
        listing_state?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
    };
}

export default function DestinationsIndex({ destinations, filters }: IndexProps) {
    const { hasRole } = useAuth();
    const { flash } = usePage<PageProps>().props;

    const [searchQuery, setSearchQuery] = useState(typeof filters?.search === 'string' ? filters.search : '');
    const [statusFilter, setStatusFilter] = useState(typeof filters?.status === 'string' ? filters.status : 'all');
    const [listingStateFilter, setListingStateFilter] = useState(
        typeof filters?.listing_state === 'string' ? filters.listing_state : 'all',
    );
    const [sortField, setSortField] = useState(typeof filters?.sort === 'string' ? filters.sort : 'created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
        filters?.direction === 'asc' || filters?.direction === 'desc' ? filters.direction : 'desc',
    );

    const canManage = hasRole('super_admin', 'manager', 'staff');

    const applyFilters = (overrides = {}) => {
        const query: Record<string, string | undefined> = {
            search: searchQuery || undefined,
            status: statusFilter === 'all' ? undefined : statusFilter,
            listing_state: listingStateFilter === 'all' ? undefined : listingStateFilter,
            sort: sortField,
            direction: sortDirection,
            ...overrides,
        };

        Object.keys(query).forEach((key) => {
            if (query[key] === undefined || query[key] === '') {
                delete query[key];
            }
        });

        router.get(route('destinations.index'), query as any, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    const handleDelete = (destination: DestinationItem) => {
        if (destination.tour_packages_count && destination.tour_packages_count > 0) {
            toast.error('Remove or move its tours first.');
            return;
        }

        if (confirm(`Are you sure you want to delete ${destination.city_region}, ${destination.country}?`)) {
            router.delete(route('destinations.destroy', { destination: destination.id }), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Destination removed successfully.');
                },
                onError: (errs) => {
                    const msg = errs.error || 'Remove or move its tours first.';
                    toast.error(msg);
                },
            });
        }
    };

    const renderListingStateBadge = (state: string) => {
        switch (state) {
            case 'live':
                return (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Live
                    </Badge>
                );
            case 'coming_soon':
                return (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Coming Soon
                    </Badge>
                );
            case 'hidden':
            default:
                return (
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                        Hidden
                    </Badge>
                );
        }
    };

    return (
        <AppLayout
            title="Destinations"
            breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Destinations' }]}
        >
            <Head title="Destinations" />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Destinations</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage geographic locations, marketing assets, and catalogue visibility.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Link href={route('tours.index')} className={buttonVariants({ variant: 'outline' })}>
                        <Package className="mr-2 h-4 w-4" /> Tour Packages
                    </Link>
                    {canManage && (
                        <Link href={route('destinations.create')} className={buttonVariants({ variant: 'default' })}>
                            <Plus className="mr-2 h-4 w-4" /> New Destination
                        </Link>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                <div className="flex flex-1 items-center space-x-2">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by city, country, or slug..."
                            className="pl-9 bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Select
                        value={listingStateFilter}
                        onValueChange={(v) => {
                            const val = v || 'all';
                            setListingStateFilter(val);
                            applyFilters({ listing_state: val === 'all' ? undefined : val });
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[170px] bg-background">
                            <SelectValue placeholder="All Listing States" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Listing States</SelectItem>
                            <SelectItem value="live">Live</SelectItem>
                            <SelectItem value="coming_soon">Coming Soon</SelectItem>
                            <SelectItem value="hidden">Hidden</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={statusFilter}
                        onValueChange={(v) => {
                            const val = v || 'all';
                            setStatusFilter(val);
                            applyFilters({ status: val === 'all' ? undefined : val });
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[150px] bg-background">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Destinations Table */}
            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[300px]">Destination</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Listing State</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Tours</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!destinations || !destinations.data || destinations.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center">
                                            <MapPin className="h-8 w-8 mb-2 opacity-20" />
                                            <p>No destinations found matching criteria.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                destinations.data.map((destination) => (
                                    <TableRow
                                        key={destination.id}
                                        className="group transition-colors hover:bg-muted/50"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {destination.hero_image ? (
                                                    <div className="w-12 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0 border">
                                                        <img
                                                            src={
                                                                destination.hero_image.startsWith('http') ||
                                                                destination.hero_image.startsWith('/')
                                                                    ? destination.hero_image
                                                                    : `/storage/${destination.hero_image}`
                                                            }
                                                            alt={destination.city_region}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-10 rounded-md bg-muted/60 border flex items-center justify-center text-muted-foreground flex-shrink-0">
                                                        <MapPin className="h-5 w-5 opacity-40" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground">
                                                        {destination.city_region}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {destination.country}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {destination.slug}
                                            </span>
                                        </TableCell>

                                        <TableCell>{renderListingStateBadge(destination.listing_state)}</TableCell>

                                        <TableCell>
                                            <Badge
                                                variant={destination.status === 'active' ? 'default' : 'secondary'}
                                                className={
                                                    destination.status === 'active'
                                                        ? 'bg-success/15 text-success hover:bg-success/25 border-success/20'
                                                        : ''
                                                }
                                            >
                                                {destination.status}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="font-semibold">
                                                {destination.tour_packages_count ?? 0}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    render={
                                                        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </button>
                                                    }
                                                />
                                                <DropdownMenuContent align="end" className="w-[160px]">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />

                                                    {canManage && (
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                                router.visit(
                                                                    route('destinations.edit', {
                                                                        destination: destination.id,
                                                                    }),
                                                                )
                                                            }
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                    )}

                                                    {canManage && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive cursor-pointer"
                                                                onClick={(e: React.MouseEvent) => {
                                                                    e.preventDefault();
                                                                    handleDelete(destination);
                                                                }}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {(destinations?.last_page ?? 0) > 1 && (
                    <div className="flex items-center justify-between border-t border-border/50 px-4 py-3 bg-muted/10 sm:px-6">
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Showing <span className="font-medium">{destinations.from}</span> to{' '}
                                    <span className="font-medium">{destinations.to}</span> of{' '}
                                    <span className="font-medium">{destinations.total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav
                                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                                    aria-label="Pagination"
                                >
                                    {destinations.links?.map((link, index) => {
                                        const isPrevious = index === 0;
                                        const isNext = index === (destinations.links?.length || 0) - 1;

                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={index}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-input opacity-50 ${
                                                        isPrevious ? 'rounded-l-md' : ''
                                                    } ${isNext ? 'rounded-r-md' : ''}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        }

                                        return (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border border-input transition-colors ${
                                                    link.active
                                                        ? 'z-10 bg-primary text-primary-foreground border-primary focus:z-20'
                                                        : 'bg-background text-foreground hover:bg-muted focus:z-20'
                                                } ${isPrevious ? 'rounded-l-md' : ''} ${isNext ? 'rounded-r-md' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
