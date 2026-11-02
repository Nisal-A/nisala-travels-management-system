import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { PageHeader } from '@/components/common';
import EmployeeForm from './Partials/EmployeeForm';
import { User } from '@/types';

interface EditProps {
    employee: User;
    roles: { id: number; name: string }[];
}

export default function Edit({ employee, roles }: EditProps) {
    return (
        <AppLayout
            title="Edit Employee"
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Employees', href: route('employees.index') },
                { label: `Edit ${employee.name}` },
            ]}
        >
            <Head title={`Edit Employee - ${employee.name}`} />

            <div className="space-y-6">
                <PageHeader
                    title="Edit Employee"
                    description={`Update details and access permissions for ${employee.name}.`}
                    breadcrumbs={[
                        { label: 'Employees', href: route('employees.index') },
                        { label: employee.name },
                    ]}
                />

                <EmployeeForm employee={employee} roles={roles} isEditing={true} />
            </div>
        </AppLayout>
    );
}
