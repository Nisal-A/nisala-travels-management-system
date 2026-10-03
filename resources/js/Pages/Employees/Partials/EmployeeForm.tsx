import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, X } from 'lucide-react';
import { User } from '@/types';
import { Link } from '@inertiajs/react';

interface EmployeeFormProps {
    employee?: User;
    roles: { id: number; name: string }[];
    isEditing?: boolean;
}

export default function EmployeeForm({ employee, roles, isEditing = false }: EmployeeFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: employee?.name || '',
        email: employee?.email || '',
        password: '',
        password_confirmation: '',
        status: employee?.status || 'active',
        role: employee?.roles?.[0] || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && employee) {
            put(route('employees.update', employee.id));
        } else {
            post(route('employees.store'));
        }
    };

    return (
        <form onSubmit={submit} className="max-w-2xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Employee Details</CardTitle>
                    <CardDescription>
                        {isEditing
                            ? 'Update employee profile and system access.'
                            : 'Create a new employee profile to grant system access.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                                required
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                                required
                            />
                            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role *</Label>
                            <Select value={data.role} onValueChange={(value) => setData('role', value)} required>
                                <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.name} className="capitalize">
                                            {role.name.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Account Status *</Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value)} required>
                                <SelectTrigger className={errors.status ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border/50">
                        <div>
                            <h3 className="text-sm font-medium leading-none mb-1">
                                {isEditing ? 'Change Password' : 'Set Password *'}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-4">
                                {isEditing
                                    ? 'Leave blank to keep current password.'
                                    : 'Set an initial password for the employee.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password {!isEditing && '*'}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={
                                        errors.password ? 'border-destructive focus-visible:ring-destructive' : ''
                                    }
                                    required={!isEditing}
                                />
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm Password {!isEditing && '*'}</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required={!isEditing || !!data.password}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-end space-x-4">
                <Link
                    href={route('employees.index')}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                </Link>
                <Button type="submit" disabled={processing}>
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            {isEditing ? 'Update Employee' : 'Create Employee'}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
