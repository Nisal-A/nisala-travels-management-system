import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/common';
import CustomerForm from './Partials/CustomerForm';

export default function CustomersCreate() {
    return (
        <AppLayout
            title="Create Customer"
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Customers', href: route('customers.index') },
                { label: 'Create' },
            ]}
        >
            <Head title="Create Customer" />

            <div className="space-y-6">
                <PageHeader
                    title="New Customer"
                    description="Add a new customer profile to the database."
                />

                <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/50 border-b border-border pb-4">
                        <CardTitle className="text-base font-bold">Customer Profile Details</CardTitle>
                        <CardDescription>
                            Please fill in the customer's information. Fields marked with an asterisk (*) are required.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <CustomerForm isEdit={false} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
