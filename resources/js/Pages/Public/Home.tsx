import { SEOHead } from '@/components/public/SEOHead';
import { useState, useEffect, useMemo, useCallback } from 'react';
import {  Link } from '@inertiajs/react';
import axios from 'axios';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Reveal } from '@/components/common/Reveal';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { Button } from '@/components/ui/button';
import {
    MapPin, Compass, Shield, Heart, Phone, Stethoscope, UtensilsCrossed,
    Palmtree, Clock, ArrowRight, Star, ChevronDown
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import * as Accordion from '@radix-ui/react-accordion';

import { tours, type TourPackage } from '@/content/tours';
import { testimonials } from '@/content/testimonials';
import { faqs } from '@/content/faqs';
import { site } from '@/content/site';
import { DestinationCard } from '@/components/public/DestinationCard';
import { AboutSection } from '@/components/public/AboutSection';
import { WhyChooseUsSection } from '@/components/public/WhyChooseUsSection';
import { TestimonialsSection } from '@/components/public/TestimonialsSection';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatLKR(value: number): string {
    return value.toLocaleString('en-LK');
}


// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------
export default function Home() {
    const shouldReduceMotion = useReducedMotion();

    // Featured tours — client-side from static content
    const featuredTours = useMemo(() => tours.filter((t) => t.isFeatured), []);

    // Embla
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        align: 'start',
        slidesToScroll: 1,
        containScroll: 'trimSnaps',
    });
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

    // Fetch destinations
    const [destinations, setDestinations] = useState<any[]>([]);
    const [loadingDestinations, setLoadingDestinations] = useState(true);

    useEffect(() => {
        axios.get('/api/public/destinations').then(res => {
            if (res.data.length > 0) {
                const uniqueCountries = Array.from(new Set(res.data.map((d: any) => d.country))).filter(Boolean) as string[];
                const mapped = uniqueCountries.map(country => {
                    const dest = res.data.find((d: any) => d.country === country);
                    return {
                        name: country,
                        description: dest.description || undefined,
                        image: undefined, // No image column in DB schema
                        href: `/our-tours?destination=${encodeURIComponent(country)}`
                    };
                });
                setDestinations(mapped);
            } else {
                setDestinations([
                    {
                        name: 'Thailand',
                        description: 'Escape in Style',
                        image: '/images/thailand/phuket.jpg',
                        href: '/our-tours?destination=Thailand'
                    },
                    {
                        name: 'India',
                        description: 'Journeys Made Comfortable',
                        image: '/images/india/taj-mahal.jpg',
                        href: '/our-tours?destination=India'
                    }
                ]);
            }
        }).catch(console.error).finally(() => setLoadingDestinations(false));
    }, []);

    return (
        <PublicLayout>
            <SEOHead title="Premium Travel & Tour Packages to Thailand & India" description="Creating unforgettable travel experiences tailored to your dreams. We handle the details, you enjoy the journey." url="/" image="/images/hero/hero-poster.jpg" />

            {/* ================================================================
                1. HERO
            ================================================================ */}
            <section className="relative w-full h-[600px] md:h-[80vh] min-h-[500px] overflow-hidden bg-brand-navy flex items-center">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/hero/hero-poster.jpg"
                        alt="Beautiful tropical landscape at sunset"
                        fetchPriority="high"
                        loading="eager"
                        className={`w-full h-full object-cover ${!shouldReduceMotion ? 'animate-[kenburns_25s_ease-in-out_infinite_alternate]' : ''
                            }`}
                    />
                </div>

                {/* Navy Overlay for Readability */}
                <div className="absolute inset-0 z-[1] bg-brand-navy/70 md:bg-gradient-to-r md:from-brand-navy/95 md:via-brand-navy/70 md:to-transparent" />

                {/* Content */}
                <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-2xl pt-16 md:pt-0"
                    >
                        {/* Gold Accent Line */}
                        <div className="w-16 h-1.5 bg-brand-gold mb-8 rounded-full" />

                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white tracking-tight leading-[1.1] mb-6">
                            Discover New Places.<br />
                            Create New Stories.
                        </h1>

                        <p className="text-base sm:text-lg md:text-xl text-white/90 mb-10 leading-relaxed max-w-xl">
                            Experience meticulously crafted journeys tailored to your preferences.
                            From relaxing getaways to cultural explorations, we handle every detail
                            so you can immerse yourself in the moment.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                render={<Link href="/our-tours" />}
                                size="public-lg"
                                variant="public-accent"
                                className="w-full sm:w-auto shadow-lg shadow-brand-gold/20"
                            >
                                Explore Tour Packages
                            </Button>
                            <Button
                                render={<Link href="/contact" />}
                                size="public-lg"
                                className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20"
                            >
                                Plan Your Journey
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ================================================================
                2. DESTINATIONS GRID
            ================================================================ */}
            <section className="py-24 md:py-32 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Reveal>
                        <div className="text-center mb-16">
                            <span className="inline-block bg-brand-gold text-brand-navy text-xs font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3">Explore the world</span>
                            <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-navy">Popular Destinations</h2>
                        </div>
                    </Reveal>

                    {loadingDestinations ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {[1, 2].map(i => (
                                <div key={i} className="animate-pulse bg-neutral-200 aspect-[4/5] sm:aspect-square md:aspect-[3/4] rounded-2xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-center">
                            {destinations.map((dest, idx) => (
                                <Reveal key={dest.name} delay={idx * 100}>
                                    <DestinationCard
                                        name={dest.name}
                                        description={dest.description}
                                        image={dest.image}
                                        href={dest.href}
                                    />
                                </Reveal>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ================================================================
                3. FEATURED TOURS CAROUSEL
            ================================================================ */}
            <section className="py-24 md:py-32 bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Reveal>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
                            <div>
                                <span className="inline-block bg-brand-gold text-brand-navy text-xs font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3">Handpicked packages</span>
                                <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-foreground">Featured Tours</h2>
                            </div>
                            <Link href="/our-tours" className="hidden sm:flex items-center text-sm text-brand-navy font-semibold hover:text-brand-gold gap-1.5 transition-colors">
                                View all tours <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </Reveal>

                    <Reveal delay={0.15}>
                        <div className="relative">
                            <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
                                <div className="flex gap-6" style={{ touchAction: 'pan-y' }}>
                                    {featuredTours.map((tour) => (
                                        <div key={tour.slug} className="flex-[0_0_85%] sm:flex-[0_0_48%] lg:flex-[0_0_31.5%] min-w-0 group">
                                            <Link href={`/our-tours/${tour.slug}`} className="block h-full">
                                                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-neutral-200/60 group-hover:-translate-y-1">
                                                    {/* Image */}
                                                    <div className="h-56 overflow-hidden bg-neutral-100 relative">
                                                        <div
                                                            className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                                            style={{ backgroundImage: `url('${tour.galleryImages[0] ?? ''}')` }}
                                                            role="img"
                                                            aria-label={tour.title}
                                                        />
                                                        {/* Destination badge */}
                                                        <span className={`absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${tour.destination === 'Thailand'
                                                            ? 'bg-brand-teal/90 text-white'
                                                            : 'bg-brand-orange/90 text-white'
                                                            }`}>
                                                            {tour.destination}
                                                        </span>
                                                        {/* Audience tag */}
                                                        <span className="absolute top-3 right-3 text-[11px] font-medium bg-white/90 backdrop-blur-sm text-neutral-700 px-2.5 py-1 rounded-full">
                                                            {tour.audienceTag}
                                                        </span>
                                                    </div>
                                                    {/* Content */}
                                                    <div className="p-5 flex-grow flex flex-col">
                                                        <h3 className="text-lg font-bold text-foreground mb-1.5 line-clamp-2 group-hover:text-brand-navy transition-colors font-serif">
                                                            {tour.title}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{tour.shortDescription}</p>
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-5 mt-auto">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3.5 h-3.5" /> {tour.durationNights}N / {tour.durationDays}D
                                                            </span>
                                                            {tour.tags.slice(0, 2).map((tag) => (
                                                                <span key={tag} className="bg-secondary px-2 py-0.5 rounded-full">{tag}</span>
                                                            ))}
                                                        </div>
                                                        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                                                            <div>
                                                                <span className="text-[11px] text-muted-foreground block uppercase tracking-wider">From</span>
                                                                <span className="text-lg font-bold text-foreground">LKR {formatLKR(tour.priceFrom)}</span>
                                                            </div>
                                                            <div className="w-9 h-9 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center group-hover:bg-brand-gold group-hover:text-brand-navy transition-colors">
                                                                <ArrowRight className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Carousel Arrows */}
                            {emblaApi && (
                                <div className="flex gap-2 mt-6 justify-center sm:justify-end">
                                    <button
                                        onClick={() => emblaApi.scrollPrev()}
                                        disabled={!canScrollPrev}
                                        className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-brand-navy hover:text-white hover:border-brand-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Previous tours"
                                    >
                                        <ArrowRight className="w-4 h-4 rotate-180" />
                                    </button>
                                    <button
                                        onClick={() => emblaApi.scrollNext()}
                                        disabled={!canScrollNext}
                                        className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-brand-navy hover:text-white hover:border-brand-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Next tours"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </Reveal>

                    {/* Mobile "View all" link */}
                    <div className="sm:hidden mt-8 text-center">
                        <Link href="/our-tours" className="text-sm text-brand-navy font-semibold">View all tours &rarr;</Link>
                    </div>
                </div>
            </section>

            {/* ================================================================
                3.5 ABOUT US
            ================================================================ */}
            <AboutSection />

            {/* ================================================================
                4. WHY CHOOSE US
            ================================================================ */}
            <WhyChooseUsSection />

            {/* ================================================================
                5. SENIOR CARE PROMISE (India)
            ================================================================ */}
            <section className="py-20 md:py-28 bg-background overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <Reveal>
                            <div>
                                <span className="inline-flex items-center gap-2 text-brand-orange text-xs font-bold uppercase tracking-[0.2em] mb-4">
                                    <Heart className="w-4 h-4" /> India tours
                                </span>
                                <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-foreground mb-6">
                                    Our Senior Care Promise
                                </h2>
                                <p className="text-base text-muted-foreground leading-relaxed mb-8">
                                    We understand that travel in the elder years requires extra care, patience, and attention. Every India itinerary
                                    is designed with your comfort as the top priority.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        'Dedicated Sinhala/Tamil-speaking tour escort on every trip',
                                        'Slow, comfortable pace — no rushing between destinations',
                                        'Wheelchair-friendly hotels and assisted temple visits',
                                        'Vegetarian and Sri Lankan-style meals throughout',
                                        'Medical support and emergency assistance on standby',
                                        'Senior-friendly ground transport with regular rest stops',
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                                            <div className="w-5 h-5 rounded-full bg-brand-orange/15 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-8">
                                    <Button
                                        render={<Link href="/our-tours?destination=India" />}
                                        className="rounded-full px-6 bg-brand-orange text-white hover:bg-brand-orange/90 h-11"
                                    >
                                        Browse India Tours
                                    </Button>
                                </div>
                            </div>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <div className="relative">
                                <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-100">
                                    {/* TODO: Replace with real photo of seniors at Bodhgaya temple */}
                                    <div
                                        className="w-full h-full bg-cover bg-center"
                                        style={{ backgroundImage: `url('/images/india/bodhgaya.jpg')` }}
                                        role="img"
                                        aria-label="Senior pilgrims at Bodhgaya temple in India"
                                    />
                                </div>
                                {/* Floating stat card */}
                                <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 bg-white rounded-2xl p-5 shadow-xl border border-neutral-100">
                                    <span className="text-3xl font-bold text-brand-orange block">100%</span>
                                    <span className="text-xs text-muted-foreground">Assisted Travel</span>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ================================================================
                6. THAILAND EXPERIENCES — Bento Grid
            ================================================================ */}
            <section className="py-20 md:py-28 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Reveal>
                        <div className="mb-12">
                            <span className="inline-flex items-center gap-2 text-brand-teal text-xs font-bold uppercase tracking-[0.2em] mb-3">
                                <Palmtree className="w-4 h-4" /> Thailand
                            </span>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-foreground mb-3">Experiences Awaiting You</h2>
                            <p className="text-base text-muted-foreground max-w-lg">
                                From tranquil spas to street food adventures — every day in Thailand is a new story.
                            </p>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[200px]">
                        {[
                            { title: 'Island Hopping', image: '/images/thailand/island-hopping.jpg', span: 'md:col-span-2 md:row-span-2' },
                            { title: 'Spa & Wellness', image: '/images/thailand/spa.jpg', span: '' },
                            { title: 'Street Food', image: '/images/thailand/food.jpg', span: '' },
                            { title: 'Rooftop Dining', image: '/images/thailand/rooftop.jpg', span: '' },
                            { title: 'Temples & Culture', image: '/images/thailand/chiangmai.jpg', span: '' },
                            { title: 'Beaches', image: '/images/thailand/krabi.jpg', span: 'col-span-2' },
                        ].map((exp, i) => (
                            <Reveal key={exp.title} delay={i * 0.06}>
                                <div className={`relative rounded-2xl overflow-hidden group cursor-pointer h-full ${exp.span}`}>
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                        style={{ backgroundImage: `url('${exp.image}')` }}
                                        role="img"
                                        aria-label={exp.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h3 className="text-white text-sm md:text-base font-bold">{exp.title}</h3>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================================================================
                7. HOW IT WORKS — 3 Steps
            ================================================================ */}
            <section className="py-20 md:py-28 bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Reveal>
                        <div className="text-center mb-16">
                            <span className="inline-block bg-brand-gold text-brand-navy text-xs font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3">Simple process</span>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-foreground">Three Steps to Your Journey</h2>
                        </div>
                    </Reveal>

                    <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-12 relative max-w-4xl mx-auto">
                        {/* Connector line */}
                        <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-px bg-neutral-200 z-0" />

                        {[
                            { step: '01', title: 'Tell Us Your Dream Trip', desc: 'Share your preferred destination, dates, pace, and any special requirements through our enquiry form.' },
                            { step: '02', title: 'We Design It For You', desc: 'Our experts craft a personalised itinerary with handpicked hotels, experiences, and local insights.' },
                            { step: '03', title: 'You Travel With Confidence', desc: 'Enjoy a seamless, worry-free journey with 24/7 support and every detail taken care of.' },
                        ].map((item, i) => (
                            <Reveal key={item.step} delay={i * 0.15} className="flex-1 relative z-10 text-center">
                                <div className="w-20 h-20 mx-auto bg-white border-4 border-background rounded-full flex items-center justify-center shadow-lg mb-6 ring-4 ring-brand-gold/10">
                                    <span className="text-xl font-bold text-brand-navy font-serif">{item.step}</span>
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed px-2">{item.desc}</p>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================================================================
                8. TESTIMONIALS
            ================================================================ */}
            <TestimonialsSection />

            {/* ================================================================
                9. FAQ
            ================================================================ */}
            <section className="py-20 md:py-28 bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                    <Reveal>
                        <div className="text-center mb-12">
                            <span className="inline-block bg-brand-gold text-brand-navy text-xs font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3">Got questions?</span>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
                        </div>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <Accordion.Root type="single" collapsible className="w-full space-y-3">
                            {faqs.map((faq, i) => (
                                <Accordion.Item
                                    key={i}
                                    value={`faq-${i}`}
                                    className="border border-neutral-200/60 rounded-xl overflow-hidden bg-white"
                                >
                                    <Accordion.Header>
                                        <Accordion.Trigger className="flex justify-between items-center w-full p-5 md:p-6 font-semibold text-left text-foreground hover:text-brand-navy transition-colors group text-sm md:text-base min-h-[48px]">
                                            {faq.question}
                                            <ChevronDown className="w-4 h-4 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform duration-300 shrink-0 ml-4" />
                                        </Accordion.Trigger>
                                    </Accordion.Header>
                                    <Accordion.Content className="overflow-hidden text-muted-foreground data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                                        <div className="px-5 md:px-6 pb-5 md:pb-6 leading-relaxed text-sm">
                                            {faq.answer}
                                        </div>
                                    </Accordion.Content>
                                </Accordion.Item>
                            ))}
                        </Accordion.Root>
                    </Reveal>
                </div>
            </section>

            {/* ================================================================
                10. FINAL CTA BAND
            ================================================================ */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0">
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url('/images/thailand/samui.jpg')` }}
                    />
                    <div className="absolute inset-0 bg-brand-navy/80" />
                </div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <Reveal>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-5 tracking-tight">
                            Ready to plan your journey?
                        </h2>
                        <p className="text-base md:text-lg text-white/70 mb-10 max-w-xl mx-auto">
                            Tell us your dream trip and let our team design the perfect experience for you. Free consultation, no obligations.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                render={<Link href="/contact" />}
                                size="lg"
                                className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg font-bold rounded-full bg-gradient-gold text-brand-navy hover:opacity-90 shadow-xl hover:shadow-2xl transition-all"
                            >
                                Plan My Trip
                            </Button>
                            <WhatsAppButton
                                variant="button"
                                label="Chat on WhatsApp"
                                text="Hi! I'm interested in planning a trip with Nisala Travels."
                            />
                        </div>
                    </Reveal>
                </div>
            </section>
        </PublicLayout>
    );
}
