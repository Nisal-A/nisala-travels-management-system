import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Upload,
    ImageIcon,
    ArrowUp,
    ArrowDown,
    Save,
    Check,
    AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export interface DestinationFact {
    label: string;
    value: string;
}

export interface DestinationData {
    id?: number;
    country: string;
    city_region: string;
    slug: string;
    listing_state: 'live' | 'coming_soon' | 'hidden';
    status: 'active' | 'inactive';
    region?: string | null;
    tagline?: string | null;
    description?: string | null;
    travel_information?: string | null;
    best_months?: string | null;
    highlights?: string[] | null;
    facts?: DestinationFact[] | null;
    recommendations?: string[] | null;
    sort_order?: number;
    hero_image?: string | null;
    gallery?: string[] | null;
    tour_packages_count?: number;
}

interface FormProps {
    destination?: DestinationData;
    isEditing?: boolean;
}

interface GalleryItem {
    id: string;
    type: 'existing' | 'new';
    path?: string;
    file?: File;
    previewUrl: string;
}

const slugify = (text: string) =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

const resolveImageUrl = (path?: string | null): string => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
        return path;
    }
    return `/storage/${path}`;
};

export default function DestinationForm({ destination, isEditing = false }: FormProps) {
    const page = usePage();
    const serverErrors = page.props.errors as Record<string, string>;

    const [country, setCountry] = useState(destination?.country || '');
    const [cityRegion, setCityRegion] = useState(destination?.city_region || '');
    const [slug, setSlug] = useState(destination?.slug || '');
    const [slugCustomized, setSlugCustomized] = useState(isEditing && Boolean(destination?.slug));
    const [listingState, setListingState] = useState<'live' | 'coming_soon' | 'hidden'>(
        destination?.listing_state || 'live',
    );
    const [status, setStatus] = useState<'active' | 'inactive'>(destination?.status || 'active');
    const [region, setRegion] = useState<string>(destination?.region || 'none');
    const [tagline, setTagline] = useState(destination?.tagline || '');
    const [description, setDescription] = useState(destination?.description || '');
    const [travelInformation, setTravelInformation] = useState(destination?.travel_information || '');
    const [bestMonths, setBestMonths] = useState(destination?.best_months || '');
    const [sortOrder, setSortOrder] = useState<number>(destination?.sort_order ?? 0);

    // Dynamic Lists
    const [highlights, setHighlights] = useState<string[]>(
        destination?.highlights && destination.highlights.length > 0 ? destination.highlights : [''],
    );
    const [facts, setFacts] = useState<DestinationFact[]>(
        destination?.facts && destination.facts.length > 0
            ? destination.facts
            : [{ label: '', value: '' }],
    );
    const [recommendations, setRecommendations] = useState<string[]>(
        destination?.recommendations && destination.recommendations.length > 0
            ? destination.recommendations
            : [''],
    );

    // Hero Image
    const [heroFile, setHeroFile] = useState<File | null>(null);
    const [heroPreview, setHeroPreview] = useState<string>(resolveImageUrl(destination?.hero_image));
    const [removeHero, setRemoveHero] = useState(false);

    // Gallery
    const initialGalleryItems: GalleryItem[] = (destination?.gallery || []).map((path, idx) => ({
        id: `existing-${idx}`,
        type: 'existing',
        path,
        previewUrl: resolveImageUrl(path),
    }));
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialGalleryItems);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // City / Region name change handler auto-fills slug
    const handleCityRegionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCityRegion(val);
        if (!slugCustomized) {
            setSlug(slugify(val));
        }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlugCustomized(true);
        setSlug(slugify(e.target.value));
    };

    // Hero Image Upload
    const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Hero image must not exceed 5 MB.');
            return;
        }
        setHeroFile(file);
        setHeroPreview(URL.createObjectURL(file));
        setRemoveHero(false);
    };

    const handleHeroRemove = () => {
        setHeroFile(null);
        setHeroPreview('');
        setRemoveHero(true);
    };

    // Gallery Upload
    const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        const oversized = files.filter((f) => f.size > 5 * 1024 * 1024);
        if (oversized.length > 0) {
            toast.error('Each gallery image must not exceed 5 MB.');
            return;
        }

        const newItems: GalleryItem[] = files.map((file, idx) => ({
            id: `new-${Date.now()}-${idx}`,
            type: 'new',
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setGalleryItems((prev) => [...prev, ...newItems]);
        e.target.value = '';
    };

    const moveGalleryItem = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= galleryItems.length) return;

        setGalleryItems((prev) => {
            const next = [...prev];
            const temp = next[index];
            next[index] = next[targetIndex];
            next[targetIndex] = temp;
            return next;
        });
    };

    const removeGalleryItem = (index: number) => {
        setGalleryItems((prev) => prev.filter((_, i) => i !== index));
    };

    // Dynamic Lists operations
    const addHighlight = () => setHighlights((prev) => [...prev, '']);
    const updateHighlight = (index: number, val: string) => {
        setHighlights((prev) => {
            const next = [...prev];
            next[index] = val;
            return next;
        });
    };
    const removeHighlight = (index: number) =>
        setHighlights((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : ['']));

    const addFact = () => setFacts((prev) => [...prev, { label: '', value: '' }]);
    const updateFact = (index: number, field: 'label' | 'value', val: string) => {
        setFacts((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: val };
            return next;
        });
    };
    const removeFact = (index: number) =>
        setFacts((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [{ label: '', value: '' }]));

    const addRecommendation = () => setRecommendations((prev) => [...prev, '']);
    const updateRecommendation = (index: number, val: string) => {
        setRecommendations((prev) => {
            const next = [...prev];
            next[index] = val;
            return next;
        });
    };
    const removeRecommendation = (index: number) =>
        setRecommendations((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : ['']));

    // Form Submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();

        formData.append('country', country);
        formData.append('city_region', cityRegion);
        formData.append('slug', slug);
        formData.append('listing_state', listingState);
        formData.append('status', status);
        if (region && region !== 'none') {
            formData.append('region', region);
        }
        formData.append('tagline', tagline);
        formData.append('description', description);
        formData.append('travel_information', travelInformation);
        formData.append('best_months', bestMonths);
        formData.append('sort_order', String(sortOrder));

        // Hero Image
        if (heroFile) {
            formData.append('hero_image', heroFile);
        } else if (removeHero) {
            formData.append('hero_image', '');
        } else if (destination?.hero_image) {
            formData.append('hero_image', destination.hero_image);
        }

        // Highlights
        highlights
            .filter((h) => h.trim() !== '')
            .forEach((h, idx) => {
                formData.append(`highlights[${idx}]`, h.trim());
            });

        // Facts
        facts
            .filter((f) => f.label.trim() !== '' || f.value.trim() !== '')
            .forEach((f, idx) => {
                formData.append(`facts[${idx}][label]`, f.label.trim());
                formData.append(`facts[${idx}][value]`, f.value.trim());
            });

        // Recommendations
        recommendations
            .filter((r) => r.trim() !== '')
            .forEach((r, idx) => {
                formData.append(`recommendations[${idx}]`, r.trim());
            });

        // Gallery & Order
        const existingPaths: string[] = [];
        const newFilesList: File[] = [];

        galleryItems.forEach((item) => {
            if (item.type === 'existing' && item.path) {
                existingPaths.push(item.path);
            } else if (item.type === 'new' && item.file) {
                newFilesList.push(item.file);
            }
        });

        existingPaths.forEach((path, idx) => {
            formData.append(`gallery[${idx}]`, path);
        });

        newFilesList.forEach((file, idx) => {
            formData.append(`gallery_files[${idx}]`, file);
        });

        galleryItems.forEach((item, idx) => {
            if (item.type === 'existing' && item.path) {
                const existingIdx = existingPaths.indexOf(item.path);
                formData.append(`gallery_order[${idx}]`, `existing:${existingIdx}`);
            } else if (item.type === 'new' && item.file) {
                const newIdx = newFilesList.indexOf(item.file);
                formData.append(`gallery_order[${idx}]`, `new:${newIdx}`);
            }
        });

        if (isEditing && destination?.id) {
            formData.append('_method', 'put');
            router.post(route('destinations.update', { destination: destination.id }), formData, {
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Destination updated successfully.');
                },
                onError: (errs) => {
                    setIsSubmitting(false);
                    const first = Object.values(errs)[0];
                    toast.error(first || 'Please check the form for errors.');
                },
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post(route('destinations.store'), formData, {
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Destination created successfully.');
                },
                onError: (errs) => {
                    setIsSubmitting(false);
                    const first = Object.values(errs)[0];
                    toast.error(first || 'Please check the form for errors.');
                },
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={route('destinations.index')}
                        className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Destinations
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {isEditing ? `Edit ${destination?.city_region}` : 'New Destination'}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={route('destinations.index')}
                        className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                    >
                        Cancel
                    </Link>
                    <Button type="submit" disabled={isSubmitting} className="min-w-[130px]">
                        <Save className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Saving...' : isEditing ? 'Update Destination' : 'Save Destination'}
                    </Button>
                </div>
            </div>

            {Object.keys(serverErrors).length > 0 && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold mb-1">There were problems with your submission:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                            {Object.entries(serverErrors).map(([key, msg]) => (
                                <li key={key}>
                                    <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span> {msg}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Primary destination identification and visibility parameters.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="city_region">
                                City / Region (Name) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="city_region"
                                placeholder="e.g. Bangkok, Jaipur, Malé"
                                value={cityRegion}
                                onChange={handleCityRegionChange}
                                required
                            />
                            {serverErrors.city_region && (
                                <p className="text-xs text-destructive">{serverErrors.city_region}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">
                                Country <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="country"
                                placeholder="e.g. Thailand, India, Maldives"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                required
                            />
                            {serverErrors.country && (
                                <p className="text-xs text-destructive">{serverErrors.country}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="slug">
                                    Slug <span className="text-destructive">*</span>
                                </Label>
                                <span className="text-xs text-muted-foreground">Used in public URLs</span>
                            </div>
                            <Input
                                id="slug"
                                placeholder="e.g. bangkok, jaipur"
                                value={slug}
                                onChange={handleSlugChange}
                                required
                            />
                            {serverErrors.slug && <p className="text-xs text-destructive">{serverErrors.slug}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tagline">Tagline</Label>
                            <Input
                                id="tagline"
                                placeholder="e.g. Ancient temples and turquoise island waters"
                                value={tagline}
                                onChange={(e) => setTagline(e.target.value)}
                            />
                            {serverErrors.tagline && <p className="text-xs text-destructive">{serverErrors.tagline}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="listing_state">
                                Listing State <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={listingState}
                                onValueChange={(val) => {
                                    if (val) setListingState(val as 'live' | 'coming_soon' | 'hidden');
                                }}
                            >
                                <SelectTrigger id="listing_state">
                                    <SelectValue placeholder="Select listing state" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="live">Live (Catalog Active)</SelectItem>
                                    <SelectItem value="coming_soon">Coming Soon (Preview)</SelectItem>
                                    <SelectItem value="hidden">Hidden (Draft)</SelectItem>
                                </SelectContent>
                            </Select>
                            {serverErrors.listing_state && (
                                <p className="text-xs text-destructive">{serverErrors.listing_state}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">
                                Operational Status <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={status}
                                onValueChange={(val) => {
                                    if (val) setStatus(val as 'active' | 'inactive');
                                }}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            {serverErrors.status && <p className="text-xs text-destructive">{serverErrors.status}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="region">Geographic Region</Label>
                            <Select value={region} onValueChange={(val) => setRegion(val || 'none')}>
                                <SelectTrigger id="region">
                                    <SelectValue placeholder="Select region" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None / Not Specified</SelectItem>
                                    <SelectItem value="south-asia">South Asia</SelectItem>
                                    <SelectItem value="southeast-asia">Southeast Asia</SelectItem>
                                </SelectContent>
                            </Select>
                            {serverErrors.region && <p className="text-xs text-destructive">{serverErrors.region}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sort_order">Sort Order</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                min={0}
                                value={sortOrder}
                                onChange={(e) => setSortOrder(Number(e.target.value))}
                            />
                            {serverErrors.sort_order && (
                                <p className="text-xs text-destructive">{serverErrors.sort_order}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content & Descriptions */}
            <Card>
                <CardHeader>
                    <CardTitle>Content & Travel Guide</CardTitle>
                    <CardDescription>Detailed overview and travel guidance for travellers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="description">Overview Description</Label>
                        <Textarea
                            id="description"
                            rows={4}
                            placeholder="Introduce this destination to prospective guests..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        {serverErrors.description && (
                            <p className="text-xs text-destructive">{serverErrors.description}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="travel_information">Travel Information & Logistics</Label>
                        <Textarea
                            id="travel_information"
                            rows={3}
                            placeholder="Getting there, visa requirements, altitude, local tips..."
                            value={travelInformation}
                            onChange={(e) => setTravelInformation(e.target.value)}
                        />
                        {serverErrors.travel_information && (
                            <p className="text-xs text-destructive">{serverErrors.travel_information}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="best_months">Best Months to Visit</Label>
                        <Input
                            id="best_months"
                            placeholder="e.g. December – April (Dry season)"
                            value={bestMonths}
                            onChange={(e) => setBestMonths(e.target.value)}
                        />
                        {serverErrors.best_months && (
                            <p className="text-xs text-destructive">{serverErrors.best_months}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Media: Hero & Gallery */}
            <Card>
                <CardHeader>
                    <CardTitle>Media & Photography</CardTitle>
                    <CardDescription>
                        JPG, PNG, or WebP format, up to 5 MB each. Saved securely on the public storage disk.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Hero Image */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Hero Banner Image</Label>
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            {heroPreview ? (
                                <div className="relative group w-full sm:w-64 h-40 rounded-lg overflow-hidden border shadow-sm bg-muted flex items-center justify-center">
                                    <img
                                        src={heroPreview}
                                        alt="Hero Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleHeroRemove}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-90 hover:opacity-100 shadow transition-opacity"
                                        title="Remove hero image"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full sm:w-64 h-40 rounded-lg border-2 border-dashed border-border/80 flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                                    <ImageIcon className="h-10 w-10 mb-2 opacity-40" />
                                    <span className="text-xs">No hero image uploaded</span>
                                </div>
                            )}

                            <div className="flex-1 space-y-2">
                                <Label
                                    htmlFor="hero_file_input"
                                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border rounded-md shadow-sm text-sm font-medium hover:bg-accent transition-colors"
                                >
                                    <Upload className="h-4 w-4" /> Select Hero Image
                                </Label>
                                <input
                                    id="hero_file_input"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleHeroChange}
                                    className="hidden"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Recommended dimensions: 1920 × 1080px. High resolution panoramic photos work best.
                                </p>
                                {serverErrors.hero_image && (
                                    <p className="text-xs text-destructive">{serverErrors.hero_image}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Gallery Uploads */}
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base font-medium">Gallery Photos</Label>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Reorder photos using the arrows. They will display in this order in the public gallery.
                                </p>
                            </div>
                            <div>
                                <Label
                                    htmlFor="gallery_files_input"
                                    className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 border rounded-md shadow-sm text-sm font-medium hover:bg-accent transition-colors"
                                >
                                    <Plus className="h-4 w-4" /> Add Photos
                                </Label>
                                <input
                                    id="gallery_files_input"
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleGalleryUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {galleryItems.length === 0 ? (
                            <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground bg-muted/10">
                                <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No gallery photos added yet.</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Click "Add Photos" to upload JPG, PNG, or WebP images.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {galleryItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="group relative rounded-lg overflow-hidden border bg-card shadow-sm flex flex-col"
                                    >
                                        <div className="aspect-video w-full overflow-hidden bg-muted flex items-center justify-center">
                                            <img
                                                src={item.previewUrl}
                                                alt={`Gallery ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-2 bg-background flex items-center justify-between border-t text-xs">
                                            <span className="font-mono text-muted-foreground">#{index + 1}</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    disabled={index === 0}
                                                    onClick={() => moveGalleryItem(index, 'up')}
                                                    className="p-1 rounded hover:bg-accent disabled:opacity-30"
                                                    title="Move earlier"
                                                >
                                                    <ArrowUp className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={index === galleryItems.length - 1}
                                                    onClick={() => moveGalleryItem(index, 'down')}
                                                    className="p-1 rounded hover:bg-accent disabled:opacity-30"
                                                    title="Move later"
                                                >
                                                    <ArrowDown className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeGalleryItem(index)}
                                                    className="p-1 rounded text-destructive hover:bg-destructive/10"
                                                    title="Remove image"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Highlights, Facts, Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Highlights */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div>
                            <CardTitle className="text-lg">Highlights</CardTitle>
                            <CardDescription>Top attractions and key sights.</CardDescription>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addHighlight}>
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {highlights.map((highlight, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <Input
                                    placeholder={`Highlight #${idx + 1}`}
                                    value={highlight}
                                    onChange={(e) => updateHighlight(idx, e.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeHighlight(idx)}
                                    className="text-muted-foreground hover:text-destructive h-9 w-9 flex-shrink-0"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div>
                            <CardTitle className="text-lg">Recommendations</CardTitle>
                            <CardDescription>Local tips and recommended experiences.</CardDescription>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addRecommendation}>
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recommendations.map((rec, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <Input
                                    placeholder={`Recommendation #${idx + 1}`}
                                    value={rec}
                                    onChange={(e) => updateRecommendation(idx, e.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeRecommendation(idx)}
                                    className="text-muted-foreground hover:text-destructive h-9 w-9 flex-shrink-0"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Facts Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                        <CardTitle className="text-lg">Fast Facts</CardTitle>
                        <CardDescription>Key metadata points (e.g. Currency, Language, Timezone, Climate).</CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addFact}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Fact Row
                    </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                    {facts.map((fact, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                            <div className="sm:col-span-5">
                                <Input
                                    placeholder="Label (e.g. Currency)"
                                    value={fact.label}
                                    onChange={(e) => updateFact(idx, 'label', e.target.value)}
                                />
                            </div>
                            <div className="sm:col-span-6">
                                <Input
                                    placeholder="Value (e.g. Sri Lankan Rupee (LKR))"
                                    value={fact.value}
                                    onChange={(e) => updateFact(idx, 'value', e.target.value)}
                                />
                            </div>
                            <div className="sm:col-span-1 flex justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeFact(idx)}
                                    className="text-muted-foreground hover:text-destructive h-9 w-9"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Link href={route('destinations.index')} className={buttonVariants({ variant: 'outline' })}>
                    Cancel
                </Link>
                <Button type="submit" disabled={isSubmitting} size="lg" className="min-w-[160px]">
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Saving...' : isEditing ? 'Update Destination' : 'Create Destination'}
                </Button>
            </div>
        </form>
    );
}
