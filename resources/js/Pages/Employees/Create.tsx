import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { PageHeader } from '@/components/common';
import EmployeeForm from './Partials/EmployeeForm';
import { User } from '@/types';

interface CreateProps {
    roles: { id: number; name: string }[];
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

            <div className="space-y-6">
                <PageHeader
                    title="Add New Employee"
                    description="Create a new system user with specific role permissions."
                    breadcrumbs={[
                        { label: 'Employees', href: route('employees.index') },
                        { label: 'Create Employee' },
                    ]}
                />

                <EmployeeForm roles={roles} />
            </div>
        </AppLayout>
    );
}
