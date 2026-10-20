import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Compass, ShieldCheck, Globe, MessageCircle } from 'lucide-react';
import { heroContent } from '@/content/home';
import type { PageProps, CompanyConfig } from '@/types';

export function HeroSection() {
    const props = usePage<PageProps>().props;
    const company = (props.company || {}) as CompanyConfig;
    const companyName = company.name || 'Nisala Travels';
    const whatsappUrl = company.whatsapp_url || 'https://wa.me/94761277010';

    return (
        <section className="relative overflow-hidden py-10 sm:py-16 lg:py-20 bg-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Brand-coloured panel with logo - honest presentation without stock imagery */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#052351] via-[#026E9F] to-[#0184BA] p-8 sm:p-14 lg:p-20 text-white shadow-xl shadow-primary/10">
                    {/* Subtle decorative geometric backdrop rings */}
                    <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#FEC822]/10 blur-3xl" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />

                    <div className="relative z-10 mx-auto max-w-4xl text-center space-y-6 sm:space-y-8">
                        {/* Brand Logo & Eyebrow */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                                <Sparkles className="h-3.5 w-3.5 text-[#FEC822]" />
                                <span>{heroContent.badge}</span>
                            </div>

                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3.5 py-1 text-xs font-medium text-emerald-100">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span>Direct Booking Support</span>
                            </div>
                        </div>

                        {/* Brand Identification Crest */}
                        <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-2.5 border border-white/15 backdrop-blur-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#052351] shadow-sm">
                                <Globe className="h-6 w-6 text-[#026E9F]" />
                            </div>
                            <div className="text-left">
                                <div className="text-xs uppercase tracking-widest text-white/70 font-semibold">
                                    Official Agency
                                </div>
                                <div className="text-sm font-bold tracking-tight text-white">
                                    {companyName}
                                </div>
                            </div>
                        </div>

                        {/* The ONLY H1 on the homepage */}
                        <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                            {heroContent.title}
                        </h1>

                        {/* Descriptive Lead */}
                        <p className="mx-auto max-w-2xl text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed font-normal">
                            {heroContent.description}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                            <Button
                                asChild
                                size="lg"
                                className="w-full sm:w-auto bg-[#FEC822] hover:bg-[#FE950B] text-[#052351] font-bold shadow-lg shadow-black/20 hover:shadow-xl transition-all rounded-xl px-7 py-6 text-base"
                            >
                                <Link href={heroContent.primaryCta.href}>
                                    <span>{heroContent.primaryCta.label}</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>

                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto border-white/30 bg-white/10 hover:bg-white/20 text-white font-semibold backdrop-blur-sm rounded-xl px-7 py-6 text-base"
                            >
                                <Link href={heroContent.secondaryCta.href}>
                                    <Compass className="mr-2 h-4 w-4 text-[#FEC822]" />
                                    <span>{heroContent.secondaryCta.label}</span>
                                </Link>
                            </Button>

                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-600/30 hover:bg-emerald-600/50 text-white font-medium px-5 py-3 text-sm transition-colors"
                            >
                                <MessageCircle className="h-4 w-4 text-emerald-300" />
                                <span>WhatsApp Us</span>
                            </a>
                        </div>

                        {/* Notice & Honest Transparency Note */}
                        <div className="pt-4 border-t border-white/10 text-xs text-white/70 max-w-xl mx-auto">
                            {heroContent.panelNotice}
                        </div>

                        {/* Reassurance pills (NO reviews or ratings) */}
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-2 text-xs font-medium text-white/80">
                            {heroContent.trustPills.map((pill) => (
                                <div
                                    key={pill}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 border border-white/10"
                                >
                                    <ShieldCheck className="h-3.5 w-3.5 text-[#FEC822]" />
                                    <span>{pill}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeroSection;
