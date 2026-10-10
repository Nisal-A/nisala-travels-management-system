import { Star } from 'lucide-react';
import { Reveal } from '@/components/common/Reveal';
import { testimonials } from '@/content/testimonials';

export function TestimonialsSection() {
    // Only render in development mode since we don't have genuine testimonials yet
    if (!import.meta.env.DEV) {
        return null;
    }

    return (
        <section className="py-24 md:py-32 bg-primary text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <Reveal>
                        <p className="text-sm font-medium tracking-[0.15em] uppercase text-accent mb-2">
                            [DEV ONLY] Client Feedback
                        </p>
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
                            What Our Travelers Say
                        </h2>
                        <p className="text-white/70 max-w-2xl mx-auto">
                            The following are placeholder testimonials for development purposes only. They will not be visible in production until genuine testimonials are provided.
                        </p>
                    </Reveal>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                    {testimonials.slice(0, 4).map((testimonial, idx) => (
                        <Reveal key={testimonial.id} delay={idx * 0.1}>
                            <div className="bg-white/5 border border-white/10 backdrop-blur-sm p-8 rounded-2xl h-full flex flex-col">
                                <div className="flex gap-1 text-accent mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            className={`w-4 h-4 ${i < testimonial.rating ? 'fill-current' : 'text-white/20'}`} 
                                        />
                                    ))}
                                </div>
                                <p className="text-white/90 text-lg leading-relaxed italic mb-8 flex-grow">
                                    "{testimonial.text}"
                                </p>
                                <div>
                                    <h4 className="font-bold text-white font-serif">{testimonial.name}</h4>
                                    <p className="text-sm text-accent">{testimonial.trip}</p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
