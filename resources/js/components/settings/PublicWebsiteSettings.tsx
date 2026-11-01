import { useState } from 'react';
import { SettingsPanel } from './SettingsPanel';
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

    const rowClass = 'flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 first:pt-0 last:pb-0';
    const secondaryBtn =
        'h-9 px-3 rounded-md border border-border bg-card text-foreground text-sm font-medium shadow-sm gap-1 hover:bg-muted transition-colors inline-flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 cursor-pointer';

    return (
        <SettingsPanel
            title="Public Website Integration"
            description="Connectivity status and caching controls for the public customer-facing website."
            icon={Globe}
        >
            <div className="divide-y">
                {/* Public API Key Status */}
                <div className={rowClass}>
                    <div className="space-y-1 min-w-0">
                        <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            <KeyRound className="size-4 text-primary" />
                            Public API Key
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Required by the Next.js public site to query destination and tour endpoints securely.
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <ShieldCheck className="size-3.5 text-success" />
                            For security, API key credentials are never exposed to client browsers.
                        </p>
                    </div>
                    {isKeyConfigured ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-success/10 text-success border-success/20 shrink-0 self-start sm:self-auto">
                            <CheckCircle2 className="size-3.5" />
                            Configured
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-warning/10 text-warning border-warning/20 shrink-0 self-start sm:self-auto">
                            <XCircle className="size-3.5" />
                            Not configured
                        </span>
                    )}
                </div>

                {/* Public Site URL */}
                <div className={rowClass}>
                    <div className="space-y-1 min-w-0">
                        <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Globe className="size-4 text-primary" />
                            Public Website URL
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Loaded from environment (<span className="font-mono">PUBLIC_SITE_URL</span> /{' '}
                            <span className="font-mono">NEXTJS_REVALIDATE_URL</span>).
                        </p>
                        <p className="pt-1 font-mono text-sm text-foreground break-all select-all">{siteUrl}</p>
                    </div>
                    <a href={siteUrl} target="_blank" rel="noopener noreferrer" className={secondaryBtn}>
                        Open website
                        <ExternalLink className="size-4" />
                    </a>
                </div>

                {/* Cache Management */}
                <div className={rowClass}>
                    <div className="space-y-1 min-w-0">
                        <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            <DatabaseZap className="size-4 text-primary" />
                            Public Website Cache
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Destinations and tours are cached for public catalog performance. Clear this cache after bulk updates.
                        </p>
                    </div>
                    <button type="button" onClick={handleClearCache} disabled={isClearing} className={secondaryBtn}>
                        <RefreshCw className={`size-4 ${isClearing ? 'animate-spin' : ''}`} />
                        {isClearing ? 'Clearing cacheâ€¦' : 'Clear public website cache'}
                    </button>
                </div>
            </div>
        </SettingsPanel>
    );
}
