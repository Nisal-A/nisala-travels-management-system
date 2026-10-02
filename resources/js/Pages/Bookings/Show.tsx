import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { Edit, Trash, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { useState } from 'react';

import { Booking, Traveler } from '@/types';

interface BookingShowProps {
    booking: Booking;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'confirmed': return 'bg-blue-100 text-blue-800';
        case 'completed': return 'bg-green-100 text-green-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default function Show({ booking }: BookingShowProps) {
    const { hasRole } = useAuth();
    const canUpdate = hasRole('super_admin', 'manager', 'staff');
    const canCancel = hasRole('super_admin', 'manager');
    const canRecordPayment = hasRole('super_admin', 'manager', 'finance');

    const { patch: updateStatus, delete: deleteBooking, processing } = useForm();
    const paymentForm = useForm({
        booking_id: booking.id,
        amount: '',
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        reference_number: '',
        notes: ''
    });

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const changeStatus = (status: string) => {
        if (confirm(`Are you sure you want to change the status to ${status}?`)) {
            updateStatus(route('bookings.status', booking.id as any), { booking_status: status } as Record<string, unknown>);
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to archive this booking? This cannot be undone.')) {
            deleteBooking(route('bookings.destroy', booking.id as any));
        }
    };

    const handleRecordPayment = (e: React.FormEvent) => {
        e.preventDefault();
        paymentForm.post(route('payments.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                paymentForm.reset('amount', 'reference_number', 'notes');
            }
        });
    };

    return (
        <AppLayout>
            <Head title={`Booking ${booking.booking_reference}`} />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Booking {booking.booking_reference}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={getStatusColor(booking.booking_status)}>
                            {booking.booking_status.toUpperCase()}
                        </Badge>
                        <span className="text-muted-foreground text-sm">
                            Created on {new Date(booking.created_at || '').toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div className="flex space-x-2">
                    {canUpdate && (
                        <Link href={route('bookings.edit', booking.id as any)} className={buttonVariants({ variant: 'outline' })}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                    )}
                    {canCancel && booking.booking_status !== 'cancelled' && (
                        <Button variant="destructive" onClick={handleDelete} disabled={processing}>
                            <Trash className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Name:</strong> {booking.customer?.first_name} {booking.customer?.last_name}</p>
                        <p><strong>Email:</strong> {booking.customer?.email}</p>
                        <p><strong>Phone:</strong> {booking.customer?.phone}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Package & Travel</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Package:</strong> {booking.tour_package?.name}</p>
                        <p><strong>Travel Date:</strong> {booking.travel_date}</p>
                        <p><strong>Return Date:</strong> {booking.return_date || 'N/A'}</p>
                        <p><strong>Travelers:</strong> {booking.number_of_travelers}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle>Financial Summary</CardTitle>
                        {canRecordPayment && Number(booking.balance_amount) > 0 && (
                            <Button size="sm" onClick={() => setIsPaymentModalOpen(true)}>
                                <DollarSign className="mr-2 h-4 w-4" /> Record Payment
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Base Amount:</strong> {Number(booking.base_amount).toLocaleString()} {booking.currency}</p>
                        <p><strong>Discount:</strong> {Number(booking.discount_amount).toLocaleString()} {booking.currency}</p>
                        <p className="text-lg font-bold"><strong>Final Total:</strong> {Number(booking.final_amount).toLocaleString()} {booking.currency}</p>
                        <div className="flex justify-between items-center">
                            <p className="text-emerald-600 font-semibold">Paid: {Number(booking.paid_amount || 0).toLocaleString()} {booking.currency}</p>
                            <p className="text-lg text-red-600 font-bold">Balance: {Number(booking.balance_amount).toLocaleString()} {booking.currency}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Travelers</CardTitle>
                    <CardDescription>People included in this booking</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Passport</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {booking.travelers?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No travelers added.</TableCell>
                                </TableRow>
                            ) : (
                                booking.travelers?.map((t: Traveler) => (
                                    <TableRow key={t.id}>
                                        <TableCell className="font-medium">{t.full_name}</TableCell>
                                        <TableCell className="capitalize">{t.traveler_type}</TableCell>
                                        <TableCell>{t.passport_number || 'N/A'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {canUpdate && (
                <Card>
                    <CardHeader>
                        <CardTitle>Workflow Actions</CardTitle>
                        <CardDescription>Update the lifecycle status of this booking</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4">
                        {booking.booking_status === 'pending' && (
                            <Button onClick={() => changeStatus('confirmed')} disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                <CheckCircle className="mr-2 h-4 w-4" /> Confirm Booking
                            </Button>
                        )}
                        {booking.booking_status === 'confirmed' && (
                            <Button onClick={() => changeStatus('completed')} disabled={processing} className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="mr-2 h-4 w-4" /> Mark as Completed
                            </Button>
                        )}
                        {canCancel && ['pending', 'confirmed'].includes(booking.booking_status) && (
                            <Button variant="destructive" onClick={() => changeStatus('cancelled')} disabled={processing}>
                                <XCircle className="mr-2 h-4 w-4" /> Cancel Booking
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                        <DialogDescription>
                            Record a new payment for booking {booking.booking_reference}.
                            <br />
                            Remaining balance: <strong>{Number(booking.balance_amount).toLocaleString()} {booking.currency}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleRecordPayment} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount ({booking.currency})</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    max={booking.balance_amount}
                                    value={paymentForm.data.amount}
                                    onChange={(e) => paymentForm.setData('amount', e.target.value)}
                                    required
                                />
                                {paymentForm.errors.amount && <p className="text-sm text-destructive">{paymentForm.errors.amount}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payment_date">Payment Date</Label>
                                <Input
                                    id="payment_date"
                                    type="date"
                                    value={paymentForm.data.payment_date}
                                    onChange={(e) => paymentForm.setData('payment_date', e.target.value)}
                                    required
                                />
                                {paymentForm.errors.payment_date && <p className="text-sm text-destructive">{paymentForm.errors.payment_date}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payment_method">Payment Method</Label>
                            <Select 
                                value={paymentForm.data.payment_method} 
                                onValueChange={(value) => paymentForm.setData('payment_method', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="credit_card">Credit Card</SelectItem>
                                    <SelectItem value="cheque">Cheque</SelectItem>
                                </SelectContent>
                            </Select>
                            {paymentForm.errors.payment_method && <p className="text-sm text-destructive">{paymentForm.errors.payment_method}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reference_number">Reference / Receipt Number (Optional)</Label>
                            <Input
                                id="reference_number"
                                value={paymentForm.data.reference_number}
                                onChange={(e) => paymentForm.setData('reference_number', e.target.value)}
                            />
                            {paymentForm.errors.reference_number && <p className="text-sm text-destructive">{paymentForm.errors.reference_number}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={paymentForm.data.notes}
                                onChange={(e) => paymentForm.setData('notes', e.target.value)}
                            />
                            {paymentForm.errors.notes && <p className="text-sm text-destructive">{paymentForm.errors.notes}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={paymentForm.processing}>
                                {paymentForm.processing ? 'Saving...' : 'Record Payment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
