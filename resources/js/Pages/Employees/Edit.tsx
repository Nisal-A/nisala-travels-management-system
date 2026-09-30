import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import EmployeeForm from './Partials/EmployeeForm';
import { User } from '@/types';

interface EditProps {
    employee: User;
    roles: { id: number, name: string }[];
}

export default function Edit({ employee, roles }: EditProps) {
    return (
        <AppLayout
            title="Edit Employee"
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Employees', href: route('employees.index') },
                { label: 'Edit Employee' },
            ]}
        >
            <Head title={`Edit Employee - ${employee.name}`} />

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Edit Employee</h1>
                <p className="text-muted-foreground mt-1">Update details and access permissions for {employee.name}.</p>
            </div>

            <EmployeeForm employee={employee} roles={roles} isEditing={true} />
        </AppLayout>
    );
}
