import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { FormEventHandler } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface TourPackage {
    id?: number;
    package_name: string;
    destination_id: number | string;
    tour_category_id: number | string;
    description: string;
    duration_days: number | string;
    duration_nights: number | string;
    price: number | string;
    currency: string;
    capacity: number | string;
    status: 'draft' | 'active' | 'inactive' | 'archived';
    included_items: string;
    excluded_items: string;
    terms: string;
    itineraries: any[];
}

interface FormProps {
    tourPackage?: TourPackage;
    destinations: any[];
    categories: any[];
}

export default function TourPackageForm({ tourPackage, destinations, categories }: FormProps) {
    const isEditing = !!tourPackage?.id;
    const { hasRole } = useAuth();
    
    // Redirect if not authorized
    if (!hasRole('super_admin', 'manager')) {
        return (
            <AppLayout title="Unauthorized">
                <div className="p-8 text-center text-red-500">You are not authorized to access this page.</div>
            </AppLayout>
        );
    }

    const { data, setData, post, put, processing, errors } = useForm<TourPackage>({
        package_name: tourPackage?.package_name || '',
        destination_id: tourPackage?.destination_id || '',
        tour_category_id: tourPackage?.tour_category_id || '',
        description: tourPackage?.description || '',
        duration_days: tourPackage?.duration_days || 1,
        duration_nights: tourPackage?.duration_nights || 0,
        price: tourPackage?.price || '',
        currency: tourPackage?.currency || 'LKR',
        capacity: tourPackage?.capacity || 10,
        status: tourPackage?.status || 'draft',
        included_items: tourPackage?.included_items || '',
        excluded_items: tourPackage?.excluded_items || '',
        terms: tourPackage?.terms || '',
        itineraries: tourPackage?.itineraries || [],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            put(route('tour-packages.update', { tour_package: tourPackage.id }));
        } else {
            post(route('tour-packages.store'));
        }
    };

    const addItineraryDay = () => {
        const nextDayNumber = data.itineraries.length + 1;
        setData('itineraries', [
            ...data.itineraries,
            {
                day_number: nextDayNumber,
                title: '',
                activities: '',
                accommodation: '',
                meals: '',
                transportation: '',
                description: '',
                notes: '',
            }
        ]);
    };

    const removeItineraryDay = (index: number) => {
        const newItineraries = [...data.itineraries];
        newItineraries.splice(index, 1);
        
        // Re-number days
        newItineraries.forEach((it, i) => {
            it.day_number = i + 1;
        });
        
        setData('itineraries', newItineraries);
    };

    const updateItineraryDay = (index: number, field: string, value: any) => {
        const newItineraries = [...data.itineraries];
        newItineraries[index][field] = value;
        setData('itineraries', newItineraries);
    };

    return (
        <AppLayout
            title={isEditing ? 'Edit Tour Package' : 'Create Tour Package'}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Tour Packages', href: route('tour-packages.index') },
                { label: isEditing ? 'Edit' : 'Create' },
            ]}
        >
            <Head title={isEditing ? 'Edit Tour Package' : 'Create Tour Package'} />

            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('tour-packages.index')}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                {isEditing ? 'Edit Tour Package' : 'Create Tour Package'}
                            </h2>
                            <p className="text-muted-foreground">
                                {isEditing ? 'Update existing package details.' : 'Add a new tour package to the system.'}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    {/* Basic Details */}
                    <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
                        <h3 className="text-lg font-semibold border-b pb-2">Basic Details</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="package_name">Package Name *</Label>
                                <Input
                                    id="package_name"
                                    value={data.package_name}
                                    onChange={(e) => setData('package_name', e.target.value)}
                                    placeholder="e.g. 5 Days Culture Tour"
                                    required
                                />
                                {errors.package_name && <p className="text-sm text-destructive">{errors.package_name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select value={data.status} onValueChange={(val: any) => setData('status', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="destination_id">Destination *</Label>
                                <Select value={data.destination_id.toString()} onValueChange={(val) => setData('destination_id', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Destination" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {destinations.map((d) => (
                                            <SelectItem key={d.id} value={d.id.toString()}>
                                                {d.country} - {d.city_region}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.destination_id && <p className="text-sm text-destructive">{errors.destination_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tour_category_id">Tour Category *</Label>
                                <Select value={data.tour_category_id.toString()} onValueChange={(val) => setData('tour_category_id', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.tour_category_id && <p className="text-sm text-destructive">{errors.tour_category_id}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">General Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Write a brief overview of this tour package..."
                                rows={4}
                            />
                            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                        </div>
                    </div>

                    {/* Pricing & Capacity */}
                    <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
                        <h3 className="text-lg font-semibold border-b pb-2">Pricing, Duration & Availability</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="duration_days">Days *</Label>
                                <Input
                                    id="duration_days"
                                    type="number"
                                    min="1"
                                    value={data.duration_days}
                                    onChange={(e) => setData('duration_days', e.target.value)}
                                    required
                                />
                                {errors.duration_days && <p className="text-sm text-destructive">{errors.duration_days}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration_nights">Nights *</Label>
                                <Input
                                    id="duration_nights"
                                    type="number"
                                    min="0"
                                    value={data.duration_nights}
                                    onChange={(e) => setData('duration_nights', e.target.value)}
                                    required
                                />
                                {errors.duration_nights && <p className="text-sm text-destructive">{errors.duration_nights}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency *</Label>
                                <Select value={data.currency} onValueChange={(val) => setData('currency', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LKR">LKR</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.currency && <p className="text-sm text-destructive">{errors.currency}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Base Price *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    required
                                />
                                {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="capacity">Max Participants *</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    min="1"
                                    value={data.capacity}
                                    onChange={(e) => setData('capacity', e.target.value)}
                                    required
                                />
                                {errors.capacity && <p className="text-sm text-destructive">{errors.capacity}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Terms & Inclusions */}
                    <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
                        <h3 className="text-lg font-semibold border-b pb-2">Terms & Details</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="included_items">Included Items</Label>
                                <Textarea
                                    id="included_items"
                                    value={data.included_items}
                                    onChange={(e) => setData('included_items', e.target.value)}
                                    placeholder="List included items (e.g. Meals, Transport)..."
                                    rows={4}
                                />
                                {errors.included_items && <p className="text-sm text-destructive">{errors.included_items}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="excluded_items">Excluded Items</Label>
                                <Textarea
                                    id="excluded_items"
                                    value={data.excluded_items}
                                    onChange={(e) => setData('excluded_items', e.target.value)}
                                    placeholder="List excluded items..."
                                    rows={4}
                                />
                                {errors.excluded_items && <p className="text-sm text-destructive">{errors.excluded_items}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="terms">Terms & Conditions</Label>
                            <Textarea
                                id="terms"
                                value={data.terms}
                                onChange={(e) => setData('terms', e.target.value)}
                                placeholder="Specific terms for this package..."
                                rows={3}
                            />
                            {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}
                        </div>
                    </div>

                    {/* Itineraries */}
                    <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="text-lg font-semibold">Itinerary Days</h3>
                            <Button type="button" variant="outline" size="sm" onClick={addItineraryDay} className="gap-2">
                                <Plus className="w-4 h-4" /> Add Day
                            </Button>
                        </div>

                        {data.itineraries.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                No itineraries added yet. Click "Add Day" to begin.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {data.itineraries.map((itinerary, index) => (
                                    <div key={index} className="relative border rounded-lg p-5 bg-muted/20 flex gap-4">
                                        <div className="pt-2 text-muted-foreground cursor-move">
                                            <GripVertical className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold flex items-center gap-2">
                                                    <span className="bg-primary/10 text-primary w-6 h-6 flex items-center justify-center rounded-full text-xs">
                                                        {itinerary.day_number}
                                                    </span> 
                                                    Day {itinerary.day_number}
                                                </h4>
                                                <Button 
                                                    type="button" 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                                                    onClick={() => removeItineraryDay(index)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label>Title *</Label>
                                                    <Input 
                                                        value={itinerary.title}
                                                        onChange={(e) => updateItineraryDay(index, 'title', e.target.value)}
                                                        placeholder="e.g. Arrival in Colombo"
                                                        required
                                                    />
                                                    {/* Error mapping for arrays requires custom handling or looking at specific index */}
                                                    {errors[`itineraries.${index}.title` as keyof typeof errors] && (
                                                        <p className="text-sm text-destructive">{errors[`itineraries.${index}.title` as keyof typeof errors]}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Activities</Label>
                                                    <Input 
                                                        value={itinerary.activities || ''}
                                                        onChange={(e) => updateItineraryDay(index, 'activities', e.target.value)}
                                                        placeholder="Main activities"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Accommodation</Label>
                                                    <Input 
                                                        value={itinerary.accommodation || ''}
                                                        onChange={(e) => updateItineraryDay(index, 'accommodation', e.target.value)}
                                                        placeholder="Hotel name/type"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Meals</Label>
                                                    <Input 
                                                        value={itinerary.meals || ''}
                                                        onChange={(e) => updateItineraryDay(index, 'meals', e.target.value)}
                                                        placeholder="e.g. Breakfast, Dinner"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Transportation</Label>
                                                    <Input 
                                                        value={itinerary.transportation || ''}
                                                        onChange={(e) => updateItineraryDay(index, 'transportation', e.target.value)}
                                                        placeholder="e.g. Private AC Car"
                                                    />
                                                </div>

                                                <div className="space-y-2 md:col-span-2">
                                                    <Label>Detailed Description</Label>
                                                    <Textarea 
                                                        value={itinerary.description || ''}
                                                        onChange={(e) => updateItineraryDay(index, 'description', e.target.value)}
                                                        placeholder="Describe the day's full itinerary..."
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-4 border-t pt-6">
                        <Link href={route('tour-packages.index')}>
                            <Button variant="outline" type="button">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing} className="gap-2">
                            <Save className="w-4 h-4" />
                            {isEditing ? 'Save Changes' : 'Create Package'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
