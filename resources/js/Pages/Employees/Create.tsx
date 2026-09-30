import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import EmployeeForm from './Partials/EmployeeForm';
import { User } from '@/types';

interface CreateProps {
    roles: { id: number, name: string }[];
}

export default function Create({ roles }: CreateProps) {
    return (
        <AppLayout
            title="Create Employee"
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Employees', href: route('employees.index') },
                { label: 'Create Employee' },
            ]}
        >
            <Head title="Create Employee" />

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Add New Employee</h1>
                <p className="text-muted-foreground mt-1">Create a new system user with specific role permissions.</p>
            </div>

            <EmployeeForm roles={roles} />
        </AppLayout>
    );
}
