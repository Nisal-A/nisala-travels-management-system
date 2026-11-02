import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { useForm } from '@inertiajs/react';
import { ArrowRightLeft, CheckCircle2, Info } from 'lucide-react';
import type { PageProps } from '@/types';
import { SettingsPanel, settingsInputClass } from './SettingsPanel';

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
    const { data, setData, post, processing, errors, isDirty, reset, clearErrors, recentlySuccessful } = useForm<{
        rates: Record<string, string>;
    }>({
        rates: (() => {
            const initial: Record<string, string> = {};
            exchangeRates.forEach((r) => {
                initial[r.currency] = r.rate_to_lkr ?? '';
            });
            return initial;
        })(),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Same payload as before: { rates: { USD: '...', ... } }
        post(route('settings.exchange-rates.store'), {
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = (page.props as PageProps).flash;
                toast.add({
                    title: 'Exchange rates saved',
                    description: flash?.success ?? 'New rate entries were recorded.',
                    type: 'success',
                });
            },
        });
    };

    const handleCancel = () => {
        reset();
        clearErrors();
    };

    const setRate = (currency: string, value: string) => {
        setData('rates', { ...data.rates, [currency]: value });
    };

    const rateError = (currency: string): string | undefined =>
        (errors as Record<string, string | undefined>)[`rates.${currency}`];

    const formatDate = (iso: string | null) => {
        if (!iso) return 'Never';
        const d = new Date(iso);
        return d.toLocaleString('en-LK', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Colombo',
        });
    };

    const currentRate = (rate: ExchangeRateData) =>
        rate.rate_to_lkr
            ? `Rs ${Number(rate.rate_to_lkr).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
            : 'No rate set';

    const rateInput = (rate: ExchangeRateData, idPrefix: string) => {
        const error = rateError(rate.currency);
        return (
            <>
                <Input
                    id={`${idPrefix}-${rate.currency}`}
                    type="number"
                    step="0.000001"
                    min="0.000001"
                    placeholder="e.g. 320.50"
                    value={data.rates[rate.currency] ?? ''}
                    onChange={(e) => setRate(rate.currency, e.target.value)}
                    aria-invalid={!!error}
                    className={`${settingsInputClass} w-full md:w-40 tabular-nums`}
                />
                {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
            </>
        );
    };

    return (
        <SettingsPanel
            title="Exchange Rates"
            description="All rates represent 1 unit of the foreign currency in LKR."
            icon={ArrowRightLeft}
            onSubmit={handleSubmit}
            footer={{
                isDirty,
                processing,
                onCancel: handleCancel,
                status: recentlySuccessful ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                        <CheckCircle2 className="size-3.5 text-success" />
                        Rates saved
                    </span>
                ) : (
                    'Changes are saved as new rate entries and do not overwrite history.'
                ),
            }}
        >
            {exchangeRates.length === 0 ? (
                <p className="rounded-xl border bg-muted/50 py-8 text-center text-sm text-muted-foreground">
                    No foreign currencies configured.
                </p>
            ) : (
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b bg-muted/50">
                        <h3 className="font-bold text-sm text-foreground">Current rates</h3>
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground border-b">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Currency</th>
                                    <th className="px-6 py-3 font-semibold text-right">Current rate</th>
                                    <th className="px-6 py-3 font-semibold">Last updated</th>
                                    <th className="px-6 py-3 font-semibold">Rate to LKR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {exchangeRates.map((rate) => (
                                    <tr key={rate.currency} className="hover:bg-muted/50 transition-colors align-top">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">{rate.currency}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {rate.label} ({rate.symbol})
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold tabular-nums text-foreground whitespace-nowrap">
                                            {currentRate(rate)}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-muted-foreground">
                                            {formatDate(rate.fetched_at)}
                                            {rate.source ? <div>{rate.source}</div> : null}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Label htmlFor={`rate-${rate.currency}`} className="sr-only">
                                                {rate.currency} rate to LKR
                                            </Label>
                                            {rateInput(rate, 'rate')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile stacked cards */}
                    <div className="md:hidden divide-y">
                        {exchangeRates.map((rate) => (
                            <div key={rate.currency} className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-medium text-foreground">{rate.currency}</div>
                                        <div className="text-xs text-muted-foreground truncate">
                                            {rate.label} ({rate.symbol})
                                        </div>
                                    </div>
                                    <div className="text-right text-sm font-semibold tabular-nums text-foreground">
                                        {currentRate(rate)}
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Updated: {formatDate(rate.fetched_at)}
                                    {rate.source ? ` (${rate.source})` : ''}
                                </p>
                                <div>
                                    <Label htmlFor={`rate-m-${rate.currency}`} className="text-sm font-medium mb-1 block">
                                        Rate to LKR
                                    </Label>
                                    {rateInput(rate, 'rate-m')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="size-4 shrink-0 mt-0.5" />
                <p>
                    LKR is the base currency (always 1.000000). Rates are refreshed automatically at 06:00 and 14:00
                    Asia/Colombo. Enter values above to manually override rates.
                </p>
            </div>
        </SettingsPanel>
    );
}
