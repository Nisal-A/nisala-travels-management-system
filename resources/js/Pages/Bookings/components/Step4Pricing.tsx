import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoneyText } from '@/components/common/money-text';
import { TourPackage } from '@/types';
import { TravelerRow } from './Step3Travelers';
import { Calculator, Plus, Trash2, Lock, CheckCircle, Sparkles, Shield, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExtraItem {
    name: string;
    price: number;
}

interface Step4PricingProps {
    packageItem?: TourPackage;
    travelers: TravelerRow[];
    extras: ExtraItem[];
    onChangeExtras: (extras: ExtraItem[]) => void;
    taxAmount: number;
    onChangeTaxAmount: (tax: number) => void;
    discountAmount: number;
    onChangeDiscountAmount: (discount: number) => void;
    canDiscount: boolean;
    errors?: Record<string, string>;
}

const PRESET_EXTRAS: ExtraItem[] = [
    { name: 'Comprehensive Travel Insurance', price: 15000 },
    { name: 'VIP Airport Pickup & Transfers', price: 10000 },
    { name: 'Single Room Supplement', price: 35000 },
    { name: 'Express Visa Processing', price: 18000 },
];

export default function Step4Pricing({
    packageItem,
    travelers,
    extras,
    onChangeExtras,
    taxAmount,
    onChangeTaxAmount,
    discountAmount,
    onChangeDiscountAmount,
    canDiscount,
    errors = {},
}: Step4PricingProps) {
    const currency = (packageItem?.currency as 'LKR' | 'USD') || 'LKR';
    const packagePrice = Number(packageItem?.price || 0);

    // Calculate per-traveler base amount
    const baseSubtotal = packagePrice * travelers.length;

    // Extras subtotal
    const extrasSubtotal = extras.reduce((sum, item) => sum + Number(item.price || 0), 0);

    // Final total
    const grossTotal = baseSubtotal + extrasSubtotal + Number(taxAmount || 0);
    const finalTotal = Math.max(0, grossTotal - Number(discountAmount || 0));

    const addExtra = (item: ExtraItem) => {
        onChangeExtras([...extras, item]);
    };

    const removeExtra = (index: number) => {
        const updated = extras.filter((_, i) => i !== index);
        onChangeExtras(updated);
    };

    const updateExtra = (index: number, field: keyof ExtraItem, value: any) => {
        const updated = [...extras];
        updated[index] = { ...updated[index], [field]: value };
        onChangeExtras(updated);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 cols: Cost Breakdown and Extras */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Per-Traveler Base Rate Breakdown */}
                    <Card className="border-border shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-primary" /> Per-Traveler Rate Breakdown
                            </CardTitle>
                            <CardDescription>
                                Base tour cost calculated for {travelers.length} registered traveler(s).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="rounded-lg border divide-y text-xs">
                                {travelers.map((t, i) => (
                                    <div key={i} className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground">
                                                {t.full_name || `Traveler #${i + 1}`}
                                            </span>
                                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded capitalize text-muted-foreground">
                                                {t.traveler_type}
                                            </span>
                                        </div>
                                        <div className="font-medium text-foreground">
                                            <MoneyText amount={packagePrice} currency={currency} size="sm" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-2 px-1 text-sm font-semibold">
                                <span>Base Package Subtotal:</span>
                                <MoneyText amount={baseSubtotal} currency={currency} weight="bold" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Extras & Add-ons */}
                    <Card className="border-border shadow-xs">
                        <CardHeader className="pb-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-primary" /> Optional Tour Extras & Add-ons
                                    </CardTitle>
                                    <CardDescription>
                                        Add optional travel insurance, room upgrades, or special services.
                                    </CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addExtra({ name: '', price: 0 })}
                                    className="gap-1.5 self-start sm:self-auto text-xs h-8"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Custom Extra
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Preset Quick Add Buttons */}
                            <div className="flex flex-wrap gap-2">
                                {PRESET_EXTRAS.map((preset, idx) => (
                                    <Button
                                        key={idx}
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => addExtra(preset)}
                                        className="text-xs gap-1.5 h-8 bg-muted hover:bg-muted/80 text-foreground"
                                    >
                                        <Plus className="w-3 h-3 text-primary" />
                                        {preset.name} (+{Number(preset.price).toLocaleString()} {currency})
                                    </Button>
                                ))}
                            </div>

                            {/* Added Extras List */}
                            {extras.length > 0 ? (
                                <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
                                    {extras.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={item.name}
                                                onChange={(e) => updateExtra(index, 'name', e.target.value)}
                                                placeholder="Extra Item Description"
                                                className="h-9 text-xs flex-1"
                                            />
                                            <div className="w-32">
                                                <Input
                                                    type="number"
                                                    value={item.price || ''}
                                                    onChange={(e) =>
                                                        updateExtra(index, 'price', parseFloat(e.target.value) || 0)
                                                    }
                                                    placeholder="Price"
                                                    className="h-9 text-xs"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeExtra(index)}
                                                className="h-9 w-9 text-destructive hover:bg-destructive/10 shrink-0"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground italic">
                                    No extras added yet. Use the presets above or add a custom extra item.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Taxes & Discounts */}
                    <Card className="border-border shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-primary" /> Adjustments, Taxes & Discounts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Taxes */}
                            <div className="space-y-1.5">
                                <Label htmlFor="tax_amount" className="text-xs font-medium">
                                    Taxes & Service Charges ({currency})
                                </Label>
                                <Input
                                    id="tax_amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={taxAmount || ''}
                                    onChange={(e) => onChangeTaxAmount(parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className="h-10"
                                />
                            </div>

                            {/* Discount (Requires Permission) */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="discount_amount" className="text-xs font-medium">
                                        Special Discount ({currency})
                                    </Label>
                                    {canDiscount ? (
                                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Authorized
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                                            <Lock className="w-3 h-3" /> Manager Required
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="discount_amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={discountAmount || ''}
                                        onChange={(e) => onChangeDiscountAmount(parseFloat(e.target.value) || 0)}
                                        disabled={!canDiscount}
                                        placeholder={canDiscount ? '0.00' : 'Manager approval required'}
                                        className={cn('h-10', !canDiscount && 'bg-muted cursor-not-allowed opacity-75')}
                                    />
                                    {!canDiscount && (
                                        <Lock className="w-4 h-4 absolute right-3 top-3 text-muted-foreground" />
                                    )}
                                </div>
                                {errors.discount_amount && (
                                    <p className="text-xs text-destructive font-medium">{errors.discount_amount}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right col: Live Pricing Total Card */}
                <div className="space-y-6">
                    <Card className="border-border shadow-xs sticky top-20 bg-card">
                        <CardHeader className="bg-primary/5 border-b pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" /> Live Price Summary
                            </CardTitle>
                            <CardDescription>Real-time calculated quote for this reservation.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-2.5 text-sm">
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>
                                        Base ({travelers.length} traveler{travelers.length > 1 ? 's' : ''}):
                                    </span>
                                    <MoneyText amount={baseSubtotal} currency={currency} size="sm" />
                                </div>

                                {extrasSubtotal > 0 && (
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span>Add-ons ({extras.length}):</span>
                                        <MoneyText amount={extrasSubtotal} currency={currency} size="sm" />
                                    </div>
                                )}

                                {taxAmount > 0 && (
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span>Taxes & Fees:</span>
                                        <MoneyText amount={taxAmount} currency={currency} size="sm" />
                                    </div>
                                )}

                                {discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-emerald-600 font-medium">
                                        <span>Discount:</span>
                                        <span>
                                            -
                                            <MoneyText
                                                amount={discountAmount}
                                                currency={currency}
                                                size="sm"
                                                className="text-emerald-600"
                                            />
                                        </span>
                                    </div>
                                )}

                                <div className="border-t pt-3 flex justify-between items-baseline">
                                    <span className="font-bold text-base text-foreground">Final Total:</span>
                                    <MoneyText
                                        amount={finalTotal}
                                        currency={currency}
                                        size="xl"
                                        weight="bold"
                                        className="text-primary font-mono"
                                    />
                                </div>
                            </div>

                            <div className="p-3 bg-muted/40 rounded-lg border text-[11px] text-muted-foreground space-y-1">
                                <p className="font-medium text-foreground">Server Price Guarantee</p>
                                <p>Totals are recalculated and verified strictly server-side upon booking creation.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
