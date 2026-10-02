import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Reveal } from '@/components/common/Reveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Calendar, Star, Clock, Heart, Shield, ArrowRight } from 'lucide-react';
import axios from 'axios';

// Embla carousel for featured tours
import useEmblaCarousel from 'embla-carousel-react';

// Radix Accordion for FAQ
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

export default function Home() {
    const [destination, setDestination] = useState('');
    const [month, setMonth] = useState('');

    const [featuredTours, setFeaturedTours] = useState<any[]>([]);
    const [loadingTours, setLoadingTours] = useState(true);
    const [emblaRef] = useEmblaCarousel({ loop: false, align: 'start' });

    useEffect(() => {
        axios.get('/api/public/tours/featured')
            .then(res => {
                setFeaturedTours(res.data.data);
                setLoadingTours(false);
            })
            .catch(() => setLoadingTours(false));
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/tours', { destination, month });
    };

    return (
        <PublicLayout>
            <Head title="Premium Travel & Tour Packages | Nisala Travels" />

            {/* 1. HERO SECTION */}
            <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-neutral-900/40 z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
                        alt="Beautiful travel destination"
                        className="w-full h-full object-cover"
                        loading="eager"
                    />
                </div>

                <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
                    <Reveal delay={0.2}>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
                            Discover the World <br /> With Confidence
                        </h1>
                    </Reveal>
                    <Reveal delay={0.4}>
                        <p className="text-lg md:text-xl text-neutral-200 mb-10 max-w-2xl mx-auto font-medium shadow-sm">
                            Tailored itineraries, premium experiences, and memories that last a lifetime.
                        </p>
                    </Reveal>

                    <Reveal delay={0.6}>
                        <div className="max-w-4xl mx-auto bg-white p-3 rounded-2xl md:rounded-full shadow-2xl">
                            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                                    <Input
                                        type="text"
                                        placeholder="Where do you want to go?"
                                        className="w-full pl-12 h-14 border-0 bg-neutral-50 rounded-xl md:rounded-l-full md:rounded-r-none text-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-white transition-colors"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                    />
                                </div>
                                <div className="w-px bg-neutral-200 hidden md:block my-2" />
                                <div className="flex-1 relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                                    <select
                                        className="w-full pl-12 h-14 border-0 bg-neutral-50 rounded-xl md:rounded-none text-lg text-neutral-600 focus:ring-1 focus:ring-primary focus:bg-white transition-colors appearance-none outline-none"
                                        value={month}
                                        onChange={(e) => setMonth(e.target.value)}
                                    >
                                        <option value="">Any month</option>
                                        <option value="January">January</option>
                                        <option value="February">February</option>
                                        <option value="March">March</option>
                                        <option value="April">April</option>
                                        <option value="May">May</option>
                                        <option value="June">June</option>
                                        <option value="July">July</option>
                                        <option value="August">August</option>
                                        <option value="September">September</option>
                                        <option value="October">October</option>
                                        <option value="November">November</option>
                                        <option value="December">December</option>
                                    </select>
                                </div>
                                <Button type="submit" size="lg" className="h-14 md:w-40 rounded-xl md:rounded-r-full md:rounded-l-none text-lg font-semibold gap-2">
                                    <Search className="w-5 h-5" />
                                    Search
                                </Button>
                            </form>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* 2. FEATURED TOURS CAROUSEL */}
            <section className="py-24 bg-neutral-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Reveal>
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 mb-4">Featured Tours</h2>
                                <p className="text-lg text-neutral-600">Handpicked packages for your next adventure.</p>
                            </div>
                            <Link href="/tours" className="hidden md:flex items-center text-primary font-medium hover:underline gap-1">
                                View all tours <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </Reveal>

                    <Reveal delay={0.2}>
                        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
                            <div className="flex gap-6 pb-8" style={{ backfaceVisibility: 'hidden', touchAction: 'pan-y' }}>
                                {loadingTours ? (
                                    // Skeletons
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] min-w-0">
                                            <div className="bg-white rounded-2xl h-96 animate-pulse p-4 flex flex-col justify-end border border-neutral-100">
                                                <div className="h-4 bg-neutral-200 rounded w-1/3 mb-2" />
                                                <div className="h-6 bg-neutral-200 rounded w-3/4 mb-4" />
                                                <div className="h-4 bg-neutral-200 rounded w-1/2" />
                                            </div>
                                        </div>
                                    ))
                                ) : featuredTours.length > 0 ? (
                                    featuredTours.map((tour) => (
                                        <div key={tour.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] min-w-0 group">
                                            <Link href={`/tours/${tour.slug || tour.id}`} className="block h-full">
                                                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-neutral-100 relative group-hover:-translate-y-1">
                                                    <div className="absolute top-4 left-4 z-10">
                                                        <span className="bg-white/90 backdrop-blur-sm text-neutral-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                                            {tour.destination}
                                                        </span>
                                                    </div>
                                                    <div className="h-56 overflow-hidden bg-neutral-200 relative">
                                                        <img
                                                            src={tour.hero_image || `https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=800&auto=format&fit=crop&random=${tour.id}`}
                                                            alt={tour.package_name}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                    <div className="p-6 flex-grow flex flex-col">
                                                        <h3 className="text-xl font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{tour.package_name}</h3>
                                                        <div className="flex items-center gap-4 text-sm text-neutral-500 mb-6 mt-auto">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4" /> {tour.duration_days} Days
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                                                            <div>
                                                                <span className="text-xs text-neutral-500 block">From</span>
                                                                <span className="text-lg font-bold text-neutral-900">{tour.currency} {tour.price_from?.toLocaleString()}</span>
                                                            </div>
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                                                <ArrowRight className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-full text-center py-12 text-neutral-500">
                                        No featured tours available at the moment.
                                    </div>
                                )}
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* 3. POPULAR DESTINATIONS */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Reveal>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 mb-4">Popular Destinations</h2>
                            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">Explore our most sought-after locations for your next holiday.</p>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: 'Sri Lanka', image: 'https://images.unsplash.com/photo-1588258524340-410a51c41b80?q=80&w=600&auto=format&fit=crop' },
                            { name: 'Maldives', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=600&auto=format&fit=crop' },
                            { name: 'Dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop' },
                            { name: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=600&auto=format&fit=crop' }
                        ].map((dest, i) => (
                            <Reveal key={dest.name} delay={i * 0.1}>
                                <Link href={`/tours?destination=${dest.name}`} className="group block relative h-80 rounded-2xl overflow-hidden shadow-md">
                                    <div className="absolute inset-0 bg-neutral-900/30 group-hover:bg-neutral-900/20 transition-colors z-10" />
                                    <img src={dest.image} alt={dest.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
                                        <h3 className="text-2xl font-bold text-white mb-1 group-hover:translate-x-2 transition-transform">{dest.name}</h3>
                                        <span className="text-white/90 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                                            Explore Tours <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </Link>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. WHY CHOOSE US */}
            <section className="py-24 bg-neutral-950 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <Reveal>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Why Travel With Us</h2>
                            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">We don't just book trips, we design unforgettable experiences tailored to your exact needs.</p>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: <MapPin className="w-8 h-8 text-primary" />, title: 'Local Expertise', desc: 'Deep knowledge of destinations to uncover hidden gems and authentic experiences.' },
                            { icon: <Star className="w-8 h-8 text-primary" />, title: 'Tailored Itineraries', desc: 'Every trip is customized to fit your personal style, pace, and preferences.' },
                            { icon: <Shield className="w-8 h-8 text-primary" />, title: 'Transparent Pricing', desc: 'No hidden fees. You get premium service with clear, upfront costs.' },
                            { icon: <Heart className="w-8 h-8 text-primary" />, title: '24/7 Support', desc: 'We are with you every step of the way, providing assistance whenever you need it.' }
                        ].map((feature, i) => (
                            <Reveal key={feature.title} delay={i * 0.1}>
                                <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 p-8 rounded-2xl hover:bg-neutral-800 transition-colors">
                                    <div className="w-16 h-16 rounded-2xl bg-neutral-950 flex items-center justify-center mb-6 shadow-inner">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-neutral-400 leading-relaxed text-sm">
                                        {feature.desc}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. HOW IT WORKS */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Reveal>
                        <div className="text-center mb-20">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 mb-4">How It Works</h2>
                            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">Your dream holiday is just three simple steps away.</p>
                        </div>
                    </Reveal>

                    <div className="flex flex-col md:flex-row justify-center gap-12 relative">
                        <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-neutral-100 z-0" />
                        {[
                            { step: '01', title: 'Tell Us', desc: 'Share your dreams, dates, and preferences through our simple form.' },
                            { step: '02', title: 'We Plan', desc: 'Our experts craft a personalized itinerary tailored exactly to your needs.' },
                            { step: '03', title: 'You Travel', desc: 'Pack your bags and enjoy a seamless, unforgettable holiday experience.' }
                        ].map((item, i) => (
                            <Reveal key={item.step} delay={i * 0.2} className="flex-1 relative z-10 text-center">
                                <div className="w-24 h-24 mx-auto bg-white border-8 border-neutral-50 rounded-full flex items-center justify-center shadow-lg mb-8">
                                    <span className="text-2xl font-black text-primary">{item.step}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-neutral-900 mb-3">{item.title}</h3>
                                <p className="text-neutral-600 px-4">{item.desc}</p>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. TESTIMONIALS */}
            <section className="py-24 bg-neutral-50 overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Reveal>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 mb-4">What Our Travelers Say</h2>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Sarah Jenkins", trip: "Maldives Honeymoon", text: "Absolutely flawless execution. Everything from the transfers to the resort was perfect. Nisala Travels made our honeymoon truly magical." },
                            { name: "Michael Chang", trip: "Sri Lanka Explorer", text: "The local guides were incredible and the itinerary was perfectly paced. I saw parts of the country I would never have found on my own." },
                            { name: "Emma Thompson", trip: "Dubai City Break", text: "Highly professional service. They handled a last-minute flight change seamlessly. I'll definitely be booking my next trip with them." }
                        ].map((review, i) => (
                            <Reveal key={i} delay={i * 0.1}>
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 h-full flex flex-col relative">
                                    <div className="flex text-amber-400 mb-6">
                                        {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-5 h-5 fill-current" />)}
                                    </div>
                                    <p className="text-neutral-700 leading-relaxed italic mb-8 flex-grow">"{review.text}"</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                                            {review.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-neutral-900">{review.name}</h4>
                                            <span className="text-xs text-neutral-500">{review.trip}</span>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. FAQ */}
            <section className="py-24 bg-white max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <Reveal>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 mb-4">Frequently Asked Questions</h2>
                    </div>
                </Reveal>

                <Reveal delay={0.2}>
                    <Accordion.Root type="single" collapsible className="w-full space-y-4">
                        {[
                            { q: 'Do you provide visa assistance?', a: 'Yes, we provide comprehensive guidance and assistance for visa applications to all our featured destinations.' },
                            { q: 'Can I customize a pre-packaged tour?', a: 'Absolutely. All our itineraries serve as inspiration and can be completely tailored to match your specific interests, dates, and budget.' },
                            { q: 'What payment methods do you accept?', a: 'We accept major credit cards (Visa, Mastercard, Amex), bank transfers, and secure online payment gateways. Payment plans are also available for bookings made well in advance.' },
                            { q: 'What is your cancellation policy?', a: 'Our cancellation policy varies depending on the specific package and suppliers involved. Detailed terms will be provided with your personalized itinerary proposal.' },
                        ].map((faq, i) => (
                            <Accordion.Item key={i} value={`item-${i}`} className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                <Accordion.Header>
                                    <Accordion.Trigger className="flex justify-between items-center w-full p-6 font-semibold text-left text-neutral-900 hover:text-primary transition-colors group">
                                        {faq.q}
                                        <ChevronDown className="w-5 h-5 text-neutral-400 group-data-[state=open]:rotate-180 transition-transform duration-300" />
                                    </Accordion.Trigger>
                                </Accordion.Header>
                                <Accordion.Content className="overflow-hidden text-neutral-600 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                                    <div className="p-6 pt-0 leading-relaxed text-sm">
                                        {faq.a}
                                    </div>
                                </Accordion.Content>
                            </Accordion.Item>
                        ))}
                    </Accordion.Root>
                </Reveal>
            </section>

            {/* 8. CTA BAND */}
            <section className="py-24 bg-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <Reveal>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to plan your trip?</h2>
                        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">Let our experts craft the perfect holiday experience for you. Get in touch today for a free consultation.</p>
                        <Button asChild size="lg" variant="secondary" className="h-14 px-10 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                            <Link href="/contact">Enquire Now</Link>
                        </Button>
                    </Reveal>
                </div>
            </section>
        </PublicLayout>
    );
}
