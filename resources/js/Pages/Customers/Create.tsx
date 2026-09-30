import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
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

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('customers.index')} className={buttonVariants({ variant: 'outline', size: 'icon' }) + " h-8 w-8"}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">New Customer</h2>
                        <p className="text-muted-foreground">Add a new customer to the database.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader className="bg-muted/30 border-b pb-4">
                        <CardTitle>Customer Profile Details</CardTitle>
                        <CardDescription>
                            Please fill in the customer's information. Fields marked with an asterisk (*) are required.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <CustomerForm isEdit={false} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
