import { ReactNode } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { site as company } from '@/content/site';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';

interface PublicLayoutProps {
    children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    const { url } = usePage();
    const shouldReduceMotion = useReducedMotion();

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
        <div className="min-h-screen flex flex-col font-sans text-foreground bg-background">
            <Head>
                <script type="application/ld+json">
                    {JSON.stringify(organizationJsonLd)}
                </script>
            </Head>
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-primary focus:font-bold focus:rounded-md focus:shadow-md"
            >
                Skip to content
            </a>

            <Navbar />

            <AnimatePresence mode="wait">
                <motion.main
                    id="main-content"
                    key={url}
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex-grow flex flex-col"
                >
                    {children}
                </motion.main>
            </AnimatePresence>

            <Footer />
        </div>
    );
}
