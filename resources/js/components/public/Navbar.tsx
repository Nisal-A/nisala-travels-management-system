import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X, ChevronDown, Globe, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/public/Button';
import { site as company } from '@/content/site';
import { useTheme } from '@/components/theme-provider';

// ---------------------------------------------------------------------------
// Language selector — English-only since no i18n infrastructure exists yet.
// The selector is implemented visually but indicates "EN" as the only option.
// ---------------------------------------------------------------------------
const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'English', shortLabel: 'EN' },
] as const;

type LangCode = typeof SUPPORTED_LANGUAGES[number]['code'];

function useLanguage() {
    const [lang, setLang] = useState<LangCode>(() => {
        return (localStorage.getItem('nisala-lang') as LangCode) || 'en';
    });
    const changeLang = useCallback((code: LangCode) => {
        localStorage.setItem('nisala-lang', code);
        setLang(code);
    }, []);
    return { lang, changeLang };
}

// ---------------------------------------------------------------------------
// Main Navbar component
// ---------------------------------------------------------------------------
export function Navbar() {
    const { url } = usePage();
    const { theme, setTheme } = useTheme();
    const { lang, changeLang } = useLanguage();

    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileDropdownsOpen, setMobileDropdownsOpen] = useState<Record<string, boolean>>({});
    const menuRef = useRef<HTMLDivElement>(null);

    // Dropdown visibility states for desktop utility menus
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

    const langRef = useRef<HTMLDivElement>(null);
    const themeRef = useRef<HTMLDivElement>(null);

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

    // Close utility dropdowns on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(e.target as Node)) {
                setLangDropdownOpen(false);
            }
            if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
                setThemeDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Close utility dropdowns on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setLangDropdownOpen(false);
                setThemeDropdownOpen(false);
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);

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
        { name: 'About Us', href: '/#about-us' },
        { name: 'Contact Us', href: '/contact' },
    ];

    const isHomePage = url === '/' || url.startsWith('/?');

    // Determine current theme icon
    const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
    const themeLabel = theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System';

    const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

    return (
        <>
            <header
                className={`fixed w-full top-0 z-50 transition-all duration-300 ${
                    !isHomePage || scrolled
                        ? 'bg-gradient-navbar shadow-lg h-[64px] lg:h-[76px]'
                        : 'bg-transparent h-[68px] lg:h-[80px]'
                }`}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl h-full flex items-center">
                    {/* ============================================================
                        LEFT: Floating Logo
                    ============================================================ */}
                    <Link
                        href="/"
                        className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-md relative z-[60] select-none"
                        aria-label="Nisala Travels Home"
                    >
                        <div
                            className={`transition-all duration-300 ${
                                !scrolled && isHomePage
                                    ? 'lg:translate-y-1.5'
                                    : 'translate-y-0'
                            }`}
                        >
                            <img
                                src="/images/nisala-travels-logo.png"
                                alt={`${company.name} Logo`}
                                className={`h-auto object-contain transition-all duration-300 drop-shadow-[0_1px_3px_rgba(255,255,255,0.7)] drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] ${
                                    scrolled || !isHomePage
                                        ? 'w-[105px] sm:w-[120px] lg:w-[135px]'
                                        : 'w-[115px] sm:w-[130px] lg:w-[155px]'
                                }`}
                            />
                        </div>
                    </Link>

                    {/* ============================================================
                        CENTER: Desktop Navigation
                    ============================================================ */}
                    <nav className="hidden lg:flex items-center justify-center flex-1 ml-8" aria-label="Main navigation">
                        <div className="flex items-center gap-6 xl:gap-8">
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
                                            <ChevronDown className="w-3.5 h-3.5 text-white/70 group-hover:text-brand-gold transition-transform group-hover:rotate-180 cursor-default" />
                                        </div>
                                        <span className={`absolute bottom-0 left-0 h-[2px] bg-brand-gold transition-all duration-300 ${url.startsWith(link.href) ? 'w-full' : 'w-0 group-hover:w-full'}`} />

                                        <div className="absolute top-full left-0 pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-md overflow-hidden border border-neutral-100 dark:border-neutral-800 flex flex-col">
                                                {link.children.map((child) => (
                                                    <Link
                                                        key={child.name}
                                                        href={child.href}
                                                        className={`px-4 py-3 text-sm font-medium transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-brand-navy dark:hover:text-brand-gold focus-visible:bg-neutral-50 dark:focus-visible:bg-neutral-800 focus-visible:outline-none ${url === child.href ? 'text-brand-navy dark:text-brand-gold bg-neutral-50 dark:bg-neutral-800/60 font-semibold' : 'text-gray-800 dark:text-gray-200'}`}
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
                        </div>
                    </nav>

                    {/* ============================================================
                        RIGHT: Utility controls (desktop)
                    ============================================================ */}
                    <div className="hidden lg:flex items-center gap-3 flex-shrink-0 ml-6">
                        {/* Enquire Now Button */}
                        <Button
                            render={<Link href="/contact" />}
                            variant="accent"
                            size="sm"
                        >
                            Enquire Now
                        </Button>

                        {/* Language Selector */}
                        <div ref={langRef} className="relative">
                            <button
                                onClick={() => {
                                    setLangDropdownOpen(prev => !prev);
                                    setThemeDropdownOpen(false);
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-white/90 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                                aria-expanded={langDropdownOpen}
                                aria-haspopup="true"
                                aria-label="Select language"
                            >
                                <Globe className="w-4 h-4" />
                                <span>{currentLang.shortLabel}</span>
                                <ChevronDown className={`w-3 h-3 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {langDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-44 bg-white dark:bg-neutral-900 shadow-xl rounded-md overflow-hidden border border-neutral-100 dark:border-neutral-800 z-50">
                                    {SUPPORTED_LANGUAGES.map((l) => (
                                        <button
                                            key={l.code}
                                            onClick={() => {
                                                changeLang(l.code);
                                                setLangDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 focus-visible:bg-neutral-50 dark:focus-visible:bg-neutral-800 focus-visible:outline-none ${
                                                lang === l.code ? 'text-brand-navy dark:text-brand-gold bg-neutral-50 dark:bg-neutral-800/60 font-semibold' : 'text-gray-700 dark:text-gray-200'
                                            }`}
                                        >
                                            {l.label}
                                        </button>
                                    ))}
                                    <div className="px-4 py-2 text-[11px] text-neutral-400 dark:text-neutral-500 border-t border-neutral-100 dark:border-neutral-800">
                                        More languages coming soon
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Theme Selector */}
                        <div ref={themeRef} className="relative">
                            <button
                                onClick={() => {
                                    setThemeDropdownOpen(prev => !prev);
                                    setLangDropdownOpen(false);
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-white/90 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                                aria-expanded={themeDropdownOpen}
                                aria-haspopup="true"
                                aria-label="Select theme"
                            >
                                <ThemeIcon className="w-4 h-4" />
                                <ChevronDown className={`w-3 h-3 transition-transform ${themeDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {themeDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-neutral-900 shadow-xl rounded-md overflow-hidden border border-neutral-100 dark:border-neutral-800 z-50">
                                    {([
                                        { value: 'light' as const, label: 'Light', icon: Sun },
                                        { value: 'dark' as const, label: 'Dark', icon: Moon },
                                        { value: 'system' as const, label: 'System', icon: Monitor },
                                    ]).map(({ value, label, icon: Icon }) => (
                                        <button
                                            key={value}
                                            onClick={() => {
                                                setTheme(value);
                                                setThemeDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 focus-visible:bg-neutral-50 dark:focus-visible:bg-neutral-800 focus-visible:outline-none ${
                                                theme === value ? 'text-brand-navy dark:text-brand-gold bg-neutral-50 dark:bg-neutral-800/60 font-semibold' : 'text-gray-700 dark:text-gray-200'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ============================================================
                        Mobile Menu Toggle
                    ============================================================ */}
                    <button
                        className="lg:hidden p-2 -mr-2 ml-auto text-white rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-expanded={mobileMenuOpen}
                        aria-label="Open menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* ================================================================
                Mobile Menu Slide-over
            ================================================================ */}
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
                        className="relative ml-auto w-full max-w-sm bg-white dark:bg-neutral-900 h-full shadow-2xl flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <img
                                src="/images/nisala-travels-logo.png"
                                alt={`${company.name} Logo`}
                                className="w-[110px] h-auto object-contain dark:drop-shadow-[0_1px_3px_rgba(255,255,255,0.7)] dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                            />
                            <button
                                className="p-2 -mr-2 text-brand-navy dark:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                                onClick={() => setMobileMenuOpen(false)}
                                aria-label="Close menu"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <nav className="flex flex-col gap-1 flex-1" aria-label="Mobile navigation">
                            {navLinks.map((link) => (
                                <div key={link.name} className="flex flex-col">
                                    <div className={`flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 ${url === link.href || (link.children && url.startsWith(link.href)) ? 'border-l-4 border-l-brand-gold pl-4' : ''}`}>
                                        <Link
                                            href={link.href}
                                            className={`text-base font-bold py-3.5 flex-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-sm text-brand-navy dark:text-white`}
                                            onClick={() => { if (!link.children) setMobileMenuOpen(false); }}
                                        >
                                            {link.name}
                                        </Link>
                                        {link.children && (
                                            <button
                                                className="p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-sm"
                                                onClick={() => toggleMobileDropdown(link.name)}
                                                aria-expanded={mobileDropdownsOpen[link.name]}
                                                aria-label={`Toggle ${link.name} dropdown`}
                                            >
                                                <ChevronDown className={`w-5 h-5 text-brand-navy dark:text-white transition-transform ${mobileDropdownsOpen[link.name] ? 'rotate-180' : ''}`} />
                                            </button>
                                        )}
                                    </div>
                                    {link.children && mobileDropdownsOpen[link.name] && (
                                        <div className="flex flex-col mt-1 mb-1 bg-neutral-50 dark:bg-neutral-800 rounded-md overflow-hidden">
                                            {link.children.map((child) => (
                                                <Link
                                                    key={child.name}
                                                    href={child.href}
                                                    className={`py-2.5 px-6 text-sm font-medium border-b border-neutral-100 dark:border-neutral-700 last:border-b-0 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700 focus-visible:bg-neutral-100 focus-visible:outline-none focus-visible:text-brand-gold ${url === child.href ? 'text-brand-gold' : 'text-gray-800 dark:text-gray-200'}`}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Mobile: Enquire Now */}
                            <div className="mt-6">
                                <Button
                                    render={<Link href="/contact" />}
                                    variant="accent"
                                    size="lg"
                                    className="w-full"
                                >
                                    Enquire Now
                                </Button>
                            </div>

                            {/* Mobile: Language & Theme */}
                            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700 space-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Language</p>
                                    <div className="flex gap-2">
                                        {SUPPORTED_LANGUAGES.map((l) => (
                                            <button
                                                key={l.code}
                                                onClick={() => changeLang(l.code)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                                    lang === l.code
                                                        ? 'bg-brand-navy text-white'
                                                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                                }`}
                                            >
                                                <Globe className="w-4 h-4" />
                                                {l.label}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-neutral-400 mt-1.5">More languages coming soon</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Theme</p>
                                    <div className="flex gap-2">
                                        {([
                                            { value: 'light' as const, label: 'Light', icon: Sun },
                                            { value: 'dark' as const, label: 'Dark', icon: Moon },
                                            { value: 'system' as const, label: 'System', icon: Monitor },
                                        ]).map(({ value, label, icon: Icon }) => (
                                            <button
                                                key={value}
                                                onClick={() => setTheme(value)}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                                    theme === value
                                                        ? 'bg-brand-navy text-white'
                                                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                                }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
