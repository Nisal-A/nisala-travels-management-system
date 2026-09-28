import PlaceholderPage from '@/components/PlaceholderPage';
import { UserCog } from 'lucide-react';

export default function EmployeesIndex() {
    return (
        <PlaceholderPage
            title="Employees"
            description="Employee management — manage staff accounts, roles, and access permissions."
            icon={UserCog}
            module="NT-Employees"
        />
    );
}
