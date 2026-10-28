import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { ArrowRightLeft, Clock, Save, Loader2 } from 'lucide-react';

export interface ExchangeRateData {
    currency: string;
    label: string;
    symbol: string;
    rate_to_lkr: string | null;
    fetched_at: string | null;
    source: string | null;
}

interface ExchangeRatesCardProps {
    exchangeRates: ExchangeRateData[];
}

export function ExchangeRatesCard({ exchangeRates }: ExchangeRatesCardProps) {
    const [rates, setRates] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        exchangeRates.forEach((r) => {
            initial[r.currency] = r.rate_to_lkr ?? '';
        });
        return initial;
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        router.post(
            route('settings.exchange-rates.store'),
            { rates },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
            },
        );
    };

    const formatDate = (iso: string | null) => {
        if (!iso) return 'Never';
        const d = new Date(iso);
        return d.toLocaleString('en-LK', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Colombo',
        });
    };

    return (
        <Card className="border shadow-sm">
            <CardHeader className="pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <ArrowRightLeft className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Exchange Rates</CardTitle>
                        <CardDescription>
                            Manage currency exchange rates to LKR. All rates represent 1 unit of the foreign currency in LKR.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-5 pt-6">
                    {/* Current Rates Display */}
                    <div className="rounded-xl border bg-card p-5 space-y-4">
                        <h3 className="font-semibold text-base flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            Current Rates
                        </h3>

                        <div className="grid gap-4">
                            {exchangeRates.map((rate) => (
                                <div
                                    key={rate.currency}
                                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border bg-muted/20"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <Badge variant="outline" className="py-1 px-3 font-mono text-sm shrink-0">
                                            {rate.currency}
                                        </Badge>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {rate.label} ({rate.symbol})
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {rate.rate_to_lkr
                                                    ? `1 ${rate.currency} = Rs ${Number(rate.rate_to_lkr).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
                                                    : 'No rate set'}
                                            </p>
                                            {rate.fetched_at && (
                                                <p className="text-xs text-muted-foreground/70 mt-0.5">
                                                    Updated: {formatDate(rate.fetched_at)}
                                                    {rate.source ? ` (${rate.source})` : ''}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="sm:w-48 shrink-0">
                                        <Label htmlFor={`rate-${rate.currency}`} className="text-xs text-muted-foreground mb-1 block">
                                            Rate to LKR
                                        </Label>
                                        <Input
                                            id={`rate-${rate.currency}`}
                                            type="number"
                                            step="0.000001"
                                            min="0.000001"
                                            placeholder="e.g. 320.50"
                                            value={rates[rate.currency] ?? ''}
                                            onChange={(e) =>
                                                setRates((prev) => ({
                                                    ...prev,
                                                    [rate.currency]: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                            ))}

                            {exchangeRates.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No foreign currencies configured.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Info note */}
                    <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                        <strong>Note:</strong> LKR is the base currency (always 1.000000). Rates are refreshed automatically at 06:00 and 14:00 Asia/Colombo.
                        Enter values above to manually override rates.
                    </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t bg-muted/20 px-6 py-4">
                    <span className="text-xs text-muted-foreground">
                        Changes are saved as new rate entries and do not overwrite history.
                    </span>
                    <Button type="submit" className="gap-2 shadow-sm" disabled={saving}>
                        {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Save Rates
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
