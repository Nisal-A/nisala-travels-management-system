import { SEOHead } from '@/components/public/SEOHead';
import { useState, useEffect, useRef } from 'react';
import {  Link } from '@inertiajs/react';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/common/Reveal';
import { Clock, MapPin, Check, X as XIcon, Users, Calendar, ChevronRight, CheckCircle2 } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';
import useEmblaCarousel from 'embla-carousel-react';

export default function TourDetail({ slug }: { slug: string }) {
    const [tour, setTour] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    // Lightbox
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Mobile sticky bar visibility
    const [isPriceCardVisible, setIsPriceCardVisible] = useState(true);
    const priceCardRef = useRef<HTMLDivElement>(null);

    // Related tours
    const [relatedTours, setRelatedTours] = useState<any[]>([]);
    const [relatedRef] = useEmblaCarousel({ loop: false, align: 'start' });

    useEffect(() => {
        setLoading(true);
        axios.get(`/api/public/tours/${slug}`)
            .then(res => {
                setTour(res.data.data);
                setLoading(false);
                
                // Fetch related tours based on destination
                axios.get('/api/public/tours', { params: { destination: res.data.data.destination } })
                    .then(r => {
                        setRelatedTours(r.data.data.filter((t: any) => t.id !== res.data.data.id).slice(0, 4));
                    });
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, [slug]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsPriceCardVisible(entry.isIntersecting);
            },
            { threshold: 0 }
        );
        if (priceCardRef.current) {
            observer.observe(priceCardRef.current);
        }
        return () => observer.disconnect();
    }, [loading]);

    // Keyboard navigation for lightbox
    useEffect(() => {
        if (!lightboxOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightboxOpen(false);
            if (e.key === 'ArrowRight') setActiveImageIndex(prev => (prev + 1) % images.length);
            if (e.key === 'ArrowLeft') setActiveImageIndex(prev => (prev - 1 + images.length) % images.length);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen]);

    if (loading) {
        return (
            <PublicLayout>
                <div className="min-h-screen pt-24 pb-16 px-4 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-brand-navy border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-neutral-500 font-medium">Loading tour details...</p>
                </div>
            </PublicLayout>
        );
    }

    if (error || !tour) {
        return (
            <PublicLayout>
                <div className="min-h-[80vh] flex flex-col items-center justify-center pt-20 pb-16 px-4 text-center">
                    <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
                        <MapPin className="w-8 h-8 text-neutral-300" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4 text-neutral-900">Tour Not Found</h1>
                    <p className="text-lg text-neutral-500 mb-8 max-w-md">We couldn't find the tour you're looking for. It may have been removed, sold out, or deactivated.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button render={<Link href="/tours" />} size="lg" className="rounded-full px-8">Browse all tours</Button>
                        <Button render={<Link href="/contact" />} variant="outline" size="lg" className="rounded-full px-8">Contact Support</Button>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    const images = [
        tour.hero_image || 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=1200&auto=format&fit=crop',
        ...(Array.isArray(tour.gallery) ? tour.gallery : [])
    ];
    
    // Mock days for accordion (since DB schema doesn't have an itinerary table)
    const itineraryDays = Array.from({length: tour.duration_days}).map((_, i) => ({
        day: `Day ${i + 1}`,
        title: i === 0 ? 'Arrival & Welcome' : i === tour.duration_days - 1 ? 'Departure' : `Exploring the Wonders`,
        content: `Enjoy a guided experience filled with local culture, scenic views, and premium accommodations. Meals and transport are fully arranged. Our expert local guides will ensure you see the hidden gems alongside the famous landmarks.`
    }));

    return (
        <PublicLayout>
            <SEOHead title={tour.package_name} description={tour.short_description || tour.description.substring(0, 150)} image={tour.hero_image} url={`/our-tours/${tour.slug}`} />
            
            {/* Breadcrumbs */}
            <div className="bg-neutral-50 pt-24 pb-4 px-4 border-b border-neutral-200">
                <div className="container mx-auto flex items-center gap-2 text-sm text-neutral-500 font-medium">
                    <Link href="/" className="hover:text-brand-navy transition-colors">Home</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link href="/tours" className="hover:text-brand-navy transition-colors">Tours</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-neutral-900 truncate">{tour.package_name}</span>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 md:py-12">
                {/* Header & Gallery */}
                <div className="mb-12">
                    <Reveal>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                            <div className="flex-1">
                                <div className="inline-flex items-center gap-1.5 bg-brand-navy/10 text-brand-navy font-bold px-3 py-1 rounded-full text-sm mb-4">
                                    <MapPin className="w-4 h-4" /> {tour.destination}
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900 leading-tight">{tour.package_name}</h1>
                            </div>
                            <div className="text-left md:text-right w-full md:w-auto bg-neutral-50 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none">
                                <p className="text-sm text-neutral-500 font-medium mb-1">Starting from</p>
                                <p className="text-3xl font-black text-neutral-900">{tour.currency} {tour.price_from?.toLocaleString()}</p>
                                <p className="text-xs text-neutral-500 mt-1">per person, double occupancy</p>
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[50vh] md:h-[60vh] min-h-[400px]">
                            <div className="lg:col-span-3 relative group rounded-3xl overflow-hidden cursor-pointer" onClick={() => { setActiveImageIndex(0); setLightboxOpen(true); }}>
                                <img src={images[0]} alt={tour.package_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="eager" />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-neutral-900 text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                                    View Gallery
                                </div>
                            </div>
                            <div className="hidden lg:grid grid-rows-2 gap-4">
                                {images.slice(1, 3).map((img, i) => (
                                    <div key={i} className="relative group rounded-3xl overflow-hidden cursor-pointer" onClick={() => { setActiveImageIndex(i+1); setLightboxOpen(true); }}>
                                        <img src={img} alt={`Gallery ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                        {i === 1 && images.length > 3 && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xl backdrop-blur-sm">
                                                +{images.length - 3} More
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Reveal>
                </div>

                {/* Main Content & Sidebar */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                    <div className="flex-1 lg:max-w-[calc(100%-420px)]">
                        <Reveal>
                            <div className="flex flex-wrap gap-4 mb-10 pb-10 border-b border-neutral-200">
                                <div className="flex items-center gap-3 bg-neutral-50 px-5 py-3 rounded-2xl border border-neutral-100">
                                    <div className="w-10 h-10 bg-brand-navy/10 rounded-full flex items-center justify-center text-brand-navy"><Clock className="w-5 h-5" /></div>
                                    <div>
                                        <div className="text-xs text-neutral-500 font-semibold">DURATION</div>
                                        <div className="font-bold text-neutral-900">{tour.duration_days} Days</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-neutral-50 px-5 py-3 rounded-2xl border border-neutral-100">
                                    <div className="w-10 h-10 bg-brand-navy/10 rounded-full flex items-center justify-center text-brand-navy"><Users className="w-5 h-5" /></div>
                                    <div>
                                        <div className="text-xs text-neutral-500 font-semibold">TOUR TYPE</div>
                                        <div className="font-bold text-neutral-900">Private / Tailored</div>
                                    </div>
                                </div>
                                {tour.available_seats !== null && (
                                    <div className="flex items-center gap-3 bg-green-50 px-5 py-3 rounded-2xl border border-green-100">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><CheckCircle2 className="w-5 h-5" /></div>
                                        <div>
                                            <div className="text-xs text-green-600 font-semibold">AVAILABILITY</div>
                                            <div className="font-bold text-green-900">{tour.available_seats} spots left</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <h2 className="text-2xl font-bold mb-6 text-neutral-900">Overview</h2>
                            <div className="prose prose-lg text-neutral-600 mb-12 max-w-none leading-relaxed">
                                <p>{tour.description || tour.short_description}</p>
                            </div>
                        </Reveal>

                        {/* Itinerary Accordion */}
                        <Reveal>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-neutral-900">Itinerary</h2>
                            </div>
                            <Accordion.Root type="multiple" defaultValue={['day-0']} className="space-y-4 mb-16">
                                {itineraryDays.map((item, i) => (
                                    <Accordion.Item key={i} value={`day-${i}`} className="border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                                        <Accordion.Header>
                                            <Accordion.Trigger className="flex justify-between items-center w-full p-6 text-left group hover:bg-neutral-50 transition-colors">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                                                    <span className="text-brand-navy font-black text-lg min-w-[80px]">{item.day}</span>
                                                    <span className="font-bold text-neutral-900 text-lg">{item.title}</span>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-200 transition-colors shrink-0">
                                                    <ChevronDown className="w-5 h-5 text-neutral-500 group-data-[state=open]:rotate-180 transition-transform duration-300" />
                                                </div>
                                            </Accordion.Trigger>
                                        </Accordion.Header>
                                        <Accordion.Content className="text-neutral-600 border-t border-neutral-100 bg-neutral-50/50">
                                            <div className="p-6 sm:pl-[120px] leading-relaxed text-lg">
                                                {item.content}
                                            </div>
                                        </Accordion.Content>
                                    </Accordion.Item>
                                ))}
                            </Accordion.Root>
                        </Reveal>

                        {/* Inclusions & Exclusions */}
                        <Reveal>
                            <h2 className="text-2xl font-bold mb-6 text-neutral-900">What's Included & Excluded</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                <div className="bg-green-50/50 rounded-3xl p-8 border border-green-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5"><CheckCircle2 className="w-32 h-32 text-green-900" /></div>
                                    <h3 className="font-bold text-green-900 text-xl mb-6 relative z-10">Included</h3>
                                    <ul className="space-y-4 relative z-10">
                                        {tour.included_items ? tour.included_items.split('\n').map((item: string, i: number) => (
                                            item.trim() && <li key={i} className="flex items-start gap-3 text-green-900"><div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3.5 h-3.5 text-green-800" /></div> <span className="leading-relaxed">{item}</span></li>
                                        )) : <li className="text-green-800">Standard inclusions.</li>}
                                    </ul>
                                </div>
                                <div className="bg-red-50/50 rounded-3xl p-8 border border-red-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5"><XIcon className="w-32 h-32 text-red-900" /></div>
                                    <h3 className="font-bold text-red-900 text-xl mb-6 relative z-10">Not Included</h3>
                                    <ul className="space-y-4 relative z-10">
                                        {tour.excluded_items ? tour.excluded_items.split('\n').map((item: string, i: number) => (
                                            item.trim() && <li key={i} className="flex items-start gap-3 text-red-900"><div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center shrink-0 mt-0.5"><XIcon className="w-3.5 h-3.5 text-red-800" /></div> <span className="leading-relaxed">{item}</span></li>
                                        )) : <li className="text-red-800">Standard exclusions.</li>}
                                    </ul>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    {/* Sidebar Price Card */}
                    <div className="lg:w-[400px] relative">
                        <div ref={priceCardRef} className="sticky top-28 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-neutral-100 p-8 z-10">
                            <div className="mb-8 pb-8 border-b border-neutral-100">
                                <span className="text-sm text-neutral-500 font-bold uppercase tracking-wider block mb-2">Tour Price</span>
                                <div className="text-4xl font-black text-neutral-900 mb-1">{tour.currency} {tour.price_from?.toLocaleString()}</div>
                                <div className="text-neutral-500 font-medium">per person</div>
                            </div>
                            
                            <div className="space-y-5 mb-8">
                                <div>
                                    <label className="block text-sm font-bold text-neutral-900 mb-2">Preferred Travel Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                        <input type="date" className="w-full pl-12 h-14 border-2 border-neutral-100 rounded-xl focus:ring-brand-navy focus:border-brand-navy text-base transition-colors" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-900 mb-2">Number of Travelers</label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                        <select className="w-full pl-12 h-14 border-2 border-neutral-100 rounded-xl focus:ring-brand-navy focus:border-brand-navy text-base bg-white transition-colors appearance-none outline-none">
                                            {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} {n===1?'Person':'People'}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                            
                            <Button render={<Link href={`/contact?tour=${tour.slug || tour.id}`} />} size="lg" className="w-full h-14 rounded-full text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all mb-4">
                                Enquire About This Tour
                            </Button>
                            
                            <p className="text-sm text-center text-neutral-500 font-medium bg-neutral-50 p-4 rounded-xl">
                                🔒 No payment required now. Our travel experts will get in touch to confirm availability.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Tours Carousel */}
            {relatedTours.length > 0 && (
                <section className="py-24 bg-neutral-950 text-white mt-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h2 className="text-3xl font-bold mb-2">More tours in {tour.destination}</h2>
                                <p className="text-neutral-400">Discover other highly rated experiences nearby.</p>
                            </div>
                        </div>
                        <div className="overflow-hidden" ref={relatedRef}>
                            <div className="flex gap-6 pb-4">
                                {relatedTours.map(t => (
                                    <div key={t.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] min-w-0">
                                        <Link href={`/tours/${t.slug || t.id}`} className="block h-full group">
                                            <div className="bg-neutral-900 rounded-3xl overflow-hidden h-full border border-neutral-800 flex flex-col group-hover:-translate-y-1 transition-transform duration-300">
                                                <div className="h-48 bg-neutral-800 relative overflow-hidden">
                                                    <img src={t.hero_image || 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=800&auto=format&fit=crop'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                                                </div>
                                                <div className="p-6 flex flex-col flex-grow">
                                                    <h3 className="font-bold text-lg mb-2 line-clamp-2 text-white group-hover:text-brand-navy transition-colors">{t.package_name}</h3>
                                                    <p className="text-sm text-neutral-400 mb-6 flex-grow">{t.duration_days} Days</p>
                                                    <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                                                        <span className="text-sm text-neutral-400 block">From</span>
                                                        <span className="font-bold text-white text-lg">{t.currency} {t.price_from?.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Sticky Mobile Bar */}
            <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-neutral-200 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] p-4 px-6 flex items-center justify-between transition-transform duration-300 ease-in-out ${!isPriceCardVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                <div>
                    <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider block mb-0.5">Price from</span>
                    <span className="text-2xl font-black text-neutral-900 leading-none">{tour.currency} {tour.price_from?.toLocaleString()}</span>
                </div>
                <Button render={<Link href={`/contact?tour=${tour.slug || tour.id}`} />} size="lg" className="rounded-full shadow-lg font-bold px-8">
                    Enquire
                </Button>
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 lg:p-12">
                    <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                    <button onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)} className="absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 bg-white/5 hover:bg-white/10 rounded-full transition-colors hidden sm:block">
                        <ChevronRight className="w-8 h-8 rotate-180" />
                    </button>
                    <button onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)} className="absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 bg-white/5 hover:bg-white/10 rounded-full transition-colors hidden sm:block">
                        <ChevronRight className="w-8 h-8" />
                    </button>
                    
                    <div className="w-full max-w-6xl h-full flex items-center justify-center relative">
                        <img src={images[activeImageIndex]} className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" alt="" />
                    </div>
                    
                    <div className="absolute bottom-6 lg:bottom-12 left-1/2 -translate-x-1/2 text-white/90 font-medium bg-black/50 px-6 py-2 rounded-full backdrop-blur-sm">
                        {activeImageIndex + 1} of {images.length}
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
