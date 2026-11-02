import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/common';
import CustomerForm from './Partials/CustomerForm';
import { Customer } from '@/types';

interface EditProps {
    customer: Customer;
}

export default function CustomersEdit({ customer }: EditProps) {
    return (
        <AppLayout
            title={`Edit Customer: ${customer.customer_id || 'Unknown'}`}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Customers', href: route('customers.index') },
                { label: customer.customer_id || 'Customer', href: route('customers.show', { customer: customer.id }) },
                { label: 'Edit' },
            ]}
        >
            <Head title={`Edit ${customer.full_name}`} />

            <div className="space-y-6">
                <PageHeader
                    title={`Edit Customer: ${customer.full_name}`}
                    description={`Updating records for ${customer.customer_id || 'customer'}.`}
                />

                <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/50 border-b border-border pb-4">
                        <CardTitle className="text-base font-bold">Customer Profile Details</CardTitle>
                        <CardDescription>Make changes to the customer's information below.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <CustomerForm customer={customer} isEdit={true} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
