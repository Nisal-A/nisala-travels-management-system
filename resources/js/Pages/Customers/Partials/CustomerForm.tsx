import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Save, Loader2, ArrowLeft } from 'lucide-react';

interface CustomerFormProps {
    customer?: any;
    isEdit?: boolean;
}

export default function CustomerForm({ customer, isEdit = false }: CustomerFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        full_name: customer?.full_name || '',
        nic: customer?.nic || '',
        passport_number: customer?.passport_number || '',
        dob: customer?.dob ? new Date(customer.dob).toISOString().split('T')[0] : '',
        gender: customer?.gender || '',
        nationality: customer?.nationality || '',
        phone: customer?.phone || '',
        whatsapp: customer?.whatsapp || '',
        email: customer?.email || '',
        address: customer?.address || '',
        emergency_contact_name: customer?.emergency_contact_name || '',
        emergency_contact_phone: customer?.emergency_contact_phone || '',
        status: customer?.status || 'active',
        notes: customer?.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEdit) {
            put(route('customers.update', customer.id));
        } else {
            post(route('customers.store'));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium border-b pb-2">Personal Information</h3>
                    
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name <span className="text-destructive">*</span></Label>
                        <Input
                            id="full_name"
                            value={data.full_name}
                            onChange={(e) => setData('full_name', e.target.value)}
                            className={errors.full_name ? 'border-destructive' : ''}
                        />
                        {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input
                                id="dob"
                                type="date"
                                value={data.dob}
                                onChange={(e) => setData('dob', e.target.value)}
                                className={errors.dob ? 'border-destructive' : ''}
                            />
                            {errors.dob && <p className="text-sm text-destructive">{errors.dob}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                                <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nationality">Nationality</Label>
                        <Input
                            id="nationality"
                            value={data.nationality}
                            onChange={(e) => setData('nationality', e.target.value)}
                            className={errors.nationality ? 'border-destructive' : ''}
                        />
                        {errors.nationality && <p className="text-sm text-destructive">{errors.nationality}</p>}
                    </div>
                </div>

                {/* Identification */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium border-b pb-2">Identification</h3>
                    
                    <div className="space-y-2">
                        <Label htmlFor="nic">NIC Number</Label>
                        <Input
                            id="nic"
                            value={data.nic}
                            onChange={(e) => setData('nic', e.target.value)}
                            className={errors.nic ? 'border-destructive' : ''}
                        />
                        {errors.nic && <p className="text-sm text-destructive">{errors.nic}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="passport_number">Passport Number</Label>
                        <Input
                            id="passport_number"
                            value={data.passport_number}
                            onChange={(e) => setData('passport_number', e.target.value)}
                            className={errors.passport_number ? 'border-destructive' : ''}
                        />
                        {errors.passport_number && <p className="text-sm text-destructive">{errors.passport_number}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="status">Account Status <span className="text-destructive">*</span></Label>
                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                            <SelectTrigger className={errors.status ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium border-b pb-2">Contact Information</h3>
                    
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className={errors.email ? 'border-destructive' : ''}
                        />
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className={errors.phone ? 'border-destructive' : ''}
                            />
                            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp</Label>
                            <Input
                                id="whatsapp"
                                value={data.whatsapp}
                                onChange={(e) => setData('whatsapp', e.target.value)}
                                className={errors.whatsapp ? 'border-destructive' : ''}
                            />
                            {errors.whatsapp && <p className="text-sm text-destructive">{errors.whatsapp}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                            id="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            className={`resize-none ${errors.address ? 'border-destructive' : ''}`}
                            rows={3}
                        />
                        {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                    </div>
                </div>

                {/* Emergency Contact & Notes */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium border-b pb-2">Emergency & Notes</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                            <Input
                                id="emergency_contact_name"
                                value={data.emergency_contact_name}
                                onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                className={errors.emergency_contact_name ? 'border-destructive' : ''}
                            />
                            {errors.emergency_contact_name && <p className="text-sm text-destructive">{errors.emergency_contact_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                            <Input
                                id="emergency_contact_phone"
                                value={data.emergency_contact_phone}
                                onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                className={errors.emergency_contact_phone ? 'border-destructive' : ''}
                            />
                            {errors.emergency_contact_phone && <p className="text-sm text-destructive">{errors.emergency_contact_phone}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Internal Notes</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className={`resize-none ${errors.notes ? 'border-destructive' : ''}`}
                            rows={3}
                        />
                        {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 border-t pt-6">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => window.history.back()}
                    disabled={processing}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={processing} className="min-w-[120px]">
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            {isEdit ? 'Update Customer' : 'Create Customer'}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
