import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowLeft } from 'lucide-react';
import { Supplier } from '@/types';

interface EditSupplierProps {
    supplier: Supplier;
    types: { value: string; label: string }[];
}

export default function EditSupplier({ supplier, types }: EditSupplierProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: supplier.name || '',
        type: supplier.type || 'hotel',
        contact_name: supplier.contact_name || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        default_currency: supplier.default_currency || 'LKR',
        is_active: Boolean(supplier.is_active),
        notes: supplier.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('suppliers.update', supplier.id));
    };

    return (
        <AppLayout
            title={`Edit ${supplier.name}`}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Suppliers', href: route('suppliers.index') },
                { label: `Edit ${supplier.name}` },
            ]}
        >
            <Head title={`Edit ${supplier.name}`} />
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <PageHeader
                        title={`Edit Supplier (${supplier.supplier_code})`}
                        description="Update vendor information, contact credentials, or operational status."
                    />
                    <Button variant="ghost" asChild>
                        <Link href={route('suppliers.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Supplier Details</CardTitle>
                            <CardDescription>
                                Modify provider settings below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Supplier Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">
                                        Supplier Type <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(val) => setData('type', val as any)}
                                    >
                                        <SelectTrigger id="type" className="w-full">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {types.map((t) => (
                                                <SelectItem key={t.value} value={t.value}>
                                                    {t.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_name">Contact Person</Label>
                                    <Input
                                        id="contact_name"
                                        value={data.contact_name}
                                        onChange={(e) => setData('contact_name', e.target.value)}
                                    />
                                    {errors.contact_name && (
                                        <p className="text-xs text-destructive">{errors.contact_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <div className="space-y-2">
                                    <Label htmlFor="default_currency">
                                        Default Invoicing Currency <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.default_currency}
                                        onValueChange={(val) => setData('default_currency', val)}
                                    >
                                        <SelectTrigger id="default_currency" className="w-full">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LKR">LKR — Sri Lankan Rupee</SelectItem>
                                            <SelectItem value="USD">USD — US Dollar</SelectItem>
                                            <SelectItem value="INR">INR — Indian Rupee</SelectItem>
                                            <SelectItem value="THB">THB — Thai Baht</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.default_currency && (
                                        <p className="text-xs text-destructive">{errors.default_currency}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-3 mt-4 md:mt-0">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_active" className="cursor-pointer">Active Status</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Active suppliers can be selected on tour cost lines.
                                        </p>
                                    </div>
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes & Bank Information</Label>
                                <Textarea
                                    id="notes"
                                    rows={3}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                                {errors.notes && <p className="text-xs text-destructive">{errors.notes}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" asChild>
                                    <Link href={route('suppliers.index')}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : 'Update Supplier'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
