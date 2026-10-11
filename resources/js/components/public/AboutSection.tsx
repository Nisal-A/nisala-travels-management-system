import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/common/Reveal';
import { Button } from '@/components/ui/button';
import { site } from '@/content/site';

export function AboutSection() {
    return (
        <section id="about-us" className="py-24 md:py-32 bg-neutral-50 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    <Reveal direction="right">
                        <div className="relative">
                            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative z-10">
                                <img
                                    src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop"
                                    alt="Traveling the world"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-brand-navy/10" />
                            </div>
                            {/* Decorative element */}
                            <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-brand-gold rounded-full opacity-20 blur-3xl -z-10" />
                        </div>
                    </Reveal>

                    <Reveal direction="left" delay={0.2}>
                        <div className="max-w-xl">
                            <span className="inline-block bg-brand-gold text-brand-navy text-xs font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3">About Us</span>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-brand-navy mb-6 leading-tight">
                                {site.name}
                            </h2>
                            <p className="text-lg text-neutral-600 leading-relaxed mb-8">
                                {site.pitch}
                            </p>
                            
                            <Button
                                render={<Link href="/#about-us" />}
                                size="public-lg"
                                variant="public-outline"
                            >
                                Discover Our Story <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
