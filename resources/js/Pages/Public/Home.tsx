import { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/common/Reveal';
import {
    Search, MapPin, Calendar, Star, Clock, ArrowRight, ChevronDown,
    Compass, Shield, Phone, Stethoscope, UtensilsCrossed, Palmtree,
    Quote
} from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import * as Accordion from '@radix-ui/react-accordion';

import { tours } from '@/content/tours';
import { testimonials } from '@/content/testimonials';
import { faqs } from '@/content/faqs';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatLKR(value: number): string {
    return value.toLocaleString('en-LK');
}

export default function Home() {
    const shouldReduceMotion = useReducedMotion();
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 1000], [0, 300]);
    const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

    const [destination, setDestination] = useState('');
    const [month, setMonth] = useState('');

    const featuredTours = useMemo(() => tours.filter((t) => t.isFeatured), []);

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (destination) params.destination = destination;
        if (month) params.month = month;
        router.get('/tours', params);
    };

    return (
        <PublicLayout>
            <Head title="Premium Travel & Tour Packages to Thailand & India | Nisala Travels" />

            {/* ================================================================
                1. CINEMATIC HERO
            ================================================================ */}
            <section className="relative h-[100svh] w-full overflow-hidden bg-neutral-900 flex items-center justify-center">
                <motion.div 
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="absolute inset-0 z-0 w-full h-full"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/40 via-transparent to-neutral-900/80 z-10 mix-blend-multiply" />
                    <img
                        src="/images/hero/hero-poster.jpg"
                        alt="Stunning tropical landscape"
                        className="w-full h-full object-cover origin-center scale-105"
                        style={{
                            animation: shouldReduceMotion ? 'none' : 'subtle-zoom 20s ease-in-out infinite alternate'
                        }}
                    />
                </motion.div>

                <div className="relative z-20 container mx-auto px-4 flex flex-col items-center text-center mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-semibold tracking-[0.2em] uppercase mb-8"
                    >
                        <Star className="w-3.5 h-3.5 text-primary" fill="currentColor" />
                        Handcrafted Journeys
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white tracking-tight leading-[1.1] mb-6 drop-shadow-2xl max-w-5xl">
                        <span className="block overflow-hidden">
                            <motion.span 
                                initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                                className="block"
                            >
                                Experience the World
                            </motion.span>
                        </span>
                        <span className="block overflow-hidden text-primary/90 italic mt-2">
                            <motion.span 
                                initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                                className="block"
                            >
                                Beautifully
                            </motion.span>
                        </span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="text-lg md:text-2xl text-white/80 max-w-2xl font-light mb-12 drop-shadow-md"
                    >
                        Curated escapes to Thailand's vibrant shores and India's spiritual heartlands.
                    </motion.p>

                    {/* Premium Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1 }}
                        className="w-full max-w-4xl"
                    >
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row p-2 bg-white/10 backdrop-blur-2xl rounded-[2rem] border border-white/20 shadow-2xl">
                            <div className="flex-1 flex items-center px-6 py-4">
                                <MapPin className="text-white/60 w-5 h-5 mr-4" />
                                <select 
                                    className="w-full bg-transparent text-white focus:outline-none appearance-none cursor-pointer text-lg font-medium [&>option]:text-neutral-900"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                >
                                    <option value="">Where to?</option>
                                    <option value="Thailand">Thailand</option>
                                    <option value="India">India</option>
                                </select>
                            </div>
                            <div className="hidden md:block w-px bg-white/20 my-4" />
                            <div className="flex-1 flex items-center px-6 py-4">
                                <Calendar className="text-white/60 w-5 h-5 mr-4" />
                                <select 
                                    className="w-full bg-transparent text-white focus:outline-none appearance-none cursor-pointer text-lg font-medium [&>option]:text-neutral-900"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                >
                                    <option value="">When?</option>
                                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="md:ml-2 mt-2 md:mt-0 bg-primary text-primary-foreground h-16 px-10 rounded-[1.5rem] font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center group shadow-lg hover:shadow-primary/25">
                                Explore <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </motion.div>
                </div>

                <motion.div 
                    animate={{ y: [0, 10, 0] }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
                >
                    <ChevronDown className="w-8 h-8" />
                </motion.div>
            </section>

            {/* ================================================================
                2. DESTINATIONS SHOWCASE
            ================================================================ */}
            <section className="py-24 md:py-32 bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-neutral-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                
                <div className="container mx-auto px-4 relative z-10">
                    <Reveal>
                        <div className="text-center mb-16 md:mb-24">
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-neutral-900 mb-6">Choose Your Canvas</h2>
                            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">Two distinct worlds, each offering unparalleled beauty and profound experiences.</p>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Thailand */}
                        <Reveal delay={0.1}>
                            <Link href="/tours?destination=Thailand" className="block group">
                                <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] md:aspect-[3/4]">
                                    <img src="/images/thailand/phuket.jpg" alt="Thailand" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute inset-0 p-10 flex flex-col justify-end text-white">
                                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <h3 className="text-4xl font-serif font-bold mb-3 text-white">Thailand</h3>
                                            <p className="text-lg text-white/80 mb-6 font-light">Escape in style to vibrant shores and tranquil temples.</p>
                                            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full text-sm font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                Discover Packages <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </Reveal>

                        {/* India */}
                        <Reveal delay={0.2}>
                            <Link href="/tours?destination=India" className="block group md:mt-16">
                                <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] md:aspect-[3/4]">
                                    <img src="/images/india/taj-mahal.jpg" alt="India" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute inset-0 p-10 flex flex-col justify-end text-white">
                                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <h3 className="text-4xl font-serif font-bold mb-3 text-white">India</h3>
                                            <p className="text-lg text-white/80 mb-6 font-light">Comfortable pilgrimages and majestic historical journeys.</p>
                                            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full text-sm font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                Discover Packages <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ================================================================
                3. PREMIUM FEATURED TOURS CAROUSEL
            ================================================================ */}
            <section className="py-24 bg-neutral-900 text-white overflow-hidden">
                <div className="container mx-auto px-4 mb-16">
                    <Reveal>
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">Curated Escapes</h2>
                                <p className="text-neutral-400 text-lg max-w-xl">Our most beloved itineraries, carefully refined over years to provide the perfect balance of adventure and relaxation.</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => emblaApi?.scrollPrev()} className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-neutral-900 transition-colors">
                                    <ArrowRight className="w-5 h-5 rotate-180" />
                                </button>
                                <button onClick={() => emblaApi?.scrollNext()} className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-neutral-900 transition-colors">
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </Reveal>
                </div>

                <div className="ml-4 md:ml-[max(0px,calc((100vw-1280px)/2))] pl-0">
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex gap-6 md:gap-8 pb-12 cursor-grab active:cursor-grabbing">
                            {featuredTours.map((tour, idx) => (
                                <Reveal key={tour.slug} delay={idx * 0.1} className="flex-[0_0_85%] sm:flex-[0_0_50%] lg:flex-[0_0_35%] min-w-0">
                                    <Link href={`/tours/${tour.slug}`} className="block group">
                                        <div className="bg-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative">
                                            <div className="h-72 overflow-hidden relative">
                                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] group-hover:scale-110" style={{ backgroundImage: `url('${tour.galleryImages[0] ?? ''}')` }} />
                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-800/90" />
                                                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                                                    {tour.destination}
                                                </div>
                                            </div>
                                            <div className="p-8 -mt-10 relative z-10 flex flex-col h-full">
                                                <h3 className="text-2xl font-serif font-bold text-white mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                                    {tour.title}
                                                </h3>
                                                <p className="text-neutral-400 text-sm mb-6 line-clamp-2">{tour.shortDescription}</p>
                                                
                                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
                                                    <div className="flex items-center gap-2 text-neutral-300 font-medium">
                                                        <Clock className="w-5 h-5 text-primary" /> {tour.durationNights}N / {tour.durationDays}D
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">Starts from</span>
                                                        <span className="text-xl font-bold text-white">LKR {formatLKR(tour.priceFrom)}</span>
                                                    </div>
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

            {/* ================================================================
                4. WHY CHOOSE US
            ================================================================ */}
            <section className="py-24 md:py-32 bg-neutral-50">
                <div className="container mx-auto px-4">
                    <Reveal>
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-neutral-900 mb-6">The Nisala Difference</h2>
                            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">Elevating your travel with personalized care, transparent pricing, and unwavering support.</p>
                        </div>
                    </Reveal>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Compass, title: 'Local Expertise', desc: 'Crafted by specialists who know every hidden gem and local secret.' },
                            { icon: Shield, title: 'Total Transparency', desc: 'No hidden fees. Every detail of your package is clear from day one.' },
                            { icon: Stethoscope, title: 'Senior Friendly Care', desc: 'Specialized support for elderly travelers on our Indian pilgrimages.' },
                            { icon: UtensilsCrossed, title: 'Comfort of Home', desc: 'Authentic Sri Lankan and customized dietary meals provided abroad.' },
                            { icon: Phone, title: '24/7 Concierge', desc: 'Round-the-clock support ensuring peace of mind during your journey.' },
                            { icon: Palmtree, title: 'Curated Luxury', desc: 'Handpicked premium stays offering the finest comfort and aesthetics.' },
                        ].map((feature, idx) => (
                            <Reveal key={feature.title} delay={idx * 0.1}>
                                <div className="bg-white p-10 rounded-3xl shadow-sm border border-neutral-100 hover:shadow-xl transition-all duration-300 group">
                                    <div className="w-16 h-16 rounded-2xl bg-neutral-50 text-neutral-700 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <feature.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-900 mb-3">{feature.title}</h3>
                                    <p className="text-neutral-500 leading-relaxed">{feature.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================================================================
                5. TESTIMONIALS
            ================================================================ */}
            <section className="py-24 bg-white border-t border-neutral-100">
                <div className="container mx-auto px-4">
                    <Reveal>
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-serif font-bold text-neutral-900">Words from Our Travelers</h2>
                        </div>
                    </Reveal>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.slice(0, 3).map((review, i) => (
                            <Reveal key={review.id} delay={i * 0.15}>
                                <div className="bg-neutral-50 p-8 rounded-[2rem] h-full flex flex-col relative border border-neutral-100">
                                    <Quote className="absolute top-8 right-8 w-12 h-12 text-neutral-200" />
                                    <div className="flex gap-1 text-primary mb-6">
                                        {[...Array(review.rating)].map((_, idx) => <Star key={idx} className="w-4 h-4 fill-current" />)}
                                    </div>
                                    <p className="text-lg text-neutral-700 font-medium italic mb-8 relative z-10 flex-grow">"{review.text}"</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center font-bold text-neutral-600 text-lg">
                                            {review.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-neutral-900">{review.name}</h4>
                                            <span className="text-sm text-neutral-500">{review.trip}</span>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

        </PublicLayout>
    );
}
