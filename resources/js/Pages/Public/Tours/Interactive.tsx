import { Head } from '@inertiajs/react';
import PublicLayout from '@/components/layouts/PublicLayout';

export default function InteractiveToursShowcase() {
    return (
        <PublicLayout>
            <Head title="Interactive Tours Showcase | Nisala Travels" />
            <div className="min-h-screen bg-neutral-900 pt-32 pb-16 px-4 flex flex-col items-center justify-center text-center">
                <div className="container mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Interactive Tours Showcase</h1>
                    <p className="text-lg text-neutral-300 max-w-2xl mx-auto mb-8">
                        This highly interactive page is currently under construction. Check back soon for a deeply engaging, visual showcase of all our tour packages!
                    </p>
                    <div className="animate-pulse bg-white/5 rounded-2xl h-96 w-full max-w-5xl mx-auto border border-white/10 flex items-center justify-center text-white/40">
                        [ Interactive 3D / Video Experience Placeholder ]
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
