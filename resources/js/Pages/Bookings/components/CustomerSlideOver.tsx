import React, { useState } from 'react';
import axios from 'axios';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Customer } from '@/types';
import { UserPlus, Loader2 } from 'lucide-react';

interface CustomerSlideOverProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCustomerCreated: (customer: Customer) => void;
}

export default function CustomerSlideOver({ open, onOpenChange, onCustomerCreated }: CustomerSlideOverProps) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        whatsapp: '',
        passport_number: '',
        nic: '',
        dob: '',
        gender: 'Male',
        nationality: 'Sri Lankan',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        notes: '',
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await axios.post('/customers', formData, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            if (response.data?.customer) {
                toast.success(`Customer ${response.data.customer.first_name} created successfully`);
                onCustomerCreated(response.data.customer);
                onOpenChange(false);
                // Reset form
                setFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    whatsapp: '',
                    passport_number: '',
                    nic: '',
                    dob: '',
                    gender: 'Male',
                    nationality: 'Sri Lankan',
                    address: '',
                    emergency_contact_name: '',
                    emergency_contact_phone: '',
                    notes: '',
                });
            }
        } catch (error: any) {
            if (error.response?.status === 422 && error.response?.data?.errors) {
                const validationErrors: Record<string, string> = {};
                Object.keys(error.response.data.errors).forEach(key => {
                    validationErrors[key] = error.response.data.errors[key][0];
                });
                setErrors(validationErrors);
                toast.error('Please fix the validation errors.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to create customer.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader className="border-b pb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <SheetTitle className="text-xl">Create New Customer</SheetTitle>
                            <SheetDescription>
                                Add a customer record without leaving the booking wizard.
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="first_name">First Name *</Label>
                            <Input
                                id="first_name"
                                value={formData.first_name}
                                onChange={e => handleChange('first_name', e.target.value)}
                                placeholder="Kasun"
                                required
                            />
                            {errors.first_name && <p className="text-xs text-destructive">{errors.first_name}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="last_name">Last Name *</Label>
                            <Input
                                id="last_name"
                                value={formData.last_name}
                                onChange={e => handleChange('last_name', e.target.value)}
                                placeholder="Perera"
                                required
                            />
                            {errors.last_name && <p className="text-xs text-destructive">{errors.last_name}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={e => handleChange('email', e.target.value)}
                                placeholder="kasun.perera@example.com"
                                required
                            />
                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={e => handleChange('phone', e.target.value)}
                                placeholder="+94 77 123 4567"
                                required
                            />
                            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="passport_number">Passport Number</Label>
                            <Input
                                id="passport_number"
                                value={formData.passport_number}
                                onChange={e => handleChange('passport_number', e.target.value)}
                                placeholder="N1234567"
                            />
                            {errors.passport_number && <p className="text-xs text-destructive">{errors.passport_number}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="nationality">Nationality</Label>
                            <Input
                                id="nationality"
                                value={formData.nationality}
                                onChange={e => handleChange('nationality', e.target.value)}
                                placeholder="Sri Lankan"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input
                                id="dob"
                                type="date"
                                value={formData.dob}
                                onChange={e => handleChange('dob', e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                                value={formData.gender}
                                onValueChange={val => handleChange('gender', val || 'Male')}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={e => handleChange('address', e.target.value)}
                            placeholder="Colombo, Sri Lanka"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                            <Input
                                id="emergency_contact_name"
                                value={formData.emergency_contact_name}
                                onChange={e => handleChange('emergency_contact_name', e.target.value)}
                                placeholder="Contact Name"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                            <Input
                                id="emergency_contact_phone"
                                value={formData.emergency_contact_phone}
                                onChange={e => handleChange('emergency_contact_phone', e.target.value)}
                                placeholder="+94 71 987 6543"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="notes">Customer Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={e => handleChange('notes', e.target.value)}
                            placeholder="VIP client, prefers vegetarian meals, etc."
                            rows={2}
                        />
                    </div>

                    <SheetFooter className="pt-4 border-t flex flex-row justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create & Select Customer
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
