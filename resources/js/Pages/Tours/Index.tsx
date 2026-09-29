import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal, Plus, Search, Eye, Edit, Trash2, Filter, X, ArrowUpDown, ArchiveRestore } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

interface PaginatedData<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
}

interface TourPackage {
    id: number;
    package_id: string;
    package_name: string;
    duration_days: number;
    duration_nights: number;
    price: number;
    currency: string;
    status: 'draft' | 'active' | 'inactive' | 'archived';
    created_at: string;
    deleted_at: string | null;
    destination?: {
        country: string;
        city_region: string;
    };
    category?: {
        name: string;
    };
}

interface IndexProps {
    packages: PaginatedData<TourPackage>;
}

export default function ToursIndex({ packages }: IndexProps) {
    const { hasRole } = useAuth();
    const canManage = hasRole('super_admin', 'manager');

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to archive this package?')) {
            router.delete(route('tour-packages.destroy', { tour_package: id }));
        }
    };

    const handleRestore = (id: number) => {
        if (confirm('Are you sure you want to restore this package?')) {
            router.post(route('tour-packages.restore', { id }));
        }
    };

    return (
        <AppLayout
            title="Tour Packages"
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Tour Packages' },
            ]}
        >
            <Head title="Tour Packages" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Tour Packages</h2>
                        <p className="text-muted-foreground">Manage tour offerings, itineraries, and pricing.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {canManage && (
                            <Link href={route('tour-packages.create')}>
                                <Button className="shrink-0 gap-2">
                                    <Plus className="h-4 w-4" />
                                    <span>Create Package</span>
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="font-semibold w-[120px]">Package ID</TableHead>
                                    <TableHead className="font-semibold min-w-[200px]">Name & Type</TableHead>
                                    <TableHead className="font-semibold min-w-[150px]">Destination</TableHead>
                                    <TableHead className="font-semibold">Duration</TableHead>
                                    <TableHead className="font-semibold">Price</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="text-right font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {packages.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                            No packages found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    packages.data.map((pkg) => (
                                        <TableRow key={pkg.id} className="group transition-colors hover:bg-muted/50">
                                            <TableCell className="font-medium text-muted-foreground">
                                                {pkg.package_id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground">{pkg.package_name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {pkg.category?.name || 'Uncategorized'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-medium">{pkg.destination?.country}</span>
                                                    <span className="text-xs text-muted-foreground">{pkg.destination?.city_region}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {pkg.duration_days} Days / {pkg.duration_nights} Nights
                                            </TableCell>
                                            <TableCell>
                                                {pkg.currency} {parseFloat(pkg.price.toString()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`
                                                        ${pkg.status === 'active' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20' : ''}
                                                        ${pkg.status === 'draft' ? 'bg-amber-500/15 text-amber-600 border-amber-500/20' : ''}
                                                        ${pkg.status === 'inactive' ? 'bg-slate-500/15 text-slate-600 border-slate-500/20' : ''}
                                                        ${pkg.status === 'archived' ? 'bg-red-500/15 text-red-600 border-red-500/20' : ''}
                                                    `}
                                                >
                                                    {pkg.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger render={
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    } />
                                                    <DropdownMenuContent align="end" className="w-[160px]">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />

                                                        <Link href={route('tour-packages.show', { tour_package: pkg.id })}>
                                                            <DropdownMenuItem className="cursor-pointer">
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                        </Link>

                                                        {canManage && (
                                                            <Link href={route('tour-packages.edit', { tour_package: pkg.id })}>
                                                                <DropdownMenuItem className="cursor-pointer">
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit Package
                                                                </DropdownMenuItem>
                                                            </Link>
                                                        )}

                                                        {canManage && pkg.status !== 'archived' && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive cursor-pointer"
                                                                    onClick={(e: React.MouseEvent) => {
                                                                        e.preventDefault();
                                                                        handleDelete(pkg.id);
                                                                    }}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Archive
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}

                                                        {canManage && pkg.status === 'archived' && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-emerald-600 focus:text-emerald-700 cursor-pointer"
                                                                    onClick={(e: React.MouseEvent) => {
                                                                        e.preventDefault();
                                                                        handleRestore(pkg.id);
                                                                    }}
                                                                >
                                                                    <ArchiveRestore className="mr-2 h-4 w-4" />
                                                                    Restore
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

                    {packages.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-border/50 px-4 py-3 bg-muted/10 sm:px-6">
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Showing <span className="font-medium">{packages.from}</span> to <span className="font-medium">{packages.to}</span> of{' '}
                                        <span className="font-medium">{packages.total}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        {packages.links.map((link, index) => {
                                            const isPrevious = index === 0;
                                            const isNext = index === packages.links.length - 1;

                                            if (!link.url) {
                                                return (
                                                    <span
                                                        key={index}
                                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-input opacity-50 ${isPrevious ? 'rounded-l-md' : ''
                                                            } ${isNext ? 'rounded-r-md' : ''}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            }

                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border border-input transition-colors ${link.active
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
            </div>
        </AppLayout>
    );
}
