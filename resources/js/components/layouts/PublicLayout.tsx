import { useState, useEffect, ReactNode } from 'react';
import { Link, usePage, Head } from '@inertiajs/react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { site as company } from '@/content/site';
import { Menu, X, Phone, MapPin, Mail, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/Components/brand/Logo';

interface PublicLayoutProps {
    children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    const { url } = usePage();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [url]);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileMenuOpen]);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Tours', href: '/tours' },
        { name: 'Contact', href: '/contact' },
    ];

    const isHomePage = url === '/';
    // Let's assume Tours Show page also has a cinematic hero
    const isTourShowPage = url.startsWith('/tours/');
    const hasTransparentHeader = isHomePage || isTourShowPage;
    
    // Header styling logic
    const headerIsSolid = !hasTransparentHeader || scrolled;

    const organizationJsonLd = {
        "@context": "https://schema.org",
        "@type": "TravelAgency",
        "name": company.name,
        "url": "https://nisalatravels.lk",
        "logo": "https://nisalatravels.lk/images/brand/logo.png",
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": company.phone,
            "contactType": "customer service"
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans text-foreground bg-neutral-50 selection:bg-primary/30 selection:text-primary-foreground">
            <Head>
                <script type="application/ld+json">
                    {JSON.stringify(organizationJsonLd)}
                </script>
            </Head>
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:font-bold focus:rounded-md focus:shadow-md"
            >
                Skip to content
            </a>

            {/* Navigation Bar */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-transparent ${
                    headerIsSolid 
                        ? 'bg-white/80 backdrop-blur-2xl shadow-sm py-4 border-neutral-200/50' 
                        : 'bg-transparent py-6'
                }`}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex-shrink-0 z-50">
                        <Logo 
                            href="/" 
                            variant="full" 
                            size="lg" 
                            theme={headerIsSolid ? 'light' : 'dark'} 
                            className="transition-transform duration-500 hover:scale-105"
                        />
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => {
                            const isActive = url === link.href || (link.href !== '/' && url.startsWith(link.href));
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`relative text-sm font-medium tracking-wide transition-colors hover:text-primary group ${
                                        isActive 
                                            ? 'text-primary' 
                                            : headerIsSolid 
                                                ? 'text-neutral-600' 
                                                : 'text-white/90'
                                    }`}
                                >
                                    {link.name}
                                    {isActive && (
                                        <motion.div 
                                            layoutId="nav-indicator"
                                            className="absolute -bottom-2 left-0 right-0 h-[2px] bg-primary rounded-full"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-6">
                        <a
                            href={`tel:${company.phone.replace(/\s+/g, '')}`}
                            className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 hover:scale-105 ${
                                headerIsSolid ? 'text-neutral-700 hover:text-primary' : 'text-white hover:text-white/80'
                            }`}
                        >
                            <Phone className="w-4 h-4" />
                            <span className="hidden lg:inline tracking-tight">{company.phone}</span>
                        </a>
                        <Button
                            render={<Link href="/contact" />}
                            className="rounded-full px-7 py-5 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            Plan My Trip
                        </Button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className={`md:hidden relative z-50 p-2 -mr-2 transition-colors ${
                            mobileMenuOpen || headerIsSolid ? 'text-neutral-900' : 'text-white'
                        }`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-40 bg-white md:hidden"
                    >
                        <div className="flex flex-col h-full pt-24 px-6 pb-12 overflow-y-auto">
                            <nav className="flex flex-col gap-6 mt-8">
                                {navLinks.map((link, i) => (
                                    <motion.div
                                        key={link.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * i, duration: 0.4 }}
                                    >
                                        <Link
                                            href={link.href}
                                            className={`flex items-center justify-between text-3xl font-serif font-bold transition-colors ${
                                                url === link.href ? 'text-primary' : 'text-neutral-900'
                                            }`}
                                        >
                                            {link.name}
                                            <ChevronRight className={`w-6 h-6 ${url === link.href ? 'text-primary' : 'text-neutral-300'}`} />
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>
                            <div className="mt-auto pt-12 flex flex-col gap-6">
                                <motion.a
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.4 }}
                                    href={`tel:${company.phone.replace(/\s+/g, '')}`}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 text-neutral-800 font-medium"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Call Us Directly</p>
                                        <p className="text-lg">{company.phone}</p>
                                    </div>
                                </motion.a>
                                
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.4 }}
                                >
                                    <Button
                                        render={<Link href="/contact" />}
                                        size="lg"
                                        className="w-full h-14 rounded-full text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                                    >
                                        Plan My Trip
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <AnimatePresence mode="wait">
                <motion.main
                    id="main-content"
                    key={url}
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex-grow flex flex-col w-full relative"
                >
                    {children}
                </motion.main>
            </AnimatePresence>

            {/* Redesigned Premium Footer */}
            <footer className="bg-[#0f172a] text-white pt-24 pb-12 relative overflow-hidden">
                {/* Abstract background element */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16 border-b border-white/10 pb-16">
                        
                        {/* Brand Column */}
                        <div className="lg:col-span-5 space-y-8">
                            <Logo href="/" variant="full" size="lg" theme="dark" className="brightness-0 invert" />
                            <p className="text-neutral-400 text-base leading-relaxed max-w-md">
                                {company.pitch}
                            </p>
                            <div className="flex items-center gap-5">
                                <a href={company.social.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300" aria-label="Facebook">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                </a>
                                <a href={company.social.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300" aria-label="Instagram">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                </a>
                            </div>
                        </div>

                        {/* Destinations */}
                        <div className="lg:col-span-3 lg:col-start-7">
                            <h3 className="text-lg font-serif font-medium mb-6 text-white tracking-wide">Popular Destinations</h3>
                            <ul className="space-y-4">
                                <li>
                                    <Link href="/tours?destination=Thailand" className="text-neutral-400 hover:text-primary hover:translate-x-1 inline-block transition-all duration-300">
                                        Thailand Getaways
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/tours?destination=India" className="text-neutral-400 hover:text-primary hover:translate-x-1 inline-block transition-all duration-300">
                                        Indian Expeditions
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/tours" className="text-neutral-400 hover:text-primary hover:translate-x-1 inline-block transition-all duration-300">
                                        View All Tours
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="lg:col-span-3">
                            <h3 className="text-lg font-serif font-medium mb-6 text-white tracking-wide">Reach Out</h3>
                            <ul className="space-y-5">
                                <li className="flex items-start gap-4 text-neutral-400 group">
                                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span className="mt-1 leading-snug group-hover:text-white transition-colors">{company.address}</span>
                                </li>
                                <li className="flex items-center gap-4 text-neutral-400 group">
                                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <a href={`tel:${company.phone.replace(/\s+/g, '')}`} className="group-hover:text-white transition-colors">
                                        {company.phone}
                                    </a>
                                </li>
                                <li className="flex items-center gap-4 text-neutral-400 group">
                                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <a href={`mailto:${company.email}`} className="group-hover:text-white transition-colors">
                                        {company.email}
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
                        <p className="text-sm text-neutral-500 font-medium">
                            &copy; {new Date().getFullYear()} {company.name}. All rights reserved.
                        </p>
                        <div className="flex items-center gap-8 text-sm font-medium">
                            <Link href="/privacy" className="text-neutral-500 hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-neutral-500 hover:text-white transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
