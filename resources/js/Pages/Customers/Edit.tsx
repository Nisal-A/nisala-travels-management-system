import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
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

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('customers.index')} className={buttonVariants({ variant: 'outline', size: 'icon' }) + " h-8 w-8"}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Edit Customer</h2>
                        <p className="text-muted-foreground">Updating records for {customer.full_name}.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader className="bg-muted/30 border-b pb-4">
                        <CardTitle>Customer Profile Details</CardTitle>
                        <CardDescription>
                            Make changes to the customer's information below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <CustomerForm customer={customer} isEdit={true} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
