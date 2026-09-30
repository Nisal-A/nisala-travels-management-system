import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, StatusBadge, MoneyText, EmptyState, PageHeader } from '@/components/common';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PaginatedData, Payment } from '@/types';
import { CreditCard } from 'lucide-react';

interface Props {
    payments: PaginatedData<Payment>;
}

export default function PortalPayments({ payments }: Props) {
    return (
        <AppLayout title="My Payments">
            <Head title="My Payments" />

            <div className="space-y-6">
                <PageHeader
                    title="My Payments"
                    description="View your payment history."
                />

                <Card>
                    <CardContent className="p-0">
                        {payments.data.length === 0 ? (
                            <EmptyState
                                icon={CreditCard}
                                title="No payments found"
                                description="You haven't made any payments yet."
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Receipt</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Booking Ref</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.data.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell className="font-medium">
                                                    {payment.receipt_number || `PAY-${payment.id.toString().padStart(4, '0')}`}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(payment.payment_date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {payment.booking?.booking_reference || 'N/A'}
                                                </TableCell>
                                                <TableCell className="capitalize">
                                                    {payment.payment_method.replace('_', ' ')}
                                                </TableCell>
                                                <TableCell>
                                                    <MoneyText amount={Number(payment.amount)} currency={payment.currency || 'LKR'} />
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge 
                                                        type="payment" 
                                                        status={
                                                            (payment.status.charAt(0).toUpperCase() + payment.status.slice(1)) as "Pending" | "Verified" | "Completed" | "Failed" | "Unpaid" | "Partial" | "Paid" | "Refunded"
                                                        } 
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
