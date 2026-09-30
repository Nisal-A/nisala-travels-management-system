import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LucideIcon } from 'lucide-react';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
    title: string;
    description: string;
    icon: LucideIcon;
    module: string;
}

/**
 * Reusable placeholder page for sections that don't have full UI yet.
 * Wraps in AppLayout and shows a consistent "coming soon" card.
 */
export default function PlaceholderPage({
    title,
    description,
    icon: Icon,
    module,
}: PlaceholderPageProps) {
    return (
        <AppLayout title={title}>
            <Head title={title} />

            <div className="flex flex-1 items-center justify-center min-h-[60vh]">
                <Card className="w-full max-w-lg border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="relative mb-6">
                            <div className="rounded-2xl bg-primary/5 p-5">
                                <Icon className="h-10 w-10 text-primary/60" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 rounded-full bg-card p-0.5">
                                <Construction className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                        <CardTitle className="mb-2 text-xl">{title}</CardTitle>
                        <CardDescription className="mb-4 max-w-sm">
                            {description}
                        </CardDescription>
                        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3 mb-6 text-sm flex flex-col items-center gap-1 max-w-sm">
                            <span className="font-semibold">Backend Implementation Missing</span>
                            <span className="text-center opacity-90">
                                This module cannot be fully implemented because the corresponding Laravel models, controllers, and API routes do not exist.
                            </span>
                        </div>
                        <Badge variant="outline" className="text-[0.65rem]">
                            Module: {module}
                        </Badge>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
