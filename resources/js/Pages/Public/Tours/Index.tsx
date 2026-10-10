import { useState, useEffect, useCallback } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Reveal } from '@/components/common/Reveal';
import { Search, Filter, X, Clock, ArrowRight, Frown, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const [searchValue, setSearchValue] = useState(filters.search);
    const [priceMax, setPriceMax] = useState(filters.price_max || '10000');

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

    const setFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        if (key !== 'search' && key !== 'price_max') {
            updateUrl(newFilters);
        }
    };

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
        const newFilters = { destination: '', duration: '', price_min: '', price_max: '', search: '', sort: 'recommended' };
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
    }, []); 

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
            
            {/* Elegant Hero Section */}
            <div className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-neutral-900">
                <div className="absolute inset-0 z-0">
                    <img src="/images/hero/hero-poster.jpg" alt="Beautiful landscape" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/60 via-neutral-900/40 to-neutral-50" />
                </div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 drop-shadow-lg"
                    >
                        Explore the Extraordinary
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-2xl text-white/90 max-w-2xl mx-auto font-light drop-shadow-md"
                    >
                        Discover handpicked journeys that inspire the soul and awaken your sense of adventure.
                    </motion.p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-10 -mt-10 relative z-20">
                {/* Modern Sidebar Filters */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className={`fixed inset-0 z-[100] bg-white p-6 md:p-0 md:bg-transparent md:static md:w-80 flex-shrink-0 transition-transform transform ${showMobileFilters ? 'translate-y-0' : 'translate-y-full md:translate-y-0'} md:translate-y-0 flex flex-col h-full md:h-auto overflow-y-auto md:overflow-visible`}
                >
                    <div className="flex justify-between items-center mb-6 md:hidden">
                        <h2 className="text-xl font-bold font-serif text-neutral-900">Filter Tours</h2>
                        <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-neutral-100 rounded-full"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-10 bg-white/80 backdrop-blur-xl md:border md:border-neutral-100 md:rounded-3xl md:p-8 md:shadow-xl">
                        <div>
                            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Search</h3>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
                                <Input 
                                    type="text" 
                                    placeholder="Find a tour..." 
                                    className="pl-12 h-14 bg-neutral-50/50 border-neutral-200 rounded-2xl focus-visible:ring-primary focus-visible:border-primary transition-all text-base" 
                                    value={searchValue} 
                                    onChange={handleSearchChange} 
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Destination</h3>
                            <div className="space-y-3">
                                {['Sri Lanka', 'Maldives', 'Dubai', 'Singapore', 'Thailand', 'India'].map(dest => (
                                    <label key={dest} className="flex items-center gap-4 cursor-pointer group p-2 rounded-xl hover:bg-neutral-50 transition-colors">
                                        <div className="relative flex items-center justify-center">
                                            <input 
                                                type="checkbox" 
                                                checked={filters.destination === dest} 
                                                onChange={() => setFilter('destination', filters.destination === dest ? '' : dest)} 
                                                className="peer sr-only"
                                            />
                                            <div className="w-5 h-5 border-2 border-neutral-300 rounded-md peer-checked:border-primary peer-checked:bg-primary transition-all" />
                                            <div className="absolute text-white opacity-0 peer-checked:opacity-100">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                        </div>
                                        <span className="text-neutral-600 font-medium group-hover:text-neutral-900 transition-colors">{dest}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Duration</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {['1-3', '4-7', '8+'].map(dur => (
                                    <label key={dur} className={`cursor-pointer text-center py-3 rounded-xl border-2 transition-all font-medium ${filters.duration === dur ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}>
                                        <input 
                                            type="radio" 
                                            name="duration" 
                                            checked={filters.duration === dur} 
                                            onChange={() => setFilter('duration', dur)} 
                                            className="hidden"
                                        />
                                        {dur} Days
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Max Price</h3>
                                <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">${priceMax}</span>
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

                    <div className="mt-auto pt-6 pb-6 md:hidden space-y-4">
                        <Button size="lg" className="w-full rounded-2xl h-14 text-lg" onClick={() => setShowMobileFilters(false)}>Show Results</Button>
                        <Button variant="outline" size="lg" className="w-full rounded-2xl h-14 text-lg" onClick={clearAllFilters}>Clear All</Button>
                    </div>
                </motion.div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-4 rounded-3xl shadow-sm border border-neutral-100">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" className="md:hidden rounded-2xl h-12 px-6" onClick={() => setShowMobileFilters(true)}>
                                <Filter className="w-4 h-4 mr-2" />
                                Filters {activeFilterCount > 0 && <span className="ml-2 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{activeFilterCount}</span>}
                            </Button>
                            <p className="text-neutral-600 font-medium px-4">
                                {loading ? 'Curating tours...' : <><span className="text-neutral-900 font-bold">{tours.length}</span> adventures found</>}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <select 
                                className="w-full sm:w-48 border-neutral-200 rounded-2xl h-12 px-4 text-sm font-medium bg-neutral-50 focus:ring-primary focus:border-primary focus:bg-white transition-colors cursor-pointer"
                                value={filters.sort}
                                onChange={(e) => setFilter('sort', e.target.value)}
                            >
                                <option value="recommended">Sort by Recommended</option>
                                <option value="newest">Newest First</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="duration">Duration</option>
                            </select>
                        </div>
                    </div>

                    {/* Active Filters */}
                    <AnimatePresence>
                        {activeFilterCount > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex flex-wrap items-center gap-3 mb-8"
                            >
                                <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest mr-2">Active:</span>
                                {Object.entries(filters).map(([key, value]) => {
                                    if (!value || key === 'sort' || key === 'price_min') return null;
                                    return (
                                        <motion.span 
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: 1 }}
                                            key={key} 
                                            className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 text-sm font-medium rounded-full text-neutral-700 shadow-sm"
                                        >
                                            {key === 'price_max' ? `Up to $${value}` : key === 'search' ? `"${value}"` : value}
                                            <button onClick={() => removeFilter(key)} className="text-neutral-400 hover:text-primary transition-colors"><X className="w-4 h-4" /></button>
                                        </motion.span>
                                    );
                                })}
                                <button onClick={clearAllFilters} className="text-sm text-neutral-400 hover:text-primary font-bold uppercase tracking-widest ml-2 transition-colors">Clear all</button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Premium Grid */}
                    {loading && page === 1 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-3xl h-[450px] animate-pulse border border-neutral-100 p-6 flex flex-col justify-end shadow-sm">
                                    <div className="h-4 bg-neutral-200 rounded-full w-1/3 mb-4" />
                                    <div className="h-8 bg-neutral-200 rounded-full w-3/4 mb-4" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-32 bg-white rounded-3xl shadow-sm border border-neutral-100">
                            <h3 className="text-2xl font-serif font-bold text-neutral-900 mb-4">Connection Interrupted</h3>
                            <p className="text-neutral-500 mb-8 max-w-md mx-auto">We couldn't load the tours right now. Please check your connection and try again.</p>
                            <Button onClick={() => fetchTours(filters, page)} size="lg" className="rounded-full px-8">Refresh Page</Button>
                        </div>
                    ) : tours.length === 0 ? (
                        <div className="text-center py-32 bg-white rounded-3xl shadow-sm border border-neutral-100 px-4">
                            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-8 h-8 text-neutral-300" />
                            </div>
                            <h3 className="text-3xl font-serif font-bold mb-4 text-neutral-900">No tours found</h3>
                            <p className="text-neutral-500 mb-10 max-w-md mx-auto text-lg">We couldn't find any packages matching your exact criteria. Try broadening your search or exploring our custom trip options.</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg" onClick={clearAllFilters}>Reset filters</Button>
                                <Button render={<Link href="/contact" />} size="lg" className="rounded-full h-14 px-8 text-lg">Request Custom Trip</Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                {tours.map((tour, idx) => (
                                    <Reveal key={tour.id} delay={idx * 0.1}>
                                        <Link href={`/tours/${tour.slug || tour.id}`} className="block group h-full">
                                            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col border border-neutral-100 relative group-hover:-translate-y-2">
                                                <div className="absolute top-6 left-6 z-10">
                                                    <span className="bg-white/90 backdrop-blur-md text-neutral-900 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                                                        {tour.destination}
                                                    </span>
                                                </div>
                                                <div className="h-72 overflow-hidden relative">
                                                    <img 
                                                        src={tour.hero_image || `https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=800&auto=format&fit=crop&random=${tour.id}`} 
                                                        alt={tour.package_name}
                                                        className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                                </div>
                                                <div className="p-8 flex-grow flex flex-col -mt-16 relative z-20 bg-white rounded-t-[2rem]">
                                                    <div className="flex items-center gap-2 text-primary font-bold text-sm mb-3">
                                                        <Clock className="w-4 h-4" /> {tour.duration_days} Days / {tour.duration_days - 1} Nights
                                                    </div>
                                                    <h3 className="text-2xl font-serif font-bold text-neutral-900 mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{tour.package_name}</h3>
                                                    <p className="text-neutral-500 text-base line-clamp-2 mb-8 leading-relaxed flex-grow">{tour.short_description}</p>
                                                    
                                                    <div className="flex items-center justify-between pt-6 border-t border-neutral-100">
                                                        <div>
                                                            <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-widest block mb-1">Starts From</span>
                                                            <span className="text-2xl font-black text-neutral-900">{tour.currency} {tour.price_from?.toLocaleString()}</span>
                                                        </div>
                                                        <div className="w-12 h-12 rounded-full bg-neutral-50 border border-neutral-100 text-neutral-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </Reveal>
                                ))}
                            </div>
                            
                            {hasMore && (
                                <div className="mt-16 text-center">
                                    <Button 
                                        variant="outline" 
                                        size="lg" 
                                        className="rounded-full px-10 h-14 text-lg border-2 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                                        onClick={() => {
                                            const nextPage = page + 1;
                                            setPage(nextPage);
                                            fetchTours(filters, nextPage, true);
                                        }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Loading Adventures...' : 'Load More Experiences'}
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
