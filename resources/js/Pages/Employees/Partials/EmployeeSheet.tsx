import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { User } from '@/types';
import { toast } from 'sonner';

interface EmployeeSheetProps {
    isOpen: boolean;
    onClose: () => void;
    employee?: User | null; // If null, it's create mode
    roles: { id: number; name: string }[];
}

export function EmployeeSheet({ isOpen, onClose, employee, roles }: EmployeeSheetProps) {
    const isEditing = !!employee;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        phone: '',
        role: 'staff',
        status: 'active',
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (isEditing && employee) {
                setData({
                    name: employee.name,
                    email: employee.email,
                    phone: employee.phone ?? '',
                    role: employee.role ?? employee.roles?.[0] ?? 'staff',
                    status: employee.status,
                });
            } else {
                reset();
                setData('status', 'active');
                setData('role', 'staff');
            }
        }
    }, [isOpen, employee]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && employee) {
            put(route('employees.update', { employee: employee.id.toString() }), {
                onSuccess: () => {
                    toast.success('Employee updated successfully.');
                    onClose();
                },
                onError: () => toast.error('Please check the form for errors.'),
            });
        } else {
            post(route('employees.store'), {
                onSuccess: () => {
                    toast.success('Employee created successfully. Invitation sent.');
                    onClose();
                },
                onError: () => toast.error('Please check the form for errors.'),
            });
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-[425px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEditing ? 'Edit Employee' : 'Add Employee'}</SheetTitle>
                    <SheetDescription>
                        {isEditing 
                            ? "Update the employee's information and permissions here."
                            : "Create a new employee account. They will receive an email invitation to set their password."}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="John Doe"
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="john@example.com"
                        />
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={data.phone || ''}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="+1 234 567 890"
                        />
                        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">System Role <span className="text-destructive">*</span></Label>
                        <Select value={data.role || ''} onValueChange={(val) => setData('role', val)}>
                            <SelectTrigger>
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
                        <Label htmlFor="status">Account Status <span className="text-destructive">*</span></Label>
                        <Select value={data.status || ''} onValueChange={(val) => setData('status', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
