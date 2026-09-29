import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Clock, DollarSign, Users, ArrowLeft, Edit, Plus, Info, ListChecks, Bus, Utensils, BedDouble } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface TourPackage {
    id: number;
    package_id: string;
    package_name: string;
    description: string;
    duration_days: number;
    duration_nights: number;
    price: number;
    currency: string;
    capacity: number;
    available_seats: number;
    status: 'draft' | 'active' | 'inactive' | 'archived';
    included_items: string;
    excluded_items: string;
    terms: string;
    created_at: string;
    updated_at: string;
    destination?: {
        country: string;
        city_region: string;
    };
    category?: {
        name: string;
    };
    itineraries: any[];
    created_by?: {
        name: string;
    };
    updated_by?: {
        name: string;
    };
}

interface ShowProps {
    tourPackage: TourPackage;
}

export default function TourPackageShow({ tourPackage }: ShowProps) {
    const { hasRole } = useAuth();
    const canManage = hasRole('super_admin', 'manager');

    const formattedPrice = parseFloat(tourPackage.price.toString()).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20';
            case 'draft': return 'bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-amber-500/20';
            case 'inactive': return 'bg-slate-500/15 text-slate-600 hover:bg-slate-500/25 border-slate-500/20';
            case 'archived': return 'bg-red-500/15 text-red-600 hover:bg-red-500/25 border-red-500/20';
            default: return '';
        }
    };

    return (
        <AppLayout
            title={tourPackage.package_name}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Tour Packages', href: route('tour-packages.index') },
                { label: tourPackage.package_name },
            ]}
        >
            <Head title={tourPackage.package_name} />

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                            <Link href={route('tour-packages.index')}>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                {tourPackage.package_name}
                                <Badge variant="outline" className={getStatusColor(tourPackage.status)}>
                                    {tourPackage.status}
                                </Badge>
                            </h2>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground ml-11">
                            <span className="flex items-center gap-1"><Info className="w-4 h-4" /> {tourPackage.package_id}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {tourPackage.destination?.country} - {tourPackage.destination?.city_region}</span>
                            <span>•</span>
                            <span>Category: {tourPackage.category?.name || 'Uncategorized'}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 ml-11 md:ml-0">
                        {canManage && (
                            <Link href={route('tour-packages.edit', { tour_package: tourPackage.id })}>
                                <Button className="gap-2">
                                    <Edit className="w-4 h-4" /> Edit Package
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column - Details */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Package Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {tourPackage.description ? (
                                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                                        {tourPackage.description}
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No description provided.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ListChecks className="w-5 h-5 text-primary" /> Itinerary Schedule
                                </CardTitle>
                                <CardDescription>Day-by-day plan for the tour</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {tourPackage.itineraries && tourPackage.itineraries.length > 0 ? (
                                    <div className="space-y-6">
                                        {tourPackage.itineraries.map((it, idx) => (
                                            <div key={idx} className="relative pl-6 pb-6 border-l-2 border-primary/20 last:border-0 last:pb-0">
                                                <div className="absolute -left-[9px] top-0 bg-primary/20 text-primary w-4 h-4 rounded-full border-2 border-background" />
                                                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                                                    <h4 className="font-semibold text-lg flex items-center gap-2">
                                                        <Badge>Day {it.day_number}</Badge> {it.title}
                                                    </h4>
                                                    
                                                    {it.description && (
                                                        <p className="text-sm text-muted-foreground">{it.description}</p>
                                                    )}

                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-sm">
                                                        {it.activities && (
                                                            <div className="flex items-start gap-2 text-muted-foreground">
                                                                <ListChecks className="w-4 h-4 mt-0.5 text-primary/70 shrink-0" />
                                                                <span>{it.activities}</span>
                                                            </div>
                                                        )}
                                                        {it.accommodation && (
                                                            <div className="flex items-start gap-2 text-muted-foreground">
                                                                <BedDouble className="w-4 h-4 mt-0.5 text-primary/70 shrink-0" />
                                                                <span>{it.accommodation}</span>
                                                            </div>
                                                        )}
                                                        {it.meals && (
                                                            <div className="flex items-start gap-2 text-muted-foreground">
                                                                <Utensils className="w-4 h-4 mt-0.5 text-primary/70 shrink-0" />
                                                                <span>{it.meals}</span>
                                                            </div>
                                                        )}
                                                        {it.transportation && (
                                                            <div className="flex items-start gap-2 text-muted-foreground">
                                                                <Bus className="w-4 h-4 mt-0.5 text-primary/70 shrink-0" />
                                                                <span>{it.transportation}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
                                        No itinerary defined for this package.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Stats & Meta */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Key Facts</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-md text-primary">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Duration</p>
                                        <p className="text-xs text-muted-foreground">{tourPackage.duration_days} Days, {tourPackage.duration_nights} Nights</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-md text-primary">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Base Price</p>
                                        <p className="text-xs text-muted-foreground">{tourPackage.currency} {formattedPrice}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-md text-primary">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Capacity</p>
                                        <p className="text-xs text-muted-foreground">Max {tourPackage.capacity} Participants</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Inclusions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div>
                                    <h5 className="font-medium mb-1">Included</h5>
                                    {tourPackage.included_items ? (
                                        <p className="text-muted-foreground whitespace-pre-line">{tourPackage.included_items}</p>
                                    ) : (
                                        <p className="text-muted-foreground italic text-xs">Not specified</p>
                                    )}
                                </div>
                                <Separator />
                                <div>
                                    <h5 className="font-medium mb-1">Excluded</h5>
                                    {tourPackage.excluded_items ? (
                                        <p className="text-muted-foreground whitespace-pre-line">{tourPackage.excluded_items}</p>
                                    ) : (
                                        <p className="text-muted-foreground italic text-xs">Not specified</p>
                                    )}
                                </div>
                                <Separator />
                                <div>
                                    <h5 className="font-medium mb-1">Terms & Conditions</h5>
                                    {tourPackage.terms ? (
                                        <p className="text-muted-foreground whitespace-pre-line">{tourPackage.terms}</p>
                                    ) : (
                                        <p className="text-muted-foreground italic text-xs">Standard terms apply</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-xs text-muted-foreground space-y-2">
                                    <div className="flex justify-between">
                                        <span>Created:</span>
                                        <span>{new Date(tourPackage.created_at).toLocaleDateString()} {tourPackage.created_by?.name && `by ${tourPackage.created_by.name}`}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Last Updated:</span>
                                        <span>{new Date(tourPackage.updated_at).toLocaleDateString()} {tourPackage.updated_by?.name && `by ${tourPackage.updated_by.name}`}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
