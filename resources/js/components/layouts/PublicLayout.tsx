import { useState, useEffect, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { company } from '@/config/company';
import { Menu, X, Phone, MessageCircle, MapPin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';

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
            setScrolled(window.scrollY > 60);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu on navigation
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [url]);

    // Prevent body scroll when mobile menu is open
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
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <div className="min-h-screen flex flex-col font-sans text-neutral-900 bg-white">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-primary focus:font-bold focus:rounded-md focus:shadow-md"
            >
                Skip to content
            </a>

            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
                }`}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <Link
                        href="/"
                        className={`text-2xl font-bold tracking-tight transition-colors ${scrolled ? 'text-primary' : 'text-white'}`}
                    >
                        {company.name}
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`text-sm font-medium transition-colors hover:text-primary ${
                                    url === link.href ? 'text-primary' : scrolled ? 'text-neutral-600' : 'text-white/90'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <a
                            href={`tel:${company.phone.replace(/\s+/g, '')}`}
                            className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${scrolled ? 'text-neutral-700' : 'text-white'}`}
                        >
                            <Phone className="w-4 h-4" />
                            <span className="hidden lg:inline">{company.phone}</span>
                        </a>
                        <Button
                            render={<Link href="/contact" />}
                            className="rounded-full px-6 shadow-md hover:shadow-lg transition-all"
                        >
                            Enquire Now
                        </Button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className={`md:hidden p-2 -mr-2 transition-colors ${scrolled ? 'text-neutral-900' : 'text-white'}`}
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[100] bg-white flex flex-col md:hidden"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="p-4 flex justify-end">
                            <button
                                className="p-3 text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-neutral-100"
                                onClick={() => setMobileMenuOpen(false)}
                                aria-label="Close menu"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <nav className="flex-1 flex flex-col px-6 pt-8 pb-12 gap-2 overflow-y-auto">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`text-3xl font-bold py-4 border-b border-neutral-100 transition-colors ${
                                        url === link.href ? 'text-primary' : 'text-neutral-900'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="mt-auto pt-8 flex flex-col gap-4">
                                <a
                                    href={`tel:${company.phone.replace(/\s+/g, '')}`}
                                    className="flex items-center gap-3 text-lg font-medium text-neutral-700"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    {company.phone}
                                </a>
                                <a
                                    href={`mailto:${company.email}`}
                                    className="flex items-center gap-3 text-lg font-medium text-neutral-700"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    {company.email}
                                </a>
                                <Button
                                    render={<Link href="/contact" />}
                                    size="lg"
                                    className="w-full mt-4 rounded-full text-lg h-14"
                                >
                                    Enquire Now
                                </Button>
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                <motion.main
                    id="main-content"
                    key={url}
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-grow flex flex-col"
                >
                    {children}
                </motion.main>
            </AnimatePresence>

            <footer className="bg-neutral-950 text-neutral-300 py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
                        {/* Brand */}
                        <div className="space-y-6">
                            <Link href="/" className="text-2xl font-bold text-white tracking-tight">
                                {company.name}
                            </Link>
                            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
                                Creating unforgettable travel experiences tailored to your dreams. We handle the
                                details, you enjoy the journey.
                            </p>
                            <div className="flex items-center gap-4">
                                <a
                                    href={company.social.facebook}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-neutral-400 hover:text-white transition-colors"
                                    aria-label="Facebook"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path
                                            fillRule="evenodd"
                                            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                                <a
                                    href={company.social.instagram}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-neutral-400 hover:text-white transition-colors"
                                    aria-label="Instagram"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path
                                            fillRule="evenodd"
                                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                                <a
                                    href={company.social.twitter}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-neutral-400 hover:text-white transition-colors"
                                    aria-label="Twitter"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
                            <ul className="space-y-3">
                                {navLinks.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-neutral-400 hover:text-white transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <Link
                                        href="/faq"
                                        className="text-sm text-neutral-400 hover:text-white transition-colors"
                                    >
                                        FAQs
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Popular Destinations */}
                        <div>
                            <h3 className="text-white font-semibold mb-6">Popular Destinations</h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link
                                        href="/tours?destination=Sri+Lanka"
                                        className="text-sm text-neutral-400 hover:text-white transition-colors"
                                    >
                                        Sri Lanka
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/tours?destination=Maldives"
                                        className="text-sm text-neutral-400 hover:text-white transition-colors"
                                    >
                                        Maldives
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/tours?destination=Dubai"
                                        className="text-sm text-neutral-400 hover:text-white transition-colors"
                                    >
                                        Dubai
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/tours?destination=Singapore"
                                        className="text-sm text-neutral-400 hover:text-white transition-colors"
                                    >
                                        Singapore
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="text-white font-semibold mb-6">Contact Us</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-sm text-neutral-400">
                                    <MapPin className="w-5 h-5 text-primary shrink-0" />
                                    <span>{company.address}</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-neutral-400">
                                    <Phone className="w-5 h-5 text-primary shrink-0" />
                                    <a
                                        href={`tel:${company.phone.replace(/\s+/g, '')}`}
                                        className="hover:text-white transition-colors"
                                    >
                                        {company.phone}
                                    </a>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-neutral-400">
                                    <Mail className="w-5 h-5 text-primary shrink-0" />
                                    <a href={`mailto:${company.email}`} className="hover:text-white transition-colors">
                                        {company.email}
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-neutral-500">
                            &copy; {new Date().getFullYear()} {company.name}. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link
                                href="/privacy"
                                className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/terms"
                                className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                            >
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>

            <WhatsAppButton variant="floating" />
        </div>
    );
}
