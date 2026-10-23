import { useState, type ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Globe, Menu, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import type { CompanyConfig, PageProps } from '@/types';

interface PublicLayoutProps {
    children: ReactNode;
}

const NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'Destinations', href: '/our-destinations' },
    { label: 'Tours', href: '/our-tours' },
    { label: 'Travel Guides', href: '/travel-guides' },
    { label: 'Contact', href: '/contact' },
];

export default function PublicLayout({ children }: PublicLayoutProps) {
    const { url } = usePage();
    const props = usePage<PageProps>().props;
    const company = (props.company || {}) as CompanyConfig;
    const [mobileOpen, setMobileOpen] = useState(false);

    const companyName = company.name || 'Nisala Travels';
    const companyPhone = company.phone || '+94 11 234 5678';
    const companyEmail = company.support_email || 'support@nisalatravels.com';
    const companyAddress = company.address || '123 Travel Road, Colombo, Sri Lanka';
    const companyWhatsapp = company.whatsapp_url || 'https://wa.me/94771234567';

    const isLinkActive = (href: string) => {
        if (href === '/') {
            return url === '/' || url === '';
        }
        return url.startsWith(href);
    };

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
            {/* Sticky Header */}
            <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Brand / Logo */}
                    <Link
                        href="/"
                        className="group flex items-center gap-2.5 transition-transform duration-200 hover:scale-[1.02]"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25 transition-colors group-hover:bg-primary/90">
                            <Globe className="h-5 w-5" />
                        </div>
                        <span className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
                            {companyName}
                        </span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-1 lg:gap-1.5" aria-label="Main Navigation">
                        {NAV_LINKS.map((link) => {
                            const active = isLinkActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                                        active
                                            ? 'bg-primary/10 text-primary font-semibold'
                                            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Header Action: Mobile Menu Trigger */}
                    <div className="flex items-center gap-3">
                        {/* Mobile Sheet Menu */}
                        <div className="md:hidden">
                            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 border-border/60"
                                        aria-label="Toggle navigation menu"
                                    >
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="flex flex-col p-0 w-[300px] sm:w-[360px]">
                                    <SheetHeader className="border-b border-border/50 p-5 text-left">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                                <Globe className="h-4 w-4" />
                                            </div>
                                            <SheetTitle className="text-base font-bold text-foreground">
                                                {companyName}
                                            </SheetTitle>
                                        </div>
                                    </SheetHeader>

                                    {/* Mobile Nav Links */}
                                    <div className="flex-1 overflow-y-auto px-4 py-6">
                                        <nav className="flex flex-col space-y-1">
                                            {NAV_LINKS.map((link) => {
                                                const active = isLinkActive(link.href);
                                                return (
                                                    <Link
                                                        key={link.href}
                                                        href={link.href}
                                                        onClick={() => setMobileOpen(false)}
                                                        className={`flex items-center justify-between rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                                                            active
                                                                ? 'bg-primary/10 text-primary font-semibold'
                                                                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                                                        }`}
                                                    >
                                                        <span>{link.label}</span>
                                                        {active && (
                                                            <span className="h-2 w-2 rounded-full bg-primary" />
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </nav>
                                    </div>

                                    {/* Mobile Drawer Footer */}
                                    <div className="border-t border-border/50 bg-muted/20 p-5 space-y-3.5">
                                        <div className="space-y-1.5 pt-2 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3.5 w-3.5 text-primary" />
                                                <a href={`tel:${companyPhone}`} className="hover:underline">
                                                    {companyPhone}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3.5 w-3.5 text-primary" />
                                                <a href={`mailto:${companyEmail}`} className="hover:underline truncate">
                                                    {companyEmail}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer reading from config/company.php */}
            <footer className="border-t border-border bg-card/40 text-card-foreground">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {/* Column 1: Company Profile */}
                        <div className="space-y-4">
                            <Link href="/" className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Globe className="h-4 w-4" />
                                </div>
                                <span className="font-heading text-lg font-bold tracking-tight">
                                    {companyName}
                                </span>
                            </Link>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Curating bespoke journeys, luxury escapes, and cultural discoveries across Sri Lanka,
                                India, and Southeast Asia.
                            </p>
                            {companyWhatsapp && (
                                <a
                                    href={companyWhatsapp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
                                >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                    <span>Chat on WhatsApp</span>
                                </a>
                            )}
                        </div>

                        {/* Column 2: Navigation Links */}
                        <div className="space-y-4">
                            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
                                Explore
                            </h3>
                            <ul className="space-y-2.5 text-sm text-muted-foreground">
                                <li>
                                    <Link href="/our-destinations" className="transition-colors hover:text-foreground">
                                        Destinations
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/our-tours" className="transition-colors hover:text-foreground">
                                        Tour Packages
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/about#memories" className="transition-colors hover:text-foreground">
                                        Traveller Memories
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/travel-guides" className="transition-colors hover:text-foreground">
                                        Travel Guides
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: Legal & Support */}
                        <div className="space-y-4">
                            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
                                Information
                            </h3>
                            <ul className="space-y-2.5 text-sm text-muted-foreground">
                                <li>
                                    <Link href="/contact" className="transition-colors hover:text-foreground">
                                        Contact Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/privacy-policy" className="transition-colors hover:text-foreground">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms" className="transition-colors hover:text-foreground">
                                        Terms & Conditions
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/login" className="transition-colors hover:text-foreground">
                                        Staff & Portal Login
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 4: Contact Information from config */}
                        <div className="space-y-4">
                            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
                                Get in Touch
                            </h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                {companyAddress && (
                                    <li className="flex items-start gap-2.5">
                                        <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                        <span>{companyAddress}</span>
                                    </li>
                                )}
                                {companyPhone && (
                                    <li className="flex items-center gap-2.5">
                                        <Phone className="h-4 w-4 text-primary shrink-0" />
                                        <a href={`tel:${companyPhone}`} className="hover:underline hover:text-foreground">
                                            {companyPhone}
                                        </a>
                                    </li>
                                )}
                                {companyEmail && (
                                    <li className="flex items-center gap-2.5">
                                        <Mail className="h-4 w-4 text-primary shrink-0" />
                                        <a href={`mailto:${companyEmail}`} className="hover:underline hover:text-foreground truncate">
                                            {companyEmail}
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Copyright Bar */}
                    <div className="mt-12 border-t border-border/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                        <p>
                            &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link href="/privacy-policy" className="hover:underline hover:text-foreground">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:underline hover:text-foreground">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
