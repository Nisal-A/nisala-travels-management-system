import { useState, useEffect, useCallback } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Reveal } from '@/components/common/Reveal';
import { Search, Filter, X, ArrowRight, Frown } from 'lucide-react';
import axios from 'axios';
import { TourPackageCard, TourPackageCardSkeleton } from '@/components/public/TourPackageCard';

function debounce<TArgs extends unknown[]>(func: (...args: TArgs) => void, wait: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return function executedFunction(...args: TArgs) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export default function ToursIndex() {
    const { url } = usePage();
    const queryParams = new URLSearchParams(window.location.search);
    
    const [filters, setFilters] = useState({
        destination: queryParams.get('destination') || '',
        duration: queryParams.get('duration_range') || '',
        price_min: queryParams.get('price_min') || '',
        price_max: queryParams.get('price_max') || '',
        search: queryParams.get('search') || '',
        sort: queryParams.get('sort') || 'recommended'
    });

    const [tours, setTours] = useState<any[]>([]);
    const [destinations, setDestinations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Filter UI States
    const [searchValue, setSearchValue] = useState(filters.search);
    const [priceMax, setPriceMax] = useState(filters.price_max || '10000');

    // Debounced URL Updater
    const updateUrl = useCallback(
        debounce((newFilters: any) => {
            const params = new URLSearchParams();
            Object.entries(newFilters).forEach(([key, value]) => {
                if (value && value !== 'recommended') params.set(key, value as string);
            });
            router.get(`/tours`, Object.fromEntries(params), { preserveState: true, replace: true, preserveScroll: true });
            setPage(1);
            fetchTours(newFilters, 1);
        }, 500),
        []
    );

    // Update specific filter
    const setFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        if (key !== 'search' && key !== 'price_max') {
            updateUrl(newFilters);
        }
    };

    // Remove specific filter
    const removeFilter = (key: string) => {
        setFilter(key, '');
        if (key === 'search') {
            setSearchValue('');
            updateUrl({ ...filters, search: '' });
        }
        if (key === 'price_max') {
            setPriceMax('10000');
            updateUrl({ ...filters, price_max: '' });
        }
    };

    const clearAllFilters = () => {
        const newFilters = { destination: '', level: '', duration: '', price_min: '', price_max: '', search: '', sort: 'recommended' };
        setFilters(newFilters);
        setSearchValue('');
        setPriceMax('10000');
        updateUrl(newFilters);
        setShowMobileFilters(false);
    };

    const fetchTours = async (currentFilters: any, currentPage: number, append = false) => {
        setLoading(true);
        setError(false);
        try {
            const params: any = { page: currentPage };
            if (currentFilters.destination) params.destination = currentFilters.destination;
            if (currentFilters.level) params.level = currentFilters.level;
            if (currentFilters.search) params.search = currentFilters.search;
            if (currentFilters.price_min) params.price_min = currentFilters.price_min;
            if (currentFilters.price_max) params.price_max = currentFilters.price_max;
            if (currentFilters.sort) params.sort = currentFilters.sort;
            
            if (currentFilters.duration === '1-3') { params.duration_min = 1; params.duration_max = 3; }
            if (currentFilters.duration === '4-7') { params.duration_min = 4; params.duration_max = 7; }
            if (currentFilters.duration === '8+') { params.duration_min = 8; }

            const res = await axios.get('/api/public/tours', { params });
            if (append) {
                setTours(prev => [...prev, ...res.data.data]);
            } else {
                setTours(res.data.data);
            }
            setHasMore(res.data.meta.current_page < res.data.meta.last_page);
        } catch (e) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTours(filters, 1);
        axios.get('/api/public/destinations').then(res => setDestinations(res.data)).catch(console.error);
    }, []); // Only initial fetch, subsequent handled by updateUrl

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
        setFilters(prev => ({...prev, search: e.target.value}));
        updateUrl({ ...filters, search: e.target.value });
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPriceMax(e.target.value);
        setFilters(prev => ({...prev, price_max: e.target.value}));
        updateUrl({ ...filters, price_max: e.target.value });
    };

    const activeFilterCount = Object.entries(filters).filter(([k, v]) => v !== '' && v !== 'recommended' && k !== 'sort').length;

    return (
        <PublicLayout>
            <Head title="Tour Packages | Nisala Travels" />
            
            <div className="bg-neutral-900 pt-32 pb-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                <div className="container mx-auto text-center text-white relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Our Tours</h1>
                    <p className="text-lg text-neutral-300">Find the perfect package for your next adventure</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
                {/* Desktop Sidebar / Mobile Sheet */}
                <div className={`fixed inset-0 z-[100] bg-white p-6 md:p-0 md:bg-transparent md:static md:w-72 flex-shrink-0 transition-transform transform ${showMobileFilters ? 'translate-y-0' : 'translate-y-full md:translate-y-0'} md:translate-y-0 flex flex-col h-full md:h-auto overflow-y-auto md:overflow-visible`}>
                    <div className="flex justify-between items-center mb-6 md:hidden">
                        <h2 className="text-xl font-bold">Filters</h2>
                        <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-neutral-100 rounded-full"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-8 bg-white md:border md:border-neutral-200 md:rounded-2xl md:p-6 md:shadow-sm">
                        <div>
                            <h3 className="font-semibold mb-3 text-neutral-900">Search</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <Input type="text" placeholder="Search tours..." className="pl-9 h-11" value={searchValue} onChange={handleSearchChange} />
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3 text-neutral-900">Destination</h3>
                            <select 
                                className="w-full border-neutral-200 rounded-lg h-11 px-3 bg-white focus:ring-primary focus:border-primary"
                                value={filters.destination}
                                onChange={(e) => setFilter('destination', e.target.value)}
                            >
                                <option value="">All Destinations</option>
                                {Array.from(new Set(destinations.map(d => d.country))).filter(Boolean).map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3 text-neutral-900">Level</h3>
                            <select 
                                className="w-full border-neutral-200 rounded-lg h-11 px-3 bg-white focus:ring-primary focus:border-primary"
                                value={filters.level || ''}
                                onChange={(e) => setFilter('level', e.target.value)}
                            >
                                <option value="">All Levels</option>
                                <option value="Luxury">Luxury</option>
                                <option value="Semi Luxury">Semi Luxury</option>
                            </select>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3 text-neutral-900">Duration</h3>
                            <div className="space-y-3">
                                {['', '1-3', '4-7', '8+'].map(dur => (
                                    <label key={dur} className="flex items-center gap-3 cursor-pointer group">
                                        <input 
                                            type="radio" 
                                            name="duration" 
                                            checked={filters.duration === dur} 
                                            onChange={() => setFilter('duration', dur)} 
                                            className="w-4 h-4 text-primary border-neutral-300 focus:ring-primary"
                                        />
                                        <span className="text-neutral-600 group-hover:text-neutral-900">{dur === '' ? 'Any Duration' : `${dur} Days`}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-neutral-900">Max Price</h3>
                                <span className="text-sm font-bold text-primary">${priceMax}</span>
                            </div>
                            <input 
                                type="range" 
                                min="100" 
                                max="10000" 
                                step="100" 
                                value={priceMax} 
                                onChange={handlePriceChange} 
                                className="w-full accent-primary h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="mt-auto pt-6 pb-6 md:hidden">
                        <Button size="lg" className="w-full mb-3 rounded-full" onClick={() => setShowMobileFilters(false)}>Show Results</Button>
                        <Button variant="outline" size="lg" className="w-full rounded-full" onClick={clearAllFilters}>Clear All</Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-neutral-100 pb-4">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="md:hidden rounded-full" onClick={() => setShowMobileFilters(true)}>
                                <Filter className="w-4 h-4 mr-2" />
                                Filters {activeFilterCount > 0 && <span className="ml-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{activeFilterCount}</span>}
                            </Button>
                            <p className="text-neutral-600 hidden md:block">
                                {loading ? 'Searching...' : `Found ${tours.length} ${tours.length === 1 ? 'tour' : 'tours'}`}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            <span className="text-sm text-neutral-500 font-medium hidden sm:inline">Sort by:</span>
                            <select 
                                className="border-neutral-200 rounded-lg h-10 px-3 text-sm bg-white focus:ring-primary focus:border-primary"
                                value={filters.sort}
                                onChange={(e) => setFilter('sort', e.target.value)}
                            >
                                <option value="recommended">Recommended</option>
                                <option value="newest">Newest First</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="duration">Duration</option>
                            </select>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {activeFilterCount > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                            <span className="text-sm text-neutral-500 mr-1">Active filters:</span>
                            {Object.entries(filters).map(([key, value]) => {
                                if (!value || key === 'sort' || key === 'price_min') return null;
                                return (
                                    <span key={key} className="inline-flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 px-3 py-1.5 text-sm font-medium rounded-full text-neutral-700">
                                        {key === 'price_max' ? `Up to $${value}` : key === 'search' ? `"${value}"` : value}
                                        <button onClick={() => removeFilter(key)} className="text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-200 p-0.5"><X className="w-3 h-3" /></button>
                                    </span>
                                );
                            })}
                            <button onClick={clearAllFilters} className="text-sm text-primary font-medium hover:underline ml-2">Clear all</button>
                        </div>
                    )}

                    {/* Grid */}
                    {loading && page === 1 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <TourPackageCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-neutral-100">
                            <h3 className="text-xl font-bold mb-2">Something went wrong</h3>
                            <p className="text-neutral-500 mb-6">We couldn't load the tours. Please check your connection.</p>
                            <Button onClick={() => fetchTours(filters, page)}>Try Again</Button>
                        </div>
                    ) : tours.length === 0 ? (
                        <div className="text-center py-24 bg-neutral-50 rounded-2xl border border-neutral-100 px-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <Frown className="w-8 h-8 text-neutral-300" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-neutral-900">No tours match your filters</h3>
                            <p className="text-neutral-500 mb-8 max-w-md mx-auto">We couldn't find any packages matching your exact criteria. Try broadening your search or adjusting the filters.</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button variant="outline" size="lg" className="rounded-full" onClick={clearAllFilters}>Clear all filters</Button>
                                <Button render={<Link href="/contact" />} size="lg" className="rounded-full">Ask for a custom trip</Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {tours.map(tour => {
                                    // Derive level from package name as a fallback for display since schema lacks it
                                    let level = undefined;
                                    const lowerName = tour.package_name?.toLowerCase() || '';
                                    if (lowerName.includes('semi luxury')) level = 'Semi Luxury';
                                    else if (lowerName.includes('luxury')) level = 'Luxury';
                                    
                                    return <TourPackageCard key={tour.id} tour={tour} level={level} />;
                                })}
                            </div>
                            
                            {hasMore && (
                                <div className="mt-12 text-center">
                                    <Button 
                                        variant="outline" 
                                        size="lg" 
                                        className="rounded-full px-8 h-12"
                                        onClick={() => {
                                            const nextPage = page + 1;
                                            setPage(nextPage);
                                            fetchTours(filters, nextPage, true);
                                        }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Loading...' : 'Load More Tours'}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
