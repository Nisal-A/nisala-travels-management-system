import { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/common/Reveal';
import { Clock, MapPin, Check, X as XIcon, Users, Calendar, ChevronRight, CheckCircle2, ChevronDown, Compass, Utensils, Hotel, ArrowRight } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import axios from 'axios';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [relatedRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

    useEffect(() => {
        setLoading(true);
        axios.get(`/api/public/tours/${slug}`)
            .then(res => {
                setTour(res.data.data);
                setLoading(false);

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
                <div className="min-h-screen pt-24 pb-16 px-4 flex flex-col items-center justify-center bg-neutral-50">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
                    <p className="text-neutral-500 font-medium tracking-widest uppercase text-sm">Curating your experience...</p>
                </div>
            </PublicLayout>
        );
    }

    if (error || !tour) {
        return (
            <PublicLayout>
                <div className="min-h-[80vh] flex flex-col items-center justify-center pt-20 pb-16 px-4 text-center bg-neutral-50">
                    <div className="w-24 h-24 bg-white shadow-sm rounded-full flex items-center justify-center mb-8">
                        <MapPin className="w-10 h-10 text-neutral-300" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-neutral-900">Experience Not Found</h1>
                    <p className="text-lg text-neutral-500 mb-10 max-w-lg">This journey might have been completed or removed. Let us help you find another beautiful destination.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button render={<Link href="/tours" />} size="lg" className="rounded-full px-10 h-14 text-lg">Browse all tours</Button>
                        <Button render={<Link href="/contact" />} variant="outline" size="lg" className="rounded-full px-10 h-14 text-lg">Contact Support</Button>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    const images = [
        tour.hero_image || 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=1200&auto=format&fit=crop',
        ...(Array.isArray(tour.gallery) ? tour.gallery : [])
    ];

    const itineraryDays = Array.from({ length: tour.duration_days }).map((_, i) => ({
        day: `Day ${i + 1}`,
        title: i === 0 ? 'Arrival & Welcome' : i === tour.duration_days - 1 ? 'Departure' : `Exploring the Wonders`,
        content: `Enjoy a guided experience filled with local culture, scenic views, and premium accommodations. Meals and transport are fully arranged. Our expert local guides will ensure you see the hidden gems alongside the famous landmarks.`
    }));

    return (
        <PublicLayout>
            <Head title={`${tour.package_name} | Nisala Travels`} />

            {/* Cinematic Hero */}
            <div className="relative h-[85svh] w-full overflow-hidden bg-neutral-900">
                <div className="absolute inset-0 z-0">
                    <img src={images[0]} alt={tour.package_name} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-neutral-900/80 mix-blend-multiply" />
                </div>

                <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-24 md:pb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl"
                    >
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white font-bold tracking-widest uppercase px-5 py-2 rounded-full text-xs mb-8 shadow-lg">
                            <MapPin className="w-4 h-4" /> {tour.destination}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 drop-shadow-xl leading-[1.1]">{tour.package_name}</h1>

                        <div className="flex flex-wrap items-center gap-6 text-white/90 font-medium">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                                <Clock className="w-5 h-5 text-primary" />
                                <span>{tour.duration_days} Days / {tour.duration_days - 1} Nights</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                                <Users className="w-5 h-5 text-primary" />
                                <span>Private Journey</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Immersive Gallery Strip */}
            <div className="bg-neutral-900 pb-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-16 md:-mt-24 relative z-20">
                        {images.slice(1, 5).map((img, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                key={i}
                                className="relative group rounded-3xl overflow-hidden aspect-square cursor-pointer shadow-2xl"
                                onClick={() => { setActiveImageIndex(i + 1); setLightboxOpen(true); }}
                            >
                                <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                                {i === 3 && images.length > 5 && (
                                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white transition-colors group-hover:bg-black/60">
                                        <span className="text-3xl font-light mb-1">+{images.length - 5}</span>
                                        <span className="text-xs font-bold tracking-widest uppercase">Photos</span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 md:py-24">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Main Content */}
                    <div className="flex-1 lg:max-w-[calc(100%-480px)]">
                        <Reveal>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-neutral-900">The Experience</h2>
                            <div className="prose prose-lg md:prose-xl text-neutral-600 mb-16 max-w-none leading-relaxed font-light">
                                <p>{tour.description || tour.short_description}</p>
                            </div>
                        </Reveal>

                        {/* Journey Highlights */}
                        <Reveal>
                            <div className="bg-neutral-50 rounded-[2rem] p-8 md:p-12 mb-16 border border-neutral-100">
                                <h3 className="text-xl font-bold uppercase tracking-widest text-neutral-400 mb-8">Journey Highlights</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="flex flex-col gap-3">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-sm"><Hotel className="w-6 h-6" /></div>
                                        <h4 className="font-bold text-neutral-900">Premium Stays</h4>
                                        <p className="text-sm text-neutral-500">Handpicked 4 & 5-star accommodations.</p>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-sm"><Utensils className="w-6 h-6" /></div>
                                        <h4 className="font-bold text-neutral-900">Curated Dining</h4>
                                        <p className="text-sm text-neutral-500">Daily breakfast and authentic local dinners.</p>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-sm"><Compass className="w-6 h-6" /></div>
                                        <h4 className="font-bold text-neutral-900">Expert Guides</h4>
                                        <p className="text-sm text-neutral-500">Private chauffeurs and knowledgeable locals.</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        {/* Day by Day */}
                        <Reveal>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-neutral-900">Day by Day</h2>
                            <Accordion.Root type="multiple" defaultValue={['day-0']} className="space-y-4 mb-20">
                                {itineraryDays.map((item, i) => (
                                    <Accordion.Item key={i} value={`day-${i}`} className="border-none rounded-3xl bg-white overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-6">
                                        <Accordion.Header>
                                            <Accordion.Trigger className="flex justify-between items-center w-full p-6 md:p-8 text-left group">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                                                    <span className="text-primary font-serif font-black text-xl sm:text-2xl min-w-[100px]">{item.day}</span>
                                                    <span className="font-bold text-neutral-900 text-lg sm:text-xl group-hover:text-primary transition-colors">{item.title}</span>
                                                </div>
                                                <div className="w-12 h-12 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shrink-0">
                                                    <ChevronDown className="w-5 h-5 text-neutral-400 group-data-[state=open]:rotate-180 group-hover:text-white transition-all duration-300" />
                                                </div>
                                            </Accordion.Trigger>
                                        </Accordion.Header>
                                        <Accordion.Content className="text-neutral-600 bg-neutral-50/50">
                                            <div className="p-6 md:p-8 sm:pl-[140px] leading-relaxed text-lg font-light border-t border-neutral-100">
                                                {item.content}
                                            </div>
                                        </Accordion.Content>
                                    </Accordion.Item>
                                ))}
                            </Accordion.Root>
                        </Reveal>

                        {/* Inclusions */}
                        <Reveal>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                <div>
                                    <h3 className="text-xl font-bold mb-6 text-neutral-900 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div>
                                        What's Included
                                    </h3>
                                    <ul className="space-y-4">
                                        {tour.included_items ? tour.included_items.split('\n').map((item: string, i: number) => (
                                            item.trim() && <li key={i} className="flex items-start gap-4 text-neutral-700 font-light"><Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> <span className="leading-relaxed">{item}</span></li>
                                        )) : <li className="text-neutral-500 font-light">Standard premium inclusions.</li>}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-6 text-neutral-900 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><XIcon className="w-5 h-5" /></div>
                                        Not Included
                                    </h3>
                                    <ul className="space-y-4">
                                        {tour.excluded_items ? tour.excluded_items.split('\n').map((item: string, i: number) => (
                                            item.trim() && <li key={i} className="flex items-start gap-4 text-neutral-700 font-light"><XIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> <span className="leading-relaxed">{item}</span></li>
                                        )) : <li className="text-neutral-500 font-light">Personal expenses & flights.</li>}
                                    </ul>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    {/* Booking / Price Sidebar */}
                    <div className="lg:w-[420px] relative">
                        <div ref={priceCardRef} className="sticky top-32 bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-neutral-100 p-8 z-10">
                            <div className="mb-8">
                                <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest block mb-3">Investment From</span>
                                <div className="text-5xl font-black text-neutral-900 mb-2 font-serif">{tour.currency} {tour.price_from?.toLocaleString()}</div>
                                <div className="text-neutral-500 font-medium">per person, double occupancy</div>
                            </div>

                            <div className="space-y-6 mb-10 bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Preferred Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                        <input type="date" className="w-full pl-12 h-14 border-none bg-white rounded-xl focus:ring-2 focus:ring-primary text-base font-medium transition-all shadow-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Travelers</label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                        <select className="w-full pl-12 h-14 border-none bg-white rounded-xl focus:ring-2 focus:ring-primary text-base font-medium transition-all shadow-sm appearance-none outline-none">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <Button render={<Link href={`/contact?tour=${tour.slug || tour.id}`} />} size="lg" className="w-full h-16 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all mb-6">
                                Request Itinerary
                            </Button>

                            <p className="text-sm text-center text-neutral-500 font-light flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" /> No payment required to request
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Tours */}
            {relatedTours.length > 0 && (
                <section className="py-24 bg-neutral-50 border-t border-neutral-200">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-neutral-900">More in {tour.destination}</h2>
                                <p className="text-neutral-500 text-lg font-light max-w-xl">Continue exploring beautiful escapes carefully crafted by our experts.</p>
                            </div>
                            <div className="hidden md:flex gap-4">
                                <button onClick={() => emblaApi?.scrollPrev()} className="w-12 h-12 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all">
                                    <ArrowRight className="w-5 h-5 rotate-180" />
                                </button>
                                <button onClick={() => emblaApi?.scrollNext()} className="w-12 h-12 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all">
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-hidden" ref={relatedRef}>
                            <div className="flex gap-6 md:gap-8 pb-8 cursor-grab active:cursor-grabbing">
                                {relatedTours.map((t, idx) => (
                                    <Reveal key={t.id} delay={idx * 0.1} className="flex-[0_0_85%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0">
                                        <Link href={`/tours/${t.slug || t.id}`} className="block group h-full">
                                            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col border border-neutral-100 group-hover:-translate-y-2">
                                                <div className="h-56 overflow-hidden relative">
                                                    <img src={t.hero_image || 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=800&auto=format&fit=crop'} alt="" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                                                </div>
                                                <div className="p-8 flex-grow flex flex-col">
                                                    <h3 className="font-serif font-bold text-xl mb-3 line-clamp-2 text-neutral-900 group-hover:text-primary transition-colors">{t.package_name}</h3>
                                                    <div className="flex items-center gap-2 text-neutral-500 text-sm font-medium mb-6 flex-grow">
                                                        <Clock className="w-4 h-4 text-primary" /> {t.duration_days} Days
                                                    </div>
                                                    <div className="flex items-center justify-between pt-6 border-t border-neutral-100">
                                                        <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest">From</span>
                                                        <span className="font-black text-neutral-900 text-lg">{t.currency} {t.price_from?.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Mobile Sticky Bar */}
            <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-xl border-t border-neutral-200 p-4 px-6 flex items-center justify-between transition-transform duration-300 ease-in-out ${!isPriceCardVisible ? 'translate-y-0 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]' : 'translate-y-full'}`}>
                <div>
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-0.5">Investment</span>
                    <span className="text-2xl font-black text-neutral-900 leading-none">{tour.currency} {tour.price_from?.toLocaleString()}</span>
                </div>
                <Button render={<Link href={`/contact?tour=${tour.slug || tour.id}`} />} size="lg" className="rounded-full shadow-lg font-bold px-8 h-12">
                    Request
                </Button>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-neutral-950/95 backdrop-blur-xl flex items-center justify-center p-4 lg:p-12"
                    >
                        <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-4 transition-colors z-50">
                            <XIcon className="w-6 h-6" />
                        </button>
                        <button onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)} className="absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 bg-white/5 hover:bg-white/10 rounded-full transition-colors hidden sm:block z-50">
                            <ChevronRight className="w-8 h-8 rotate-180" />
                        </button>
                        <button onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)} className="absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 bg-white/5 hover:bg-white/10 rounded-full transition-colors hidden sm:block z-50">
                            <ChevronRight className="w-8 h-8" />
                        </button>

                        <div className="w-full max-w-6xl h-full flex items-center justify-center relative">
                            <motion.img
                                key={activeImageIndex}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                src={images[activeImageIndex]}
                                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                                alt=""
                            />
                        </div>

                        <div className="absolute bottom-6 lg:bottom-12 left-1/2 -translate-x-1/2 text-white/90 font-medium bg-black/50 px-6 py-3 rounded-full backdrop-blur-md shadow-2xl tracking-widest text-sm">
                            {activeImageIndex + 1} / {images.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PublicLayout>
    );
}
