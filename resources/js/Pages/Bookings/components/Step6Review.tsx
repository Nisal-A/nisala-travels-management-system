import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MoneyText } from '@/components/common/money-text';
import { Customer, TourPackage, Employee } from '@/types';
import { TravelerRow } from './Step3Travelers';
import { ExtraItem } from './Step4Pricing';
import { ScheduleItem } from './Step5Payment';
import { User, MapPin, Users, Calculator, CreditCard, Edit2, CheckCircle2, ShieldCheck, Mail, Phone, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step6ReviewProps {
    customer?: Customer;
    packageItem?: TourPackage;
    bookingDate: string;
    travelDate: string;
    returnDate?: string;
    travelers: TravelerRow[];
    extras: ExtraItem[];
    taxAmount: number;
    discountAmount: number;
    paymentPlan: string;
    schedules: ScheduleItem[];
    recordPayment: boolean;
    paymentAmount: number;
    paymentMethod: string;
    paymentReference: string;
    notes: string;
    onChangeNotes: (notes: string) => void;
    assignedStaff?: Employee;
    onJumpToStep: (step: number) => void;
    onSubmit: () => void;
    submitting: boolean;
    isEditing?: boolean;
}

export default function Step6Review({
    customer,
    packageItem,
    bookingDate,
    travelDate,
    returnDate,
    travelers,
    extras,
    taxAmount,
    discountAmount,
    paymentPlan,
    schedules,
    recordPayment,
    paymentAmount,
    paymentMethod,
    paymentReference,
    notes,
    onChangeNotes,
    assignedStaff,
    onJumpToStep,
    onSubmit,
    submitting,
    isEditing = false,
}: Step6ReviewProps) {
    const currency = (packageItem?.currency as 'LKR' | 'USD') || 'LKR';
    const packagePrice = Number(packageItem?.price || 0);
    const baseSubtotal = packagePrice * travelers.length;
    const extrasSubtotal = extras.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const grossTotal = baseSubtotal + extrasSubtotal + Number(taxAmount || 0);
    const finalTotal = Math.max(0, grossTotal - Number(discountAmount || 0));
    const paidAmount = recordPayment ? paymentAmount : 0;
    const balanceAmount = Math.max(0, finalTotal - paidAmount);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-primary" /> Review & Confirm Booking
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Please verify all details before submitting. Click &quot;Edit&quot; next to any section to make changes.
                    </p>
                </div>

                <Button
                    type="button"
                    size="lg"
                    onClick={onSubmit}
                    disabled={submitting}
                    className="gap-2 font-semibold shadow-md self-start sm:self-auto"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {isEditing ? 'Saving Booking...' : 'Creating Booking...'}
                        </>
                    ) : (
                        <>
                            {isEditing ? 'Save Changes' : 'Confirm & Create Booking'}
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Details Sections */}
                <div className="lg:col-span-2 space-y-5">
                    {/* 1. Customer Summary */}
                    <Card className="border-border shadow-xs">
                        <CardHeader className="p-4 flex flex-row items-center justify-between border-b bg-muted/20">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" />
                                <CardTitle className="text-sm font-semibold">1. Customer Information</CardTitle>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onJumpToStep(1)}
                                className="h-7 text-xs gap-1 text-primary hover:bg-primary/10"
                            >
                                <Edit2 className="w-3 h-3" /> Edit
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4 text-xs space-y-2">
                            {customer ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
                                    <div>
                                        <span className="text-muted-foreground block">Customer Name:</span>
                                        <span className="font-semibold text-foreground text-sm">
                                            {customer.first_name} {customer.last_name}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Customer ID:</span>
                                        <span className="font-mono">{customer.customer_id || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Email Address:</span>
                                        <span>{customer.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Phone:</span>
                                        <span>{customer.phone}</span>
                                    </div>
                                    {customer.passport_number && (
                                        <div>
                                            <span className="text-muted-foreground block">Passport:</span>
                                            <span>{customer.passport_number}</span>
                                        </div>
                                    )}
                                    {assignedStaff && (
                                        <div>
                                            <span className="text-muted-foreground block">Assigned Staff:</span>
                                            <span>{assignedStaff.first_name} {assignedStaff.last_name} ({assignedStaff.designation || 'Staff'})</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-destructive font-medium">No customer selected.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* 2. Package & Dates Summary */}
                    <Card className="border-border shadow-xs">
                        <CardHeader className="p-4 flex flex-row items-center justify-between border-b bg-muted/20">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <CardTitle className="text-sm font-semibold">2. Tour Package & Travel Dates</CardTitle>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onJumpToStep(2)}
                                className="h-7 text-xs gap-1 text-primary hover:bg-primary/10"
                            >
                                <Edit2 className="w-3 h-3" /> Edit
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4 text-xs space-y-2">
                            {packageItem ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
                                    <div className="sm:col-span-2">
                                        <span className="text-muted-foreground block">Tour Package:</span>
                                        <span className="font-semibold text-foreground text-sm">
                                            {packageItem.name}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Booking Date:</span>
                                        <span>{bookingDate}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Departure Date:</span>
                                        <span className="font-semibold">{travelDate}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Return Date:</span>
                                        <span>{returnDate || 'Open return'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Duration:</span>
                                        <span>{packageItem.duration_days ? `${packageItem.duration_days} Days` : 'N/A'}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-destructive font-medium">No package selected.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* 3. Travelers Summary */}
                    <Card className="border-border shadow-xs">
                        <CardHeader className="p-4 flex flex-row items-center justify-between border-b bg-muted/20">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" />
                                <CardTitle className="text-sm font-semibold">
                                    3. Travelers ({travelers.length})
                                </CardTitle>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onJumpToStep(3)}
                                className="h-7 text-xs gap-1 text-primary hover:bg-primary/10"
                            >
                                <Edit2 className="w-3 h-3" /> Edit
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 text-xs">
                            <div className="divide-y">
                                {travelers.map((t, idx) => (
                                    <div key={idx} className="p-3 flex items-center justify-between">
                                        <div>
                                            <span className="font-semibold text-foreground block">
                                                {idx + 1}. {t.full_name}
                                            </span>
                                            <div className="flex items-center gap-3 text-muted-foreground mt-0.5 text-[11px]">
                                                <span className="capitalize">{t.traveler_type}</span>
                                                {t.passport_number && <span>Passport: {t.passport_number}</span>}
                                                {t.nationality && <span>{t.nationality}</span>}
                                            </div>
                                        </div>
                                        {t.special_requirements && (
                                            <span className="text-[11px] text-muted-foreground italic">
                                                Req: {t.special_requirements}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. Payment Plan Summary */}
                    <Card className="border-border shadow-xs">
                        <CardHeader className="p-4 flex flex-row items-center justify-between border-b bg-muted/20">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-primary" />
                                <CardTitle className="text-sm font-semibold">4. Payment Schedule & Deposit</CardTitle>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onJumpToStep(5)}
                                className="h-7 text-xs gap-1 text-primary hover:bg-primary/10"
                            >
                                <Edit2 className="w-3 h-3" /> Edit
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4 text-xs space-y-3">
                            <div className="space-y-1.5">
                                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                                    Milestones Schedule ({schedules.length})
                                </span>
                                <div className="border rounded-lg divide-y">
                                    {schedules.map((s, idx) => (
                                        <div key={idx} className="p-2.5 flex items-center justify-between">
                                            <div>
                                                <span className="font-medium text-foreground">{s.description}</span>
                                                <span className="text-[11px] text-muted-foreground block">Due: {s.due_date}</span>
                                            </div>
                                            <MoneyText amount={Number(s.amount)} currency={currency} size="sm" weight="semibold" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {recordPayment && (
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between">
                                    <div>
                                        <span className="font-semibold text-emerald-800 dark:text-emerald-300 block">
                                            Initial Payment Recorded:
                                        </span>
                                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                                            Method: {paymentMethod.toUpperCase()} {paymentReference ? `(Ref: ${paymentReference})` : ''}
                                        </span>
                                    </div>
                                    <MoneyText amount={paymentAmount} currency={currency} size="sm" weight="bold" className="text-emerald-700 dark:text-emerald-300" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Booking Internal Notes */}
                    <div className="space-y-1.5">
                        <Label htmlFor="review_notes" className="text-xs font-semibold">
                            Internal Booking Notes & Customer Requests (Optional)
                        </Label>
                        <Textarea
                            id="review_notes"
                            value={notes}
                            onChange={e => onChangeNotes(e.target.value)}
                            placeholder="Add any internal remarks, customer preferences, or special arrangements..."
                            rows={3}
                        />
                    </div>
                </div>

                {/* Right Col: Cost Breakdown Summary Card */}
                <div className="space-y-5">
                    <Card className="border-border shadow-xs sticky top-20 bg-card">
                        <CardHeader className="bg-primary/5 border-b p-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-primary" />
                                <CardTitle className="text-sm font-semibold">Price Breakdown</CardTitle>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onJumpToStep(4)}
                                className="h-7 text-xs gap-1 text-primary hover:bg-primary/10"
                            >
                                <Edit2 className="w-3 h-3" /> Edit
                            </Button>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4 text-xs">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Base Rate ({travelers.length} travelers):</span>
                                    <MoneyText amount={baseSubtotal} currency={currency} size="sm" />
                                </div>

                                {extras.length > 0 && (
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span>Add-ons ({extras.length}):</span>
                                        <MoneyText amount={extrasSubtotal} currency={currency} size="sm" />
                                    </div>
                                )}

                                {taxAmount > 0 && (
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span>Taxes:</span>
                                        <MoneyText amount={taxAmount} currency={currency} size="sm" />
                                    </div>
                                )}

                                {discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-emerald-600 font-medium">
                                        <span>Discount:</span>
                                        <span>-<MoneyText amount={discountAmount} currency={currency} size="sm" className="text-emerald-600" /></span>
                                    </div>
                                )}

                                <div className="border-t pt-3 flex justify-between items-baseline">
                                    <span className="font-bold text-sm text-foreground">Total Cost:</span>
                                    <MoneyText
                                        amount={finalTotal}
                                        currency={currency}
                                        size="xl"
                                        weight="bold"
                                        className="text-primary font-mono"
                                    />
                                </div>

                                {recordPayment && (
                                    <>
                                        <div className="flex justify-between items-center text-emerald-600 font-medium pt-1">
                                            <span>Immediate Payment:</span>
                                            <MoneyText amount={paidAmount} currency={currency} size="sm" />
                                        </div>
                                        <div className="flex justify-between items-center text-muted-foreground font-semibold pt-1 border-t">
                                            <span>Remaining Balance:</span>
                                            <MoneyText amount={balanceAmount} currency={currency} size="base" weight="bold" />
                                        </div>
                                    </>
                                )}
                            </div>

                            <Button
                                type="button"
                                size="lg"
                                onClick={onSubmit}
                                disabled={submitting}
                                className="w-full gap-2 font-semibold shadow-md mt-4"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {isEditing ? 'Saving...' : 'Creating Booking...'}
                                    </>
                                ) : (
                                    <>
                                        {isEditing ? 'Save Changes' : 'Confirm & Create Booking'}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
