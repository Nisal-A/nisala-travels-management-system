import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { PageHeader, MoneyText, StatusBadge, ConfirmDialog } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    CreditCard,
    DollarSign,
    Calendar,
    User,
    Clock,
    FileText,
    History,
} from 'lucide-react';
import { Refund } from '@/types';

interface RefundsShowProps {
    refund: Refund;
    canApprove: boolean;
    canReject: boolean;
    canMarkPaid: boolean;
    paymentMethods: { value: string; label: string }[];
}

export default function RefundsShow({
    refund,
    canApprove,
    canReject,
    canMarkPaid,
    paymentMethods = [],
}: RefundsShowProps) {
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reject form
    const [rejectionReason, setRejectionReason] = useState('');

    // Mark paid form
    const [paidOn, setPaidOn] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]?.value || 'bank_transfer');
    const [paymentNotes, setPaymentNotes] = useState('');

    const handleApprove = () => {
        setIsSubmitting(true);
        router.patch(route('refunds.approve', { refund: refund.id }), {}, {
            onFinish: () => {
                setIsSubmitting(false);
                setIsApproveOpen(false);
            },
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.patch(
            route('refunds.reject', { refund: refund.id }),
            { rejection_reason: rejectionReason },
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    setIsRejectOpen(false);
                },
            },
        );
    };

    const handleMarkPaid = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.patch(
            route('refunds.mark-paid', { refund: refund.id }),
            {
                paid_on: paidOn,
                payment_method: paymentMethod,
                notes: paymentNotes,
            },
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    setIsMarkPaidOpen(false);
                },
            },
        );
    };

    return (
        <AppLayout
            title={`Refund ${refund.refund_number}`}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Refunds', href: route('refunds.index') },
                { label: refund.refund_number },
            ]}
        >
            <Head title={`Refund ${refund.refund_number}`} />
            <div className="space-y-6">
                <PageHeader
                    title={refund.refund_number}
                    description={`Requested on ${String(refund.created_at).split('T')[0]} by ${refund.requestedBy?.name || 'Staff'}`}
                    breadcrumbs={[
                        { label: 'Refunds', href: route('refunds.index') },
                        { label: refund.refund_number },
                    ]}
                    actions={
                        <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge status={refund.status} />
                            {canApprove && (
                                <Button
                                    variant="default"
                                    onClick={() => setIsApproveOpen(true)}
                                >
                                    <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve
                                </Button>
                            )}

                            {canReject && (
                                <Button
                                    variant="destructive"
                                    onClick={() => setIsRejectOpen(true)}
                                >
                                    <XCircle className="mr-1.5 h-4 w-4" /> Reject
                                </Button>
                            )}

                            {canMarkPaid && (
                                <Button
                                    variant="default"
                                    onClick={() => setIsMarkPaidOpen(true)}
                                >
                                    <CreditCard className="mr-1.5 h-4 w-4" /> Mark as Paid
                                </Button>
                            )}
                        </div>
                    }
                />

                {/* Key Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-bold">Refund Amount</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="text-2xl font-bold text-foreground">
                                <MoneyText amount={Number(refund.amount)} currency={refund.currency as any} />
                            </div>
                            {refund.currency !== 'LKR' && (
                                <div className="text-xs text-muted-foreground">
                                    ≈ <MoneyText amount={Number(refund.amount_lkr)} currency="LKR" />
                                    <span className="ml-1 font-mono text-[11px]">(@ {refund.exchange_rate_to_lkr})</span>
                                </div>
                            )}
                            {Number(refund.cancellation_charge || 0) > 0 && (
                                <div className="text-xs text-muted-foreground pt-1 border-t mt-2">
                                    Fee charged: <MoneyText amount={Number(refund.cancellation_charge)} currency={refund.currency as any} />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-bold">Booking & Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Booking:</span>
                                <Link
                                    href={route('bookings.show', { booking: refund.booking_id })}
                                    className="font-semibold text-primary hover:underline text-sm"
                                >
                                    {refund.booking?.booking_reference || `BKG-${refund.booking_id}`}
                                </Link>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Customer:</span>
                                <span className="font-medium text-foreground text-sm">{refund.customer?.full_name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Booking Paid:</span>
                                <span className="font-semibold text-sm">
                                    <MoneyText amount={Number(refund.booking?.paid_amount || 0)} currency={refund.currency as any} />
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-bold">Audit & Approvals</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Requested by:</span>
                                <span className="font-medium text-foreground text-sm">{refund.requestedBy?.name || 'Staff'}</span>
                            </div>
                            {refund.approvedBy && (
                                <div className="flex justify-between items-center">
                                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Reviewed by:</span>
                                    <span className="font-medium text-foreground text-sm">{refund.approvedBy?.name}</span>
                                </div>
                            )}
                            {refund.approved_at && (
                                <div className="flex justify-between items-center">
                                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Decision date:</span>
                                    <span className="text-sm">{String(refund.approved_at).split('T')[0]}</span>
                                </div>
                            )}
                            {refund.paid_on && (
                                <div className="flex justify-between items-center">
                                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Settled on:</span>
                                    <span className="font-semibold text-success text-sm">
                                        {String(refund.paid_on).split('T')[0]} ({refund.payment_method?.replace('_', ' ')})
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Justification & Reason</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Reason</Label>
                                <p className="mt-1.5 text-sm bg-muted/30 p-3 rounded-lg border border-border whitespace-pre-wrap font-medium text-foreground">
                                    {refund.reason}
                                </p>
                            </div>
                            {refund.notes && (
                                <div>
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Internal Notes</Label>
                                    <p className="mt-1.5 text-xs bg-muted/20 p-3 rounded-lg border border-border whitespace-pre-wrap text-muted-foreground">
                                        {refund.notes}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline & Activity Logs */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <History className="h-4 w-4 text-primary" />
                                <CardTitle className="text-base font-bold">Activity Timeline</CardTitle>
                            </div>
                            <CardDescription>Transition history for this refund record.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {(!refund.activityLogs || refund.activityLogs.length === 0) ? (
                                <div className="text-xs text-muted-foreground py-4 text-center">
                                    Refund recorded. Status: {refund.status}.
                                </div>
                            ) : (
                                <div className="space-y-4 border-l-2 border-muted pl-4 ml-2">
                                    {refund.activityLogs.map((log) => (
                                        <div key={log.id} className="relative space-y-0.5 text-xs">
                                            <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                                            <div className="font-medium text-foreground">{log.description}</div>
                                            <div className="text-[11px] text-muted-foreground">
                                                {String(log.created_at).split('T')[0]} by {log.causer?.name || 'System'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Approve Confirm Dialog */}
            <ConfirmDialog
                open={isApproveOpen}
                onOpenChange={setIsApproveOpen}
                title="Approve Refund Request"
                description={`Are you sure you want to approve this refund of ${refund.currency} ${Number(refund.amount).toLocaleString()} for ${refund.customer?.full_name}?`}
                confirmLabel="Approve Refund"
                isLoading={isSubmitting}
                onConfirm={handleApprove}
            />

            {/* Reject Dialog */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Refund Request</DialogTitle>
                        <DialogDescription>
                            Please state the reason for rejecting this refund request.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleReject} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="rejection_reason">Rejection Reason</Label>
                            <Textarea
                                id="rejection_reason"
                                rows={3}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Explain why the refund request is rejected..."
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsRejectOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={isSubmitting}>
                                {isSubmitting ? 'Rejecting...' : 'Reject Request'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Mark Paid Dialog */}
            <Dialog open={isMarkPaidOpen} onOpenChange={setIsMarkPaidOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark Refund as Paid</DialogTitle>
                        <DialogDescription>
                            Record the payout date and disbursement method for this approved refund.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleMarkPaid} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="paid_on">Payment Date *</Label>
                            <Input
                                id="paid_on"
                                type="date"
                                value={paidOn}
                                onChange={(e) => setPaidOn(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="payment_method">Payment Method *</Label>
                            <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val || 'bank_transfer')}>
                                <SelectTrigger id="payment_method" className="w-full">
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethods.map((m) => (
                                        <SelectItem key={m.value} value={m.value}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="payment_notes">Payment Reference / Notes</Label>
                            <Textarea
                                id="payment_notes"
                                rows={2}
                                value={paymentNotes}
                                onChange={(e) => setPaymentNotes(e.target.value)}
                                placeholder="Bank transfer reference number, check number, etc."
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsMarkPaidOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Recording...' : 'Confirm Paid'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
