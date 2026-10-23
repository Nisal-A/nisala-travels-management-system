import React, { useState, useEffect, useMemo } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Upload,
    ImageIcon,
    ArrowUp,
    ArrowDown,
    Save,
    AlertCircle,
    Info,
    Calendar,
    DollarSign,
    Layers,
    FileText,
    Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export interface ItineraryItem {
    day: number | string;
    title: string;
    description: string;
}

export interface FaqItem {
    question: string;
    answer: string;
}

export interface DestinationOption {
    id: number;
    country: string;
    city_region: string;
    slug: string;
}

export interface TierConfig {
    label: string;
    description: string;
}

export interface TourPackageData {
    id?: number;
    destination_id?: number | string;
    package_name?: string;
    slug?: string;
    status?: 'active' | 'inactive' | 'archived';
    is_active?: boolean;
    is_featured?: boolean;
    sort_order?: number;

    price?: number | string;
    price_from?: number | string | null;
    currency?: string;
    capacity?: number | string | null;
    available_seats?: number | string | null;
    group_min?: number | string | null;
    group_max?: number | string | null;

    tier?: string | null;

    duration_days?: number | string | null;
    duration_nights?: number | string | null;
    start_date?: string | null;
    end_date?: string | null;
    departure_months?: string[] | null;

    short_description?: string | null;
    description?: string | null;
    highlights?: string[] | null;
    itinerary?: ItineraryItem[] | null;
    included_items?: string | null;
    excluded_items?: string | null;
    hotel_information?: string | null;
    transportation_information?: string | null;
    meals?: string | null;
    terms?: string | null;
    tags?: string[] | null;
    faqs?: FaqItem[] | null;

    hero_image?: string | null;
    gallery?: string[] | null;

    destination?: DestinationOption;
}

interface FormProps {
    tour?: TourPackageData;
    destinations: DestinationOption[];
    tiers: Record<string, TierConfig>;
    allowed_by_destination: Record<string, string[]>;
    isEditing?: boolean;
}

interface GalleryItem {
    id: string;
    type: 'existing' | 'new';
    path?: string;
    file?: File;
    previewUrl: string;
}

const MONTHS_LIST = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

const formatDateForInput = (dateStr?: string | null): string => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
};

export default function TourPackageForm({
    tour,
    destinations = [],
    tiers = {},
    allowed_by_destination = {},
    isEditing = false,
}: FormProps) {
    const page = usePage();
    const serverErrors = (page.props.errors as Record<string, string>) || {};

    const [isDirty, setIsDirty] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Section 1: Basics
    const [destinationId, setDestinationId] = useState<string>(
        tour?.destination_id ? String(tour.destination_id) : '',
    );
    const [packageName, setPackageName] = useState(tour?.package_name || '');
    const [slug, setSlug] = useState(tour?.slug || '');
    const [slugCustomized, setSlugCustomized] = useState(isEditing && Boolean(tour?.slug));
    const [status, setStatus] = useState<'active' | 'inactive' | 'archived'>(tour?.status || 'active');
    const [isActive, setIsActive] = useState<boolean>(tour?.is_active ?? true);
    const [isFeatured, setIsFeatured] = useState<boolean>(tour?.is_featured ?? false);
    const [sortOrder, setSortOrder] = useState<number | string>(tour?.sort_order ?? 0);

    // Section 2: Pricing and seats
    const [price, setPrice] = useState<string>(tour?.price !== undefined && tour?.price !== null ? String(tour.price) : '');
    const [priceFrom, setPriceFrom] = useState<string>(
        tour?.price_from !== undefined && tour?.price_from !== null ? String(tour.price_from) : '',
    );
    const [currency, setCurrency] = useState<string>(tour?.currency || 'LKR');
    const [capacity, setCapacity] = useState<string>(
        tour?.capacity !== undefined && tour?.capacity !== null ? String(tour.capacity) : '',
    );
    const [availableSeats, setAvailableSeats] = useState<string>(
        tour?.available_seats !== undefined && tour?.available_seats !== null ? String(tour.available_seats) : '',
    );
    const [groupMin, setGroupMin] = useState<string>(
        tour?.group_min !== undefined && tour?.group_min !== null ? String(tour.group_min) : '',
    );
    const [groupMax, setGroupMax] = useState<string>(
        tour?.group_max !== undefined && tour?.group_max !== null ? String(tour.group_max) : '',
    );

    // Section 3: Tier
    const [tier, setTier] = useState<string>(tour?.tier || '');

    // Section 4: Duration and dates
    const [durationDays, setDurationDays] = useState<string>(
        tour?.duration_days !== undefined && tour?.duration_days !== null ? String(tour.duration_days) : '',
    );
    const [durationNights, setDurationNights] = useState<string>(
        tour?.duration_nights !== undefined && tour?.duration_nights !== null ? String(tour.duration_nights) : '',
    );
    const [startDate, setStartDate] = useState<string>(formatDateForInput(tour?.start_date));
    const [endDate, setEndDate] = useState<string>(formatDateForInput(tour?.end_date));
    const [departureMonths, setDepartureMonths] = useState<string[]>(tour?.departure_months || []);

    // Section 5: Content
    const [shortDescription, setShortDescription] = useState<string>(tour?.short_description || '');
    const [description, setDescription] = useState<string>(tour?.description || '');
    const [highlights, setHighlights] = useState<string[]>(
        tour?.highlights && tour.highlights.length > 0 ? tour.highlights : [''],
    );
    const [itinerary, setItinerary] = useState<ItineraryItem[]>(
        tour?.itinerary && tour.itinerary.length > 0
            ? tour.itinerary.map((item, idx) => ({
                  day: item.day || idx + 1,
                  title: item.title || '',
                  description: item.description || '',
              }))
            : [{ day: 1, title: '', description: '' }],
    );
    const [includedItems, setIncludedItems] = useState<string>(tour?.included_items || '');
    const [excludedItems, setExcludedItems] = useState<string>(tour?.excluded_items || '');
    const [hotelInformation, setHotelInformation] = useState<string>(tour?.hotel_information || '');
    const [transportationInformation, setTransportationInformation] = useState<string>(
        tour?.transportation_information || '',
    );
    const [meals, setMeals] = useState<string>(tour?.meals || '');
    const [terms, setTerms] = useState<string>(tour?.terms || '');
    const [tags, setTags] = useState<string[]>(tour?.tags && tour.tags.length > 0 ? tour.tags : ['']);
    const [faqs, setFaqs] = useState<FaqItem[]>(
        tour?.faqs && tour.faqs.length > 0
            ? tour.faqs
            : [{ question: '', answer: '' }],
    );

    // Section 6: Images
    const [heroFile, setHeroFile] = useState<File | null>(null);
    const [heroPreview, setHeroPreview] = useState<string>(resolveImageUrl(tour?.hero_image));
    const [removeHero, setRemoveHero] = useState(false);

    const initialGalleryItems: GalleryItem[] = (tour?.gallery || []).map((path, idx) => ({
        id: `existing-${idx}`,
        type: 'existing',
        path,
        previewUrl: resolveImageUrl(path),
    }));
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialGalleryItems);

    // Unsaved changes protection
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty && !isSubmitting) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty, isSubmitting]);

    useEffect(() => {
        const removeBeforeEventListener = router.on('before', (event) => {
            if (isDirty && !isSubmitting) {
                if (!window.confirm('You have unsaved changes. Are you sure you want to leave this page?')) {
                    event.preventDefault();
                }
            }
        });
        return () => removeBeforeEventListener();
    }, [isDirty, isSubmitting]);

    // Destination lookup & allowed tiers
    const selectedDestination = useMemo(() => {
        if (!destinationId) return null;
        return destinations.find((d) => String(d.id) === String(destinationId)) || null;
    }, [destinationId, destinations]);

    const allowedTiersForSelectedDest = useMemo(() => {
        if (!selectedDestination) return [];
        return allowed_by_destination[selectedDestination.slug] || [];
    }, [selectedDestination, allowed_by_destination]);

    // Auto-adjust tier if destination changes and selected tier is not allowed
    const handleDestinationChange = (newDestId: string | null) => {
        const id = newDestId || '';
        setDestinationId(id);
        setIsDirty(true);
        const dest = destinations.find((d) => String(d.id) === String(id));
        if (dest) {
            const allowed = allowed_by_destination[dest.slug] || [];
            if (tier && !allowed.includes(tier)) {
                setTier('');
            }
        } else {
            setTier('');
        }
    };

    // Auto-fill slug from package name if not manually edited
    const handlePackageNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPackageName(val);
        setIsDirty(true);
        if (!slugCustomized) {
            setSlug(slugify(val));
        }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlugCustomized(true);
        setSlug(slugify(e.target.value));
        setIsDirty(true);
    };

    // Auto-calculate duration_nights if duration_days changes
    const handleDurationDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDurationDays(val);
        setIsDirty(true);
        if (val !== '' && !isNaN(Number(val))) {
            const days = parseInt(val, 10);
            if (days > 0 && (durationNights === '' || durationNights === '0')) {
                setDurationNights(String(Math.max(0, days - 1)));
            }
        }
    };

    // Departure months toggle
    const toggleMonth = (month: string) => {
        setIsDirty(true);
        setDepartureMonths((prev) =>
            prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month],
        );
    };

    // Highlights list helpers
    const addHighlight = () => {
        setHighlights((prev) => [...prev, '']);
        setIsDirty(true);
    };
    const updateHighlight = (idx: number, val: string) => {
        setHighlights((prev) => {
            const next = [...prev];
            next[idx] = val;
            return next;
        });
        setIsDirty(true);
    };
    const removeHighlight = (idx: number) => {
        setHighlights((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : ['']));
        setIsDirty(true);
    };

    // Tags list helpers
    const addTag = () => {
        setTags((prev) => [...prev, '']);
        setIsDirty(true);
    };
    const updateTag = (idx: number, val: string) => {
        setTags((prev) => {
            const next = [...prev];
            next[idx] = val;
            return next;
        });
        setIsDirty(true);
    };
    const removeTag = (idx: number) => {
        setTags((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : ['']));
        setIsDirty(true);
    };

    // Itinerary helpers
    const addItineraryRow = () => {
        setItinerary((prev) => [
            ...prev,
            { day: prev.length + 1, title: '', description: '' },
        ]);
        setIsDirty(true);
    };
    const updateItineraryRow = (idx: number, field: keyof ItineraryItem, val: string | number) => {
        setItinerary((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: val };
            return next;
        });
        setIsDirty(true);
    };
    const removeItineraryRow = (idx: number) => {
        setItinerary((prev) =>
            prev.length > 1
                ? prev.filter((_, i) => i !== idx).map((row, i) => ({ ...row, day: i + 1 }))
                : [{ day: 1, title: '', description: '' }],
        );
        setIsDirty(true);
    };

    // FAQs helpers
    const addFaqRow = () => {
        setFaqs((prev) => [...prev, { question: '', answer: '' }]);
        setIsDirty(true);
    };
    const updateFaqRow = (idx: number, field: keyof FaqItem, val: string) => {
        setFaqs((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: val };
            return next;
        });
        setIsDirty(true);
    };
    const removeFaqRow = (idx: number) => {
        setFaqs((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : [{ question: '', answer: '' }]));
        setIsDirty(true);
    };

    // Hero image upload
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
        setIsDirty(true);
    };

    const handleHeroRemove = () => {
        setHeroFile(null);
        setHeroPreview('');
        setRemoveHero(true);
        setIsDirty(true);
    };

    // Gallery upload & reorder
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
        setIsDirty(true);
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
        setIsDirty(true);
    };

    const removeGalleryItem = (index: number) => {
        setGalleryItems((prev) => prev.filter((_, i) => i !== index));
        setIsDirty(true);
    };

    // Client-side validation checks
    const groupMinNum = groupMin !== '' ? Number(groupMin) : null;
    const groupMaxNum = groupMax !== '' ? Number(groupMax) : null;
    const hasGroupSizeError = groupMinNum !== null && groupMaxNum !== null && groupMaxNum < groupMinNum;

    const capacityNum = capacity !== '' ? Number(capacity) : null;
    const availableSeatsNum = availableSeats !== '' ? Number(availableSeats) : null;
    const hasAvailableSeatsError =
        capacityNum !== null && availableSeatsNum !== null && availableSeatsNum > capacityNum;

    // Form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!destinationId) {
            toast.error('Please select a destination.');
            return;
        }
        if (!packageName.trim()) {
            toast.error('Please enter a package name.');
            return;
        }
        if (!price || Number(price) < 0) {
            toast.error('Please enter a valid price.');
            return;
        }
        if (hasGroupSizeError) {
            toast.error('Group max must be greater than or equal to group min.');
            return;
        }
        if (hasAvailableSeatsError) {
            toast.error('Available seats must not exceed capacity.');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();

        // Basics
        formData.append('destination_id', destinationId);
        formData.append('package_name', packageName);
        formData.append('slug', slug);
        formData.append('status', status);
        formData.append('is_active', isActive ? '1' : '0');
        formData.append('is_featured', isFeatured ? '1' : '0');
        if (sortOrder !== '') formData.append('sort_order', String(sortOrder));

        // Pricing and seats
        formData.append('price', price);
        if (priceFrom !== '') formData.append('price_from', priceFrom);
        formData.append('currency', currency);
        if (capacity !== '') formData.append('capacity', capacity);
        if (availableSeats !== '') formData.append('available_seats', availableSeats);
        if (groupMin !== '') formData.append('group_min', groupMin);
        if (groupMax !== '') formData.append('group_max', groupMax);

        // Tier
        if (tier) {
            formData.append('tier', tier);
        } else {
            formData.append('tier', '');
        }

        // Duration and dates
        if (durationDays !== '') formData.append('duration_days', durationDays);
        if (durationNights !== '') formData.append('duration_nights', durationNights);
        if (startDate) formData.append('start_date', startDate);
        if (endDate) formData.append('end_date', endDate);
        departureMonths.forEach((m, idx) => {
            formData.append(`departure_months[${idx}]`, m);
        });

        // Content
        formData.append('short_description', shortDescription);
        formData.append('description', description);
        formData.append('included_items', includedItems);
        formData.append('excluded_items', excludedItems);
        formData.append('hotel_information', hotelInformation);
        formData.append('transportation_information', transportationInformation);
        formData.append('meals', meals);
        formData.append('terms', terms);

        highlights
            .filter((h) => h.trim() !== '')
            .forEach((h, idx) => {
                formData.append(`highlights[${idx}]`, h.trim());
            });

        tags
            .filter((t) => t.trim() !== '')
            .forEach((t, idx) => {
                formData.append(`tags[${idx}]`, t.trim());
            });

        itinerary
            .filter((item) => item.title.trim() !== '' || item.description.trim() !== '')
            .forEach((item, idx) => {
                formData.append(`itinerary[${idx}][day]`, String(item.day));
                formData.append(`itinerary[${idx}][title]`, item.title.trim());
                formData.append(`itinerary[${idx}][description]`, item.description.trim());
            });

        faqs
            .filter((faq) => faq.question.trim() !== '' || faq.answer.trim() !== '')
            .forEach((faq, idx) => {
                formData.append(`faqs[${idx}][question]`, faq.question.trim());
                formData.append(`faqs[${idx}][answer]`, faq.answer.trim());
            });

        // Hero Image
        if (heroFile) {
            formData.append('hero_image', heroFile);
        } else if (removeHero) {
            formData.append('hero_image', '');
        } else if (tour?.hero_image) {
            formData.append('hero_image', tour.hero_image);
        }

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

        if (isEditing && tour?.id) {
            formData.append('_method', 'put');
            router.post(route('tours.update', { tour: tour.id }), formData, {
                forceFormData: true,
                onSuccess: () => {
                    setIsDirty(false);
                    toast.success('Tour Package updated successfully.');
                },
                onError: (errs) => {
                    setIsSubmitting(false);
                    const first = Object.values(errs)[0];
                    toast.error(first || 'Please check the form for errors.');
                },
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post(route('tours.store'), formData, {
                forceFormData: true,
                onSuccess: () => {
                    setIsDirty(false);
                    toast.success('Tour Package created successfully.');
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
        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-16">
            {/* Form Top Navigation Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={route('tours.index')}
                        className={buttonVariants({ variant: 'outline', size: 'icon' })}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {isEditing ? `Edit ${tour?.package_name || 'Tour Package'}` : 'Create Tour Package'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isEditing
                                ? 'Update package pricing, destination tier, itinerary, and content.'
                                : 'Add a new tour package to your travel catalog.'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={route('tours.index')} className={buttonVariants({ variant: 'ghost' })}>
                        Cancel
                    </Link>
                    <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                        <Save className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Package'}
                    </Button>
                </div>
            </div>

            {/* General Server Error Alert */}
            {Object.keys(serverErrors).length > 0 && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                    <div className="space-y-1 text-sm">
                        <p className="font-medium">Please correct the following errors:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                            {Object.entries(serverErrors).map(([key, msg]) => (
                                <li key={key}>{msg}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Section 1: Basics */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        <CardTitle>Basics</CardTitle>
                    </div>
                    <CardDescription>
                        Core tour information, destination assignment, and catalog visibility settings.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Destination */}
                        <div className="space-y-2">
                            <Label htmlFor="destination_id">
                                Destination <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={destinationId}
                                onValueChange={handleDestinationChange}
                            >
                                <SelectTrigger id="destination_id" className={serverErrors.destination_id ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select Destination" />
                                </SelectTrigger>
                                <SelectContent>
                                    {destinations.map((d) => (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            {d.city_region}, {d.country}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {serverErrors.destination_id && (
                                <p className="text-xs text-destructive flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> {serverErrors.destination_id}
                                </p>
                            )}
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">
                                Package Status <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={status}
                                onValueChange={(val) => {
                                    if (val) {
                                        setStatus(val as 'active' | 'inactive' | 'archived');
                                        setIsDirty(true);
                                    }
                                }}
                            >
                                <SelectTrigger id="status" className={serverErrors.status ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                            {serverErrors.status && (
                                <p className="text-xs text-destructive">{serverErrors.status}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Package Name */}
                        <div className="space-y-2">
                            <Label htmlFor="package_name">
                                Package Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="package_name"
                                value={packageName}
                                onChange={handlePackageNameChange}
                                placeholder="e.g. Thailand Island & Culture Escape"
                                className={serverErrors.package_name ? 'border-destructive' : ''}
                            />
                            {serverErrors.package_name && (
                                <p className="text-xs text-destructive">{serverErrors.package_name}</p>
                            )}
                        </div>

                        {/* Slug */}
                        <div className="space-y-2">
                            <Label htmlFor="slug">
                                Slug <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="slug"
                                value={slug}
                                onChange={handleSlugChange}
                                placeholder="auto-generated-slug"
                                className={serverErrors.slug ? 'border-destructive' : ''}
                            />
                            <p className="text-xs text-muted-foreground">
                                Unique URL identifier for public catalogs. Auto-generated from name.
                            </p>
                            {serverErrors.slug && (
                                <p className="text-xs text-destructive">{serverErrors.slug}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 items-center">
                        {/* Sort Order */}
                        <div className="space-y-2">
                            <Label htmlFor="sort_order">Sort Order</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                min="0"
                                value={sortOrder}
                                onChange={(e) => {
                                    setSortOrder(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="0"
                            />
                            <p className="text-xs text-muted-foreground">Display precedence (lower numbers appear first).</p>
                        </div>

                        {/* Is Active */}
                        <div className="flex items-center space-x-3 rounded-lg border p-4 bg-muted/20">
                            <Switch
                                id="is_active"
                                checked={isActive}
                                onCheckedChange={(val) => {
                                    setIsActive(val);
                                    setIsDirty(true);
                                }}
                            />
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active" className="cursor-pointer font-medium">
                                    Published & Active
                                </Label>
                                <p className="text-xs text-muted-foreground">Visible to customers in the catalog</p>
                            </div>
                        </div>

                        {/* Is Featured */}
                        <div className="flex items-center space-x-3 rounded-lg border p-4 bg-muted/20">
                            <Switch
                                id="is_featured"
                                checked={isFeatured}
                                onCheckedChange={(val) => {
                                    setIsFeatured(val);
                                    setIsDirty(true);
                                }}
                            />
                            <div className="space-y-0.5">
                                <Label htmlFor="is_featured" className="cursor-pointer font-medium">
                                    Featured Tour
                                </Label>
                                <p className="text-xs text-muted-foreground">Highlighted on homepage & banners</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 2: Pricing and Seats */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <CardTitle>Pricing and Seats</CardTitle>
                    </div>
                    <CardDescription>
                        Set commercial pricing, capacity limitations, and group booking rules.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Price */}
                        <div className="space-y-2">
                            <Label htmlFor="price">
                                Regular Price <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(e) => {
                                    setPrice(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="e.g. 185000"
                                className={serverErrors.price ? 'border-destructive' : ''}
                            />
                            {serverErrors.price && (
                                <p className="text-xs text-destructive">{serverErrors.price}</p>
                            )}
                        </div>

                        {/* Price From */}
                        <div className="space-y-2">
                            <Label htmlFor="price_from">Price From (Starting at)</Label>
                            <Input
                                id="price_from"
                                type="number"
                                min="0"
                                step="0.01"
                                value={priceFrom}
                                onChange={(e) => {
                                    setPriceFrom(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="Optional starting price"
                            />
                            <p className="text-xs text-muted-foreground">Displays "From LKR ..." in catalogs.</p>
                        </div>

                        {/* Currency */}
                        <div className="space-y-2">
                            <Label htmlFor="currency">
                                Currency <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="currency"
                                value={currency}
                                maxLength={3}
                                onChange={(e) => {
                                    setCurrency(e.target.value.toUpperCase());
                                    setIsDirty(true);
                                }}
                                placeholder="LKR"
                                className={serverErrors.currency ? 'border-destructive' : ''}
                            />
                            {serverErrors.currency && (
                                <p className="text-xs text-destructive">{serverErrors.currency}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                        {/* Capacity */}
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Total Capacity</Label>
                            <Input
                                id="capacity"
                                type="number"
                                min="1"
                                value={capacity}
                                onChange={(e) => {
                                    setCapacity(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="e.g. 20"
                                className={serverErrors.capacity ? 'border-destructive' : ''}
                            />
                        </div>

                        {/* Available Seats */}
                        <div className="space-y-2">
                            <Label htmlFor="available_seats">Available Seats</Label>
                            <Input
                                id="available_seats"
                                type="number"
                                min="0"
                                value={availableSeats}
                                onChange={(e) => {
                                    setAvailableSeats(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="e.g. 15"
                                className={hasAvailableSeatsError || serverErrors.available_seats ? 'border-destructive' : ''}
                            />
                            {hasAvailableSeatsError && (
                                <p className="text-xs text-destructive">Available seats must not exceed capacity.</p>
                            )}
                            {serverErrors.available_seats && (
                                <p className="text-xs text-destructive">{serverErrors.available_seats}</p>
                            )}
                        </div>

                        {/* Group Min */}
                        <div className="space-y-2">
                            <Label htmlFor="group_min">Min Group Size</Label>
                            <Input
                                id="group_min"
                                type="number"
                                min="1"
                                value={groupMin}
                                onChange={(e) => {
                                    setGroupMin(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="e.g. 2"
                            />
                        </div>

                        {/* Group Max */}
                        <div className="space-y-2">
                            <Label htmlFor="group_max">Max Group Size</Label>
                            <Input
                                id="group_max"
                                type="number"
                                min="1"
                                value={groupMax}
                                onChange={(e) => {
                                    setGroupMax(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="e.g. 12"
                                className={hasGroupSizeError || serverErrors.group_max ? 'border-destructive' : ''}
                            />
                            {hasGroupSizeError && (
                                <p className="text-xs text-destructive">Group max must be &gt;= group min.</p>
                            )}
                            {serverErrors.group_max && (
                                <p className="text-xs text-destructive">{serverErrors.group_max}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 3: Tier */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle>Tour Tier</CardTitle>
                    </div>
                    <CardDescription>
                        Select a package luxury classification allowed for the selected destination.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="max-w-md space-y-2">
                        <Label htmlFor="tier">Tier (Optional)</Label>
                        <Select
                            value={tier || '__none__'}
                            onValueChange={(val) => {
                                setTier(!val || val === '__none__' ? '' : val);
                                setIsDirty(true);
                            }}
                            disabled={!selectedDestination || allowedTiersForSelectedDest.length === 0}
                        >
                            <SelectTrigger id="tier" className={serverErrors.tier ? 'border-destructive' : ''}>
                                <SelectValue
                                    placeholder={
                                        !selectedDestination
                                            ? 'Select a destination first'
                                            : allowedTiersForSelectedDest.length === 0
                                            ? 'No tiers available for this destination'
                                            : 'Select tier (optional)'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">None / Standard (No Tier)</SelectItem>
                                {allowedTiersForSelectedDest.map((tierKey) => (
                                    <SelectItem key={tierKey} value={tierKey}>
                                        {tiers[tierKey]?.label || tierKey}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Tier Description or Destination Info */}
                        {tier && tiers[tier] && (
                            <div className="mt-2 text-xs bg-muted/40 border border-border/60 rounded-md p-3 flex items-start gap-2">
                                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold text-foreground">{tiers[tier].label}: </span>
                                    <span className="text-muted-foreground">{tiers[tier].description}</span>
                                </div>
                            </div>
                        )}

                        {selectedDestination && allowedTiersForSelectedDest.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                                Destination <strong>{selectedDestination.city_region}</strong> does not support tiered packages.
                            </p>
                        )}

                        {serverErrors.tier && (
                            <p className="text-xs text-destructive">{serverErrors.tier}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Section 4: Duration and Dates */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <CardTitle>Duration and Dates</CardTitle>
                    </div>
                    <CardDescription>
                        Tour length, schedule dates, and operational departure months.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Duration Days */}
                        <div className="space-y-2">
                            <Label htmlFor="duration_days">Duration (Days)</Label>
                            <Input
                                id="duration_days"
                                type="number"
                                min="1"
                                value={durationDays}
                                onChange={handleDurationDaysChange}
                                placeholder="e.g. 7"
                                className={serverErrors.duration_days ? 'border-destructive' : ''}
                            />
                            {serverErrors.duration_days && (
                                <p className="text-xs text-destructive">{serverErrors.duration_days}</p>
                            )}
                        </div>

                        {/* Duration Nights */}
                        <div className="space-y-2">
                            <Label htmlFor="duration_nights">Duration (Nights)</Label>
                            <Input
                                id="duration_nights"
                                type="number"
                                min="0"
                                value={durationNights}
                                onChange={(e) => {
                                    setDurationNights(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="e.g. 6"
                                className={serverErrors.duration_nights ? 'border-destructive' : ''}
                            />
                            {serverErrors.duration_nights && (
                                <p className="text-xs text-destructive">{serverErrors.duration_nights}</p>
                            )}
                        </div>

                        {/* Start Date */}
                        <div className="space-y-2">
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setIsDirty(true);
                                }}
                                className={serverErrors.start_date ? 'border-destructive' : ''}
                            />
                        </div>

                        {/* End Date */}
                        <div className="space-y-2">
                            <Label htmlFor="end_date">End Date</Label>
                            <Input
                                id="end_date"
                                type="date"
                                min={startDate || undefined}
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setIsDirty(true);
                                }}
                                className={serverErrors.end_date ? 'border-destructive' : ''}
                            />
                            {serverErrors.end_date && (
                                <p className="text-xs text-destructive">{serverErrors.end_date}</p>
                            )}
                        </div>
                    </div>

                    {/* Departure Months */}
                    <div className="space-y-3 pt-2">
                        <Label>Departure Months</Label>
                        <p className="text-xs text-muted-foreground">
                            Click months when this tour regularly departs.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {MONTHS_LIST.map((month) => {
                                const selected = departureMonths.includes(month);
                                return (
                                    <button
                                        key={month}
                                        type="button"
                                        onClick={() => toggleMonth(month)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                                            selected
                                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                                : 'bg-background hover:bg-muted text-muted-foreground border-border'
                                        }`}
                                    >
                                        {month}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 5: Content */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle>Content & Itinerary</CardTitle>
                    </div>
                    <CardDescription>
                        Detailed descriptions, highlights, day-by-day itinerary, inclusions, and FAQs.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Short Description */}
                    <div className="space-y-2">
                        <Label htmlFor="short_description">Short Summary</Label>
                        <Textarea
                            id="short_description"
                            rows={2}
                            value={shortDescription}
                            onChange={(e) => {
                                setShortDescription(e.target.value);
                                setIsDirty(true);
                            }}
                            placeholder="Brief 1-2 sentence hook for cards and listing search results..."
                        />
                    </div>

                    {/* Full Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Full Description / Overview</Label>
                        <Textarea
                            id="description"
                            rows={4}
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                                setIsDirty(true);
                            }}
                            placeholder="Comprehensive narrative about the tour experience, journey, and landscapes..."
                        />
                    </div>

                    {/* Highlights */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Highlights</Label>
                                <p className="text-xs text-muted-foreground">Key experiential attractions of this package.</p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addHighlight}>
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Highlight
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {highlights.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <Input
                                        value={item}
                                        onChange={(e) => updateHighlight(idx, e.target.value)}
                                        placeholder={`Highlight #${idx + 1}`}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeHighlight(idx)}
                                        disabled={highlights.length === 1 && !highlights[0]}
                                        className="text-destructive hover:bg-destructive/10 shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Itinerary */}
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base font-semibold">Itinerary (Day by Day)</Label>
                                <p className="text-xs text-muted-foreground">
                                    Define the day number, title, and activities for each schedule day.
                                </p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addItineraryRow}>
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Day
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {itinerary.map((row, idx) => (
                                <div key={idx} className="p-4 rounded-lg border bg-card/60 space-y-3 relative group">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="font-semibold bg-muted">
                                                Day
                                            </Badge>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={row.day}
                                                onChange={(e) => updateItineraryRow(idx, 'day', e.target.value)}
                                                className="w-20"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                value={row.title}
                                                onChange={(e) => updateItineraryRow(idx, 'title', e.target.value)}
                                                placeholder="Day Title / Activity (e.g. Arrival & Sigiriya Rock)"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItineraryRow(idx)}
                                            className="text-destructive hover:bg-destructive/10 shrink-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Textarea
                                        rows={2}
                                        value={row.description}
                                        onChange={(e) => updateItineraryRow(idx, 'description', e.target.value)}
                                        placeholder="Detailed schedule, sights, stops, and accommodations for this day..."
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Inclusions and Exclusions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                        <div className="space-y-2">
                            <Label htmlFor="included_items">Included Items</Label>
                            <Textarea
                                id="included_items"
                                rows={4}
                                value={includedItems}
                                onChange={(e) => {
                                    setIncludedItems(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="Hotel stays, daily breakfast, transport vehicle, local entrance tickets..."
                            />
                            <p className="text-xs text-muted-foreground">One item per line or separated by commas.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="excluded_items">Excluded Items</Label>
                            <Textarea
                                id="excluded_items"
                                rows={4}
                                value={excludedItems}
                                onChange={(e) => {
                                    setExcludedItems(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="International flights, personal expenses, camera permits, gratuities..."
                            />
                            <p className="text-xs text-muted-foreground">Items travelers need to cover themselves.</p>
                        </div>
                    </div>

                    {/* Logistics and Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="hotel_information">Hotel Information</Label>
                            <Textarea
                                id="hotel_information"
                                rows={3}
                                value={hotelInformation}
                                onChange={(e) => {
                                    setHotelInformation(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="4-star luxury resorts, heritage bungalows..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="transportation_information">Transportation</Label>
                            <Textarea
                                id="transportation_information"
                                rows={3}
                                value={transportationInformation}
                                onChange={(e) => {
                                    setTransportationInformation(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="Private air-conditioned chauffeur car, speedboat..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="meals">Meals</Label>
                            <Textarea
                                id="meals"
                                rows={3}
                                value={meals}
                                onChange={(e) => {
                                    setMeals(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="Daily breakfast and special welcome dinner..."
                            />
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="space-y-2 pt-2">
                        <Label htmlFor="terms">Terms & Cancellation Policy</Label>
                        <Textarea
                            id="terms"
                            rows={3}
                            value={terms}
                            onChange={(e) => {
                                setTerms(e.target.value);
                                setIsDirty(true);
                            }}
                            placeholder="Booking conditions, advance payment rules, and cancellation policies..."
                        />
                    </div>

                    {/* Tags */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Tags</Label>
                                <p className="text-xs text-muted-foreground">Categorization tags (e.g. Wildlife, Beaches, Culture).</p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addTag}>
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Tag
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, idx) => (
                                <div key={idx} className="flex items-center gap-1 bg-muted/60 rounded-md pl-3 pr-1 py-1 border">
                                    <Input
                                        value={tag}
                                        onChange={(e) => updateTag(idx, e.target.value)}
                                        placeholder="Tag name"
                                        className="h-7 w-28 text-xs border-0 bg-transparent p-0 focus-visible:ring-0"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeTag(idx)}
                                        className="text-muted-foreground hover:text-destructive p-1 rounded"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQs */}
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base font-semibold">Frequently Asked Questions (FAQs)</Label>
                                <p className="text-xs text-muted-foreground">Common client questions and answers.</p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addFaqRow}>
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add FAQ
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="p-4 rounded-lg border bg-card/60 space-y-3 relative">
                                    <div className="flex items-center justify-between gap-2">
                                        <Input
                                            value={faq.question}
                                            onChange={(e) => updateFaqRow(idx, 'question', e.target.value)}
                                            placeholder={`Question #${idx + 1} (e.g. Do I need a visa?)`}
                                            className="font-medium"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFaqRow(idx)}
                                            className="text-destructive hover:bg-destructive/10 shrink-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Textarea
                                        rows={2}
                                        value={faq.answer}
                                        onChange={(e) => updateFaqRow(idx, 'answer', e.target.value)}
                                        placeholder="Provide a clear, helpful answer for prospective travelers..."
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 6: Images */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-primary" />
                        <CardTitle>Images</CardTitle>
                    </div>
                    <CardDescription>
                        Hero cover image and gallery collection (JPG, PNG, or WebP; maximum 5 MB per file).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Hero Image */}
                    <div className="space-y-4">
                        <div>
                            <Label className="text-base font-semibold">Hero Image</Label>
                            <p className="text-xs text-muted-foreground">
                                High-resolution main image displayed in headers and tour cards.
                            </p>
                        </div>

                        {heroPreview ? (
                            <div className="relative rounded-xl overflow-hidden border max-w-md aspect-video bg-muted/30 group">
                                <img
                                    src={heroPreview}
                                    alt="Hero Preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Label
                                        htmlFor="hero-upload-replace"
                                        className={buttonVariants({ variant: 'secondary', size: 'sm' }) + ' cursor-pointer'}
                                    >
                                        <Upload className="h-4 w-4 mr-1" /> Replace
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleHeroRemove}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                                    </Button>
                                </div>
                                <input
                                    id="hero-upload-replace"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleHeroChange}
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <div className="max-w-md">
                                <Label
                                    htmlFor="hero-upload"
                                    className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer bg-muted/10 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="mb-1 text-sm font-medium">Click to upload Hero Image</p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP (MAX 5 MB)</p>
                                    </div>
                                    <input
                                        id="hero-upload"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleHeroChange}
                                        className="hidden"
                                    />
                                </Label>
                            </div>
                        )}
                        {serverErrors.hero_image && (
                            <p className="text-xs text-destructive">{serverErrors.hero_image}</p>
                        )}
                    </div>

                    {/* Gallery Images */}
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base font-semibold">Gallery Images</Label>
                                <p className="text-xs text-muted-foreground">
                                    Add multiple photos. Reorder using the arrows. Maximum 5 MB each.
                                </p>
                            </div>
                            <Label
                                htmlFor="gallery-upload"
                                className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' cursor-pointer'}
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Photos
                            </Label>
                            <input
                                id="gallery-upload"
                                type="file"
                                multiple
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleGalleryUpload}
                                className="hidden"
                            />
                        </div>

                        {galleryItems.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed rounded-xl text-muted-foreground">
                                <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No gallery images added yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {galleryItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="relative rounded-lg overflow-hidden border bg-muted/20 group aspect-video flex items-center justify-center"
                                    >
                                        <img
                                            src={item.previewUrl}
                                            alt={`Gallery ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                                            #{index + 1}
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon"
                                                className="h-8 w-8"
                                                disabled={index === 0}
                                                onClick={() => moveGalleryItem(index, 'up')}
                                                title="Move forward"
                                            >
                                                <ArrowUp className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon"
                                                className="h-8 w-8"
                                                disabled={index === galleryItems.length - 1}
                                                onClick={() => moveGalleryItem(index, 'down')}
                                                title="Move backward"
                                            >
                                                <ArrowDown className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => removeGalleryItem(index)}
                                                title="Remove photo"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {serverErrors.gallery && (
                            <p className="text-xs text-destructive">{serverErrors.gallery}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Sticky Bottom Actions Bar */}
            <div className="sticky bottom-4 z-10 bg-card/95 backdrop-blur border shadow-lg rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isDirty && (
                        <Badge variant="outline" className="text-amber-600 bg-amber-500/10 border-amber-500/20">
                            Unsaved changes
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <Link href={route('tours.index')} className={buttonVariants({ variant: 'ghost' })}>
                        Cancel
                    </Link>
                    <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
                        <Save className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Package'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
