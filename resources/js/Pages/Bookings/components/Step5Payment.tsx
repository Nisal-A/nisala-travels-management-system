import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MoneyText } from '@/components/common/money-text';
import { CreditCard, Calendar, DollarSign, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ScheduleItem {
    description: string;
    amount: number;
    due_date: string;
}

interface Step5PaymentProps {
    currency: 'LKR' | 'USD';
    finalTotal: number;
    travelDate: string;
    bookingDate: string;
    paymentPlan: 'full' | 'deposit_balance' | 'three_part' | 'four_part' | 'custom';
    onChangePaymentPlan: (plan: 'full' | 'deposit_balance' | 'three_part' | 'four_part' | 'custom') => void;
    depositAmount: number;
    onChangeDepositAmount: (deposit: number) => void;
    schedules: ScheduleItem[];
    onChangeSchedules: (schedules: ScheduleItem[]) => void;
    recordPayment: boolean;
    onChangeRecordPayment: (record: boolean) => void;
    paymentAmount: number;
    onChangePaymentAmount: (amount: number) => void;
    paymentMethod: string;
    onChangePaymentMethod: (method: string) => void;
    paymentReference: string;
    onChangePaymentReference: (ref: string) => void;
    errors?: Record<string, string>;
}

export default function Step5Payment({
    currency,
    finalTotal,
    travelDate,
    bookingDate,
    paymentPlan,
    onChangePaymentPlan,
    depositAmount,
    onChangeDepositAmount,
    schedules,
    onChangeSchedules,
    recordPayment,
    onChangeRecordPayment,
    paymentAmount,
    onChangePaymentAmount,
    paymentMethod,
    onChangePaymentMethod,
    paymentReference,
    onChangePaymentReference,
    errors = {},
}: Step5PaymentProps) {
    // Generate schedule based on plan
    const generateScheduleForPlan = (
        plan: 'full' | 'deposit_balance' | 'three_part' | 'four_part',
        depositPct: number = 0.2,
    ) => {
        const today = bookingDate || new Date().toISOString().split('T')[0];
        const departure = travelDate ? new Date(travelDate) : new Date(Date.now() + 60 * 86400000);

        if (plan === 'full') {
            onChangeSchedules([
                {
                    description: 'Full Payment',
                    amount: finalTotal,
                    due_date: today,
                },
            ]);
            onChangeDepositAmount(finalTotal);
            onChangePaymentAmount(finalTotal);
            return;
        }

        if (plan === 'deposit_balance') {
            const dep = Math.round(finalTotal * depositPct);
            const balance = Math.max(0, finalTotal - dep);

            const balanceDue = new Date(departure);
            balanceDue.setDate(balanceDue.getDate() - 30);
            const balanceDueStr = balanceDue.toISOString().split('T')[0];

            onChangeDepositAmount(dep);
            onChangePaymentAmount(dep);
            onChangeSchedules([
                {
                    description: `Initial Deposit (${Math.round(depositPct * 100)}%)`,
                    amount: dep,
                    due_date: today,
                },
                {
                    description: 'Final Balance',
                    amount: balance,
                    due_date: balanceDueStr,
                },
            ]);
            return;
        }

        if (plan === 'three_part') {
            const dep = Math.round(finalTotal * 0.3);
            const second = Math.round(finalTotal * 0.4);
            const finalPart = Math.max(0, finalTotal - dep - second);

            const midDate = new Date(departure);
            midDate.setDate(midDate.getDate() - 45);
            const finalDate = new Date(departure);
            finalDate.setDate(finalDate.getDate() - 14);

            onChangeDepositAmount(dep);
            onChangePaymentAmount(dep);
            onChangeSchedules([
                { description: 'Initial Deposit (30%)', amount: dep, due_date: today },
                {
                    description: 'Second Installment (40%)',
                    amount: second,
                    due_date: midDate.toISOString().split('T')[0],
                },
                {
                    description: 'Final Balance (30%)',
                    amount: finalPart,
                    due_date: finalDate.toISOString().split('T')[0],
                },
            ]);
            return;
        }

        if (plan === 'four_part') {
            const part = Math.round(finalTotal / 4);
            const lastPart = Math.max(0, finalTotal - part * 3);

            const d1 = new Date(today);
            const d2 = new Date(today);
            d2.setDate(d2.getDate() + 30);
            const d3 = new Date(today);
            d3.setDate(d3.getDate() + 60);
            const d4 = new Date(departure);
            d4.setDate(d4.getDate() - 14);

            onChangeDepositAmount(part);
            onChangePaymentAmount(part);
            onChangeSchedules([
                { description: 'Installment 1 (25%)', amount: part, due_date: d1.toISOString().split('T')[0] },
                { description: 'Installment 2 (25%)', amount: part, due_date: d2.toISOString().split('T')[0] },
                { description: 'Installment 3 (25%)', amount: part, due_date: d3.toISOString().split('T')[0] },
                { description: 'Installment 4 (Balance)', amount: lastPart, due_date: d4.toISOString().split('T')[0] },
            ]);
        }
    };

    // Auto-generate if empty on initial mount
    useEffect(() => {
        if (schedules.length === 0 && finalTotal > 0) {
            generateScheduleForPlan('deposit_balance', 0.2);
        }
    }, [finalTotal]);

    const handleSelectPlan = (plan: 'full' | 'deposit_balance' | 'three_part' | 'four_part' | 'custom') => {
        onChangePaymentPlan(plan);
        if (plan !== 'custom') {
            generateScheduleForPlan(plan, depositAmount ? depositAmount / finalTotal : 0.2);
        }
    };

    const handleDepositPreset = (pct: number) => {
        const dep = Math.round(finalTotal * pct);
        onChangeDepositAmount(dep);
        onChangePaymentAmount(dep);
        generateScheduleForPlan('deposit_balance', pct);
    };

    const updateScheduleItem = (index: number, field: keyof ScheduleItem, value: any) => {
        const updated = [...schedules];
        updated[index] = { ...updated[index], [field]: value };
        onChangeSchedules(updated);
    };

    const addScheduleItem = () => {
        onChangeSchedules([
            ...schedules,
            {
                description: `Installment ${schedules.length + 1}`,
                amount: 0,
                due_date: new Date().toISOString().split('T')[0],
            },
        ]);
    };

    const removeScheduleItem = (index: number) => {
        if (schedules.length <= 1) return;
        onChangeSchedules(schedules.filter((_, i) => i !== index));
    };

    const totalScheduled = schedules.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const scheduleDiff = Math.abs(finalTotal - totalScheduled);
    const isScheduleBalanced = scheduleDiff < 1;

    const remainingBalanceAfterPayment = recordPayment
        ? Math.max(0, finalTotal - Number(paymentAmount || 0))
        : finalTotal;

    return (
        <div className="space-y-6">
            <Card className="border-border shadow-xs">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" /> Payment Plan & Installments
                    </CardTitle>
                    <CardDescription>
                        Set up the installment schedule and optionally record the initial deposit payment today.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Payment Plan Presets */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Select Payment Structure</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <button
                                type="button"
                                onClick={() => handleSelectPlan('full')}
                                className={cn(
                                    'p-3.5 border rounded-xl text-left transition-all',
                                    paymentPlan === 'full'
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                                        : 'hover:border-border/80 bg-card',
                                )}
                            >
                                <span className="font-semibold text-sm block">Full Payment Upfront</span>
                                <span className="text-xs text-muted-foreground">100% due on booking</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSelectPlan('deposit_balance')}
                                className={cn(
                                    'p-3.5 border rounded-xl text-left transition-all',
                                    paymentPlan === 'deposit_balance'
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                                        : 'hover:border-border/80 bg-card',
                                )}
                            >
                                <span className="font-semibold text-sm block">Deposit + Balance (2 Parts)</span>
                                <span className="text-xs text-muted-foreground">
                                    Deposit now, balance prior to trip
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSelectPlan('three_part')}
                                className={cn(
                                    'p-3.5 border rounded-xl text-left transition-all',
                                    paymentPlan === 'three_part'
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                                        : 'hover:border-border/80 bg-card',
                                )}
                            >
                                <span className="font-semibold text-sm block">3 Installments</span>
                                <span className="text-xs text-muted-foreground">30% - 40% - 30% schedule</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSelectPlan('four_part')}
                                className={cn(
                                    'p-3.5 border rounded-xl text-left transition-all',
                                    paymentPlan === 'four_part'
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                                        : 'hover:border-border/80 bg-card',
                                )}
                            >
                                <span className="font-semibold text-sm block">4 Monthly Installments</span>
                                <span className="text-xs text-muted-foreground">25% equal monthly parts</span>
                            </button>
                        </div>
                    </div>

                    {/* Deposit Quick Buttons (for 2-part plan) */}
                    {paymentPlan === 'deposit_balance' && (
                        <div className="p-3 bg-muted/40 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
                            <span className="font-medium text-muted-foreground">Deposit Presets:</span>
                            <div className="flex gap-2">
                                {[0.1, 0.2, 0.3, 0.5].map((pct) => (
                                    <Button
                                        key={pct}
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => handleDepositPreset(pct)}
                                        className="h-7 text-xs"
                                    >
                                        {pct * 100}% ({Math.round(finalTotal * pct).toLocaleString()} {currency})
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Installment Schedule Generator Table */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Installment Schedule</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addScheduleItem}
                                className="h-7 text-xs gap-1 text-primary"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Row
                            </Button>
                        </div>

                        <div className="border rounded-xl overflow-hidden divide-y text-xs">
                            <div className="bg-muted/60 p-3 grid grid-cols-12 font-medium text-muted-foreground">
                                <span className="col-span-5">Milestone Description</span>
                                <span className="col-span-3">Due Date</span>
                                <span className="col-span-3 text-right">Amount ({currency})</span>
                                <span className="col-span-1"></span>
                            </div>

                            {schedules.map((item, index) => (
                                <div key={index} className="p-2.5 grid grid-cols-12 gap-2 items-center bg-card">
                                    <div className="col-span-5">
                                        <Input
                                            value={item.description}
                                            onChange={(e) => updateScheduleItem(index, 'description', e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <Input
                                            type="date"
                                            value={item.due_date}
                                            onChange={(e) => updateScheduleItem(index, 'due_date', e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div className="col-span-3 text-right">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={item.amount || ''}
                                            onChange={(e) =>
                                                updateScheduleItem(index, 'amount', parseFloat(e.target.value) || 0)
                                            }
                                            className="h-8 text-xs text-right"
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        {schedules.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeScheduleItem(index)}
                                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div className="p-3 bg-muted/30 flex items-center justify-between text-xs font-semibold">
                                <span>Total Scheduled:</span>
                                <div className="flex items-center gap-3">
                                    <MoneyText amount={totalScheduled} currency={currency} weight="bold" />
                                    {!isScheduleBalanced ? (
                                        <span className="text-amber-600 text-[11px] font-normal">
                                            (Diff: {Number(finalTotal - totalScheduled).toLocaleString()} {currency})
                                        </span>
                                    ) : (
                                        <span className="text-emerald-600 text-[11px] font-medium flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Balanced
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Record First Payment Now Section */}
                    <div className="p-5 border rounded-xl bg-card/60 shadow-xs space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="record_payment"
                                checked={recordPayment}
                                onCheckedChange={(checked) => onChangeRecordPayment(!!checked)}
                            />
                            <Label
                                htmlFor="record_payment"
                                className="text-sm font-semibold cursor-pointer select-none"
                            >
                                Record initial payment / deposit now
                            </Label>
                        </div>

                        {recordPayment && (
                            <div className="pt-3 border-t grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="payment_amount" className="text-xs font-medium">
                                        Payment Amount ({currency}) *
                                    </Label>
                                    <Input
                                        id="payment_amount"
                                        type="number"
                                        step="0.01"
                                        max={finalTotal}
                                        value={paymentAmount || ''}
                                        onChange={(e) => onChangePaymentAmount(parseFloat(e.target.value) || 0)}
                                        className="h-10"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="payment_method" className="text-xs font-medium">
                                        Payment Method *
                                    </Label>
                                    <Select
                                        value={paymentMethod}
                                        onValueChange={(val) => onChangePaymentMethod(val || 'cash')}
                                    >
                                        <SelectTrigger id="payment_method" className="h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="credit_card">Credit Card</SelectItem>
                                            <SelectItem value="cheque">Cheque</SelectItem>
                                            <SelectItem value="online">Online Payment</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="payment_ref" className="text-xs font-medium">
                                        Reference / Transaction ID
                                    </Label>
                                    <Input
                                        id="payment_ref"
                                        value={paymentReference}
                                        onChange={(e) => onChangePaymentReference(e.target.value)}
                                        placeholder="e.g. TXN-98472 or Bank Slip #"
                                        className="h-10"
                                    />
                                </div>

                                <div className="sm:col-span-3 p-3 bg-muted/40 rounded-lg flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Remaining Balance After Payment:</span>
                                    <MoneyText
                                        amount={remainingBalanceAfterPayment}
                                        currency={currency}
                                        weight="bold"
                                        className={
                                            remainingBalanceAfterPayment === 0 ? 'text-emerald-600' : 'text-primary'
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
