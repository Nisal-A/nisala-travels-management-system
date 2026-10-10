import { Head, Link, router } from '@inertiajs/react';
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
import { MoreHorizontal, Plus, Search, Edit, Trash2, MapPin, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { PaginatedData } from '@/types';

interface TourPackage {
    id: number;
    destination_id: number;
    package_name: string;
    duration_days: number;
    price: number;
    currency: string;
    status: string;
    destination?: {
        id: number;
        country: string;
        city_region: string;
    };
}

interface Destination {
    id: number;
    country: string;
    city_region: string;
}

interface IndexProps {
    tours: PaginatedData<TourPackage>;
    destinations: Destination[];
    filters: {
        search?: string;
        status?: string;
        destination?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
    };
}

export default function ToursIndex({ tours, destinations, filters }: IndexProps) {
    const { hasRole } = useAuth();

    const [searchQuery, setSearchQuery] = useState(typeof filters?.search === 'string' ? filters.search : '');
    const [statusFilter, setStatusFilter] = useState(typeof filters?.status === 'string' ? filters.status : 'all');
    const [destinationFilter, setDestinationFilter] = useState(
        typeof filters?.destination === 'string' ? filters.destination : 'all',
    );
    const [sortField, setSortField] = useState(typeof filters?.sort === 'string' ? filters.sort : 'created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
        filters?.direction === 'asc' || filters?.direction === 'desc' ? filters.direction : 'desc',
    );

    const canCreate = hasRole('super_admin', 'manager');
    const canDelete = hasRole('super_admin', 'manager');

    const applyFilters = (overrides = {}) => {
        const query = {
            search: searchQuery,
            status: statusFilter === 'all' ? undefined : statusFilter,
            destination: destinationFilter === 'all' ? undefined : destinationFilter,
            sort: sortField,
            direction: sortDirection,
            ...overrides,
        };

        Object.keys(query).forEach((key) => {
            if (query[key as keyof typeof query] === undefined || query[key as keyof typeof query] === '') {
                delete query[key as keyof typeof query];
            }
        });

        router.get(route('tours.index'), query as any, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to archive this tour package?')) {
            router.delete(route('tours.destroy', { tour: id }), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout
            title="Tour Packages"
            breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Tour Packages' }]}
        >
            <Head title="Tour Packages" />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tour Packages</h1>
                    <p className="text-muted-foreground mt-1">Manage tour packages, pricing, and availability.</p>
                </div>
                <div className="flex space-x-2">
                    <Link href={route('destinations.index')} className={buttonVariants({ variant: 'outline' })}>
                        <MapPin className="mr-2 h-4 w-4" /> Manage Destinations
                    </Link>
                    {canCreate && (
                        <Link href={route('tours.create')} className={buttonVariants({ variant: 'default' })}>
                            <Plus className="mr-2 h-4 w-4" /> New Package
                        </Link>
                    )}
                </div>
            </div>

            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                <div className="flex flex-1 items-center space-x-2">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search packages..."
                            className="pl-9 bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Select
                        value={destinationFilter}
                        onValueChange={(v) => {
                            const val = v as string;
                            setDestinationFilter(val);
                            applyFilters({ destination: val });
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[200px] bg-background">
                            <SelectValue placeholder="All Destinations" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Destinations</SelectItem>
                            {destinations.map((dest) => (
                                <SelectItem key={dest.id} value={dest.id.toString()}>
                                    {dest.city_region}, {dest.country}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={statusFilter}
                        onValueChange={(v) => {
                            const val = v as string;
                            setStatusFilter(val);
                            applyFilters({ status: val });
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[150px] bg-background">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[300px]">Package</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!tours || !tours.data || tours.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center">
                                            <MapPin className="h-8 w-8 mb-2 opacity-20" />
                                            <p>No tour packages found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tours.data.map((tour) => (
                                    <TableRow key={tour.id} className="group transition-colors hover:bg-muted/50">
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-semibold text-foreground">
                                                    {tour.package_name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span>
                                                    {tour.destination?.city_region}, {tour.destination?.country}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {tour.duration_days ? `${tour.duration_days} days` : 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium text-sm">
                                                {tour.currency} {Number(tour.price).toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={tour.status === 'active' ? 'default' : 'secondary'}
                                                className={
                                                    tour.status === 'active'
                                                        ? 'bg-success/15 text-success hover:bg-success/25 border-success/20'
                                                        : ''
                                                }
                                            >
                                                {tour.status}
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

                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        onClick={() =>
                                                            router.visit(route('tours.show', { tour: tour.id }))
                                                        }
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>

                                                    {canCreate && (
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                                router.visit(route('tours.edit', { tour: tour.id }))
                                                            }
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit Package
                                                        </DropdownMenuItem>
                                                    )}

                                                    {canDelete && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive cursor-pointer"
                                                                onClick={(e: React.MouseEvent) => {
                                                                    e.preventDefault();
                                                                    handleDelete(tour.id);
                                                                }}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Archive
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
                {(tours?.last_page ?? 0) > 1 && (
                    <div className="flex items-center justify-between border-t border-border/50 px-4 py-3 bg-muted/10 sm:px-6">
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Showing <span className="font-medium">{tours.from}</span> to{' '}
                                    <span className="font-medium">{tours.to}</span> of{' '}
                                    <span className="font-medium">{tours.total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav
                                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                                    aria-label="Pagination"
                                >
                                    {tours.links?.map((link, index) => {
                                        const isPrevious = index === 0;
                                        const isNext = index === (tours.links?.length || 0) - 1;

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
