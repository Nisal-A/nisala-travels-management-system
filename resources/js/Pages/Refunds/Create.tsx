import React, { useState, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { PageHeader, MoneyText } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, AlertCircle, Info, DollarSign } from 'lucide-react';
import { Booking, Payment } from '@/types';

interface CreateRefundProps {
    bookings: (Booking & { customer?: { full_name?: string; email?: string } })[];
    selectedBooking?: (Booking & { customer?: { full_name?: string }; payments?: Payment[] }) | null;
    selectedBookingId?: number | null;
}

export default function CreateRefund({ bookings, selectedBooking, selectedBookingId }: CreateRefundProps) {
    const [bookingId, setBookingId] = useState<string>(
        selectedBookingId ? String(selectedBookingId) : selectedBooking ? String(selectedBooking.id) : '',
    );

    const activeBooking = useMemo(() => {
        if (!bookingId) return null;
        if (selectedBooking && String(selectedBooking.id) === bookingId) return selectedBooking;
        return bookings.find((b) => String(b.id) === bookingId) || null;
    }, [bookingId, bookings, selectedBooking]);

    const { data, setData, post, processing, errors } = useForm({
        booking_id: bookingId,
        payment_id: '',
        amount: '',
        cancellation_charge: '0',
        reason: '',
        notes: '',
    });

    const handleBookingSelect = (val: string) => {
        setBookingId(val);
        setData('booking_id', val);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('refunds.store'));
    };

    const currency = activeBooking?.currency || 'LKR';
    const paidAmount = Number(activeBooking?.paid_amount || 0);

    return (
        <AppLayout
            title="Request Refund"
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Refunds', href: route('refunds.index') },
                { label: 'New Request' },
            ]}
        >
            <Head title="Request Refund" />
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <PageHeader
                        title="Request Refund"
                        description="Submit a refund request for manager review and approval."
                    />
                    <Button variant="ghost" asChild>
                        <Link href={route('refunds.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking & Customer Details</CardTitle>
                            <CardDescription>
                                Select the booking to refund. The refund amount cannot exceed total payments received.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="booking_id">
                                    Target Booking <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.booking_id}
                                    onValueChange={handleBookingSelect}
                                >
                                    <SelectTrigger id="booking_id" className="w-full">
                                        <SelectValue placeholder="Select a booking" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bookings.map((b) => (
                                            <SelectItem key={b.id} value={String(b.id)}>
                                                {b.booking_reference || `BKG-${b.id}`} — {b.customer?.full_name || 'Customer'} (Paid: {b.currency} {Number(b.paid_amount || 0).toLocaleString()})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.booking_id && (
                                    <p className="text-xs text-destructive">{errors.booking_id}</p>
                                )}
                            </div>

                            {activeBooking && (
                                <div className="rounded-lg bg-muted/40 border p-4 space-y-3">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <span className="text-sm font-semibold text-foreground">
                                            {activeBooking.booking_reference || `BKG-${activeBooking.id}`}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Customer: {activeBooking.customer?.full_name}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                        <div>
                                            <span className="text-muted-foreground block">Total Price:</span>
                                            <span className="font-semibold">
                                                <MoneyText amount={Number(activeBooking.final_amount || activeBooking.total_amount || 0)} currency={currency as any} />
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block">Paid to Date:</span>
                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                <MoneyText amount={paidAmount} currency={currency as any} />
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block">Max Refundable:</span>
                                            <span className="font-bold text-foreground">
                                                <MoneyText amount={paidAmount} currency={currency as any} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Refund Terms & Amount</CardTitle>
                            <CardDescription>
                                Enter refund amount, cancellation charges, and justification.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">
                                        Refund Amount ({currency}) <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max={paidAmount > 0 ? paidAmount : undefined}
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.amount && (
                                        <p className="text-xs text-destructive">{errors.amount}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cancellation_charge">
                                        Cancellation Charge / Fee ({currency})
                                    </Label>
                                    <Input
                                        id="cancellation_charge"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.cancellation_charge}
                                        onChange={(e) => setData('cancellation_charge', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.cancellation_charge && (
                                        <p className="text-xs text-destructive">{errors.cancellation_charge}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">
                                    Reason for Refund <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="reason"
                                    rows={3}
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    placeholder="Explain why this refund is requested (e.g. flight cancelled, guest emergency, itinerary alteration)..."
                                    required
                                />
                                {errors.reason && (
                                    <p className="text-xs text-destructive">{errors.reason}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Internal Notes</Label>
                                <Textarea
                                    id="notes"
                                    rows={2}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Optional accounting or bank communication notes..."
                                />
                                {errors.notes && (
                                    <p className="text-xs text-destructive">{errors.notes}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" asChild>
                                    <Link href={route('refunds.index')}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing || !data.booking_id}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Submitting...' : 'Submit Refund Request'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
