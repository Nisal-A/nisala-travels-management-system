import { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/public/Button';
import { site as company } from '@/content/site';

export function Navbar() {
    const { url } = usePage();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Scroll shadow effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [url]);

    // Body lock
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [mobileMenuOpen]);

    // Focus trap & Escape to close
    useEffect(() => {
        if (!mobileMenuOpen) return;

        const focusableElements = menuRef.current?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0];
        const lastElement = focusableElements?.[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setMobileMenuOpen(false);
            }
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement?.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement?.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        firstElement?.focus();

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [mobileMenuOpen]);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Destinations', href: '/our-destinations' },
        { name: 'Tour Packages', href: '/interactive-tours' },
        { name: 'About Us', href: '/about' },
        { name: 'Contact Us', href: '/contact' },
    ];

    return (
        <>
            <header className={`sticky top-0 z-50 bg-white transition-all duration-300 ${scrolled ? 'shadow-sm py-2' : 'py-4'}`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center justify-between">
                    <Link href="/" className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md" aria-label="Nisala Travels Home">
                        <img
                            src="/images/nisala-travels-logo.png"
                            alt={`${company.name} Logo`}
                            className="h-10 w-auto object-contain"
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`relative text-sm font-semibold transition-colors py-2 text-primary hover:text-accent group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm`}
                            >
                                {link.name}
                                <span className={`absolute bottom-0 left-0 h-[2px] bg-accent transition-all duration-300 ${url === link.href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden lg:block">
                        <Button
                            render={<Link href="/contact" />}
                            variant="accent"
                            size="md"
                        >
                            Enquire Now
                        </Button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden p-2 -mr-2 text-primary rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-expanded={mobileMenuOpen}
                        aria-label="Open menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Slide-over */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-[100] lg:hidden flex"
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="fixed inset-0 bg-black/50 transition-opacity"
                        onClick={() => setMobileMenuOpen(false)}
                        aria-hidden="true"
                    />
                    <div
                        ref={menuRef}
                        className="relative ml-auto w-full max-w-sm bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <img
                                src="/images/nisala-travels-logo.png"
                                alt={`${company.name} Logo`}
                                className="h-8 w-auto object-contain"
                            />
                            <button
                                className="p-2 -mr-2 text-primary rounded-full hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                onClick={() => setMobileMenuOpen(false)}
                                aria-label="Close menu"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <nav className="flex flex-col gap-2 flex-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`text-lg font-bold py-4 border-b border-neutral-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm ${url === link.href ? 'text-accent' : 'text-primary'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="mt-8">
                                <Button
                                    render={<Link href="/contact" />}
                                    variant="accent"
                                    size="lg"
                                    className="w-full"
                                >
                                    Enquire Now
                                </Button>
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
