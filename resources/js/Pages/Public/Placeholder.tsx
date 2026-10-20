import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Compass, Mail } from 'lucide-react';

interface PlaceholderProps {
    title?: string;
    description?: string;
    slug?: string;
}

export default function Placeholder({
    title = 'Under Construction',
    description,
    slug,
}: PlaceholderProps) {
    return (
        <PublicLayout>
            <Head title={title} />

            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                <div className="mx-auto max-w-xl text-center space-y-6">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                        <Compass className="h-8 w-8" />
                    </div>

                    <div className="space-y-3">
                        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            {title}
                        </h1>
                        {slug && (
                            <p className="inline-block rounded-md bg-muted px-2.5 py-1 text-xs font-mono text-muted-foreground">
                                Parameter: {slug}
                            </p>
                        )}
                        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                            {description ||
                                'This page is currently being prepared. Check back soon for exciting updates and curated travel experiences.'}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                        <Button asChild variant="outline">
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/contact">
                                <Mail className="mr-2 h-4 w-4" />
                                Enquire Now
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
