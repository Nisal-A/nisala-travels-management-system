import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { finalCtaContent } from '@/content/home';
import type { PageProps, CompanyConfig } from '@/types';

export function FinalCta() {
    const props = usePage<PageProps>().props;
    const company = (props.company || {}) as CompanyConfig;
    const whatsappUrl = company.whatsapp_url || 'https://wa.me/94761277010';

    return (
        <section className="py-16 sm:py-24 bg-background border-t border-border/40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-primary/5 p-8 sm:p-14 lg:p-16 text-center shadow-lg shadow-black/5">
                    {/* Subtle decorative elements */}
                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

                    <div className="relative z-10 mx-auto max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>{finalCtaContent.badge}</span>
                        </div>

                        <h2 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                            {finalCtaContent.title}
                        </h2>

                        <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                            {finalCtaContent.description}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            {/* WhatsApp Direct Link using shared config */}
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 py-4 text-base shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all"
                            >
                                <MessageCircle className="h-5 w-5" />
                                <span>{finalCtaContent.whatsappLabel}</span>
                            </a>

                            {/* Inquiry Form Link */}
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto rounded-xl px-7 py-6 text-base font-semibold border-border/80 hover:border-primary/50 shadow-xs"
                            >
                                <Link href={finalCtaContent.inquiryHref}>
                                    <Mail className="mr-2 h-4 w-4 text-primary" />
                                    <span>{finalCtaContent.inquiryLabel}</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground pt-4">
                            {finalCtaContent.footnote}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default FinalCta;
