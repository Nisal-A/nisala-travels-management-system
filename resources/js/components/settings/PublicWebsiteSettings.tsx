import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { router } from '@inertiajs/react';
import { Globe, KeyRound, ExternalLink, RefreshCw, CheckCircle2, XCircle, ShieldCheck, DatabaseZap } from 'lucide-react';

interface PublicWebsiteData {
    isApiKeyConfigured: boolean;
    is_configured?: boolean;
    publicSiteUrl: string;
    public_site_url?: string;
}

interface PublicWebsiteSettingsProps {
    data: PublicWebsiteData;
}

export function PublicWebsiteSettings({ data }: PublicWebsiteSettingsProps) {
    const [isClearing, setIsClearing] = useState(false);

    const isKeyConfigured = data.isApiKeyConfigured ?? data.is_configured ?? false;
    const siteUrl = data.publicSiteUrl || data.public_site_url || 'http://localhost:3000';

    const handleClearCache = () => {
        setIsClearing(true);
        router.post(
            route('settings.clear-cache'),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsClearing(false);
                    toast.add({
                        title: 'Cache cleared',
                        description: 'Public website catalog cache has been successfully cleared.',
                        type: 'success',
                    });
                },
                onError: () => {
                    setIsClearing(false);
                    toast.add({
                        title: 'Error clearing cache',
                        description: 'Failed to clear website cache. Please try again.',
                        type: 'error',
                    });
                },
            }
        );
    };

    return (
        <Card className="border shadow-sm">
            <CardHeader className="pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                        <Globe className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Public Website Integration</CardTitle>
                        <CardDescription>
                            Configuration, connectivity status, and caching controls for the public customer-facing website.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* Public API Key Status */}
                <div className="rounded-xl border p-4 sm:p-5 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <KeyRound className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold text-sm">Public API Key</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Required by the Next.js public site to query destination and tour endpoints securely.
                        </p>
                        <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1 pt-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                            For security, API key credentials are never exposed to client browsers.
                        </p>
                    </div>
                    <div>
                        {isKeyConfigured ? (
                            <Badge
                                variant="outline"
                                className="gap-1.5 py-1.5 px-3 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700 dark:text-emerald-300 font-semibold"
                            >
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                Configured (Yes)
                            </Badge>
                        ) : (
                            <Badge
                                variant="outline"
                                className="gap-1.5 py-1.5 px-3 bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-700 dark:text-amber-300 font-semibold"
                            >
                                <XCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                Not Configured (No)
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Public Site URL */}
                <div className="rounded-xl border p-4 sm:p-5 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold text-sm">Public Website URL</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Target web address loaded from environment (<span className="font-mono">PUBLIC_SITE_URL</span> / <span className="font-mono">NEXTJS_REVALIDATE_URL</span>).
                        </p>
                        <div className="pt-1.5 font-mono text-sm text-foreground/90 font-medium select-all">
                            {siteUrl}
                        </div>
                    </div>
                    <div>
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="gap-2 shrink-0"
                        >
                            <a href={siteUrl} target="_blank" rel="noopener noreferrer">
                                Open Website
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Cache Management */}
                <div className="rounded-xl border p-4 sm:p-5 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <DatabaseZap className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold text-sm">Public Website Cache</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Destinations and tours are cached to maximize public catalog performance. Clear this cache after bulk updates.
                        </p>
                    </div>
                    <div>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClearCache}
                            disabled={isClearing}
                            className="gap-2 shadow-sm shrink-0 border"
                        >
                            <RefreshCw className={`h-4 w-4 ${isClearing ? 'animate-spin' : ''}`} />
                            {isClearing ? 'Clearing Cache...' : 'Clear public website cache'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
