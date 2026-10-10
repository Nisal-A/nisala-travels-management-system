import { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/public/Button';
import { site as company } from '@/content/site';

export function Navbar() {
    const { url } = usePage();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileDropdownsOpen, setMobileDropdownsOpen] = useState<Record<string, boolean>>({});
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMobileDropdown = (name: string) => {
        setMobileDropdownsOpen(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

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

    type NavLinkType = {
        name: string;
        href: string;
        children?: { name: string; href: string; }[];
    };

    const navLinks: NavLinkType[] = [
        { name: 'Home', href: '/' },
        { name: 'Destinations', href: '/our-destinations' },
        {
            name: 'Tour Packages',
            href: '/our-tours',
            children: [
                { name: 'All Tours', href: '/our-tours' },
                { name: 'Interactive Tour Finder', href: '/interactive-tours' },
            ]
        },
        { name: 'About Us', href: '/about' },
        { name: 'Contact Us', href: '/contact' },
    ];

    return (
        <>
            <header className={`sticky top-0 z-50 bg-gradient-navbar transition-all duration-300 ${scrolled ? 'shadow-sm py-2' : 'py-4'}`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center justify-between">
                    <Link href="/" className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md" aria-label="Nisala Travels Home">
                        <img
                            src="/images/nisala-travels-logo.png"
                            alt={`${company.name} Logo`}
                            className="w-[150px] lg:w-[170px] h-auto object-contain"
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            link.children ? (
                                <div key={link.name} className="relative group py-2">
                                    <div className="flex items-center gap-1">
                                        <Link
                                            href={link.href}
                                            className={`relative text-sm font-semibold transition-colors text-white group-hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-sm`}
                                        >
                                            {link.name}
                                        </Link>
                                        <ChevronDown className="w-4 h-4 text-white group-hover:text-brand-gold transition-transform group-hover:rotate-180 cursor-default" />
                                    </div>
                                    <span className={`absolute bottom-0 left-0 h-[2px] bg-brand-gold transition-all duration-300 ${url.startsWith(link.href) ? 'w-full' : 'w-0 group-hover:w-full'}`} />

                                    <div className="absolute top-full left-0 pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        <div className="bg-white shadow-lg rounded-md overflow-hidden border border-neutral-100 flex flex-col">
                                            {link.children.map((child) => (
                                                <Link
                                                    key={child.name}
                                                    href={child.href}
                                                    className={`px-4 py-3 text-sm font-medium transition-colors hover:bg-neutral-50 hover:text-brand-navy focus-visible:bg-neutral-50 focus-visible:outline-none focus-visible:text-brand-navy ${url === child.href ? 'text-brand-navy bg-neutral-50' : 'text-gray-800'}`}
                                                >
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`relative text-sm font-semibold transition-colors py-2 text-white hover:text-brand-gold group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-sm`}
                                >
                                    {link.name}
                                    <span className={`absolute bottom-0 left-0 h-[2px] bg-brand-gold transition-all duration-300 ${url === link.href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                                </Link>
                            )
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
                        className="lg:hidden p-2 -mr-2 text-white rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
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
                                className="w-[130px] h-auto object-contain"
                            />
                            <button
                                className="p-2 -mr-2 text-brand-navy rounded-full hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                                onClick={() => setMobileMenuOpen(false)}
                                aria-label="Close menu"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <nav className="flex flex-col gap-2 flex-1">
                            {navLinks.map((link) => (
                                <div key={link.name} className="flex flex-col">
                                    <div className={`flex items-center justify-between border-b border-neutral-100 ${url === link.href || (link.children && url.startsWith(link.href)) ? 'border-l-4 border-brand-gold pl-4' : ''}`}>
                                        <Link
                                            href={link.href}
                                            className={`text-lg font-bold py-4 flex-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-sm ${url === link.href ? 'text-brand-navy' : 'text-brand-navy'}`}
                                            onClick={() => { if (!link.children) setMobileMenuOpen(false); }}
                                        >
                                            {link.name}
                                        </Link>
                                        {link.children && (
                                            <button
                                                className="p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-sm"
                                                onClick={() => toggleMobileDropdown(link.name)}
                                                aria-expanded={mobileDropdownsOpen[link.name]}
                                                aria-label={`Toggle ${link.name} dropdown`}
                                            >
                                                <ChevronDown className={`w-5 h-5 text-brand-navy transition-transform ${mobileDropdownsOpen[link.name] ? 'rotate-180' : ''}`} />
                                            </button>
                                        )}
                                    </div>
                                    {link.children && mobileDropdownsOpen[link.name] && (
                                        <div className="flex flex-col mt-2 mb-2 bg-neutral-50 rounded-md overflow-hidden">
                                            {link.children.map((child) => (
                                                <Link
                                                    key={child.name}
                                                    href={child.href}
                                                    className={`py-3 px-6 text-base font-medium border-b border-neutral-100 last:border-b-0 transition-colors hover:bg-neutral-100 focus-visible:bg-neutral-100 focus-visible:outline-none focus-visible:text-brand-gold ${url === child.href ? 'text-brand-gold' : 'text-gray-800'}`}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
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
