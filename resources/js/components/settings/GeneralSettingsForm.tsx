import React from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { Building2, Phone, MessageSquare, Mail, MapPin, Clock, Save, Loader2, CheckCircle2 } from 'lucide-react';

interface GeneralSettingsData {
    company_name?: string;
    name?: string;
    company_phone?: string;
    phone?: string;
    company_whatsapp_number?: string;
    whatsapp_number?: string;
    company_support_email?: string;
    support_email?: string;
    company_address?: string;
    address?: string;
    company_office_hours?: string;
    office_hours?: string;
}

interface GeneralSettingsFormProps {
    initialData: GeneralSettingsData;
}

export function GeneralSettingsForm({ initialData }: GeneralSettingsFormProps) {
    const { data, setData, put, processing, errors, recentlySuccessful, isDirty } = useForm({
        company_name: initialData.company_name ?? initialData.name ?? '',
        company_phone: initialData.company_phone ?? initialData.phone ?? '',
        company_whatsapp_number: initialData.company_whatsapp_number ?? initialData.whatsapp_number ?? '',
        company_support_email: initialData.company_support_email ?? initialData.support_email ?? '',
        company_address: initialData.company_address ?? initialData.address ?? '',
        company_office_hours: initialData.company_office_hours ?? initialData.office_hours ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('settings.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.add({
                    title: 'Settings saved',
                    description: 'Company information updated successfully.',
                    type: 'success',
                });
            },
            onError: () => {
                toast.add({
                    title: 'Error saving settings',
                    description: 'Please review the form errors and try again.',
                    type: 'error',
                });
            },
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card className="border shadow-sm">
                <CardHeader className="pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Company Profile & Contact Information</CardTitle>
                            <CardDescription>
                                These details are displayed across customer receipts, email notifications, and public communications.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                    {/* Company Name */}
                    <div className="space-y-2">
                        <Label htmlFor="company_name" className="text-sm font-semibold flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            Company Name
                        </Label>
                        <Input
                            id="company_name"
                            name="company_name"
                            value={data.company_name}
                            onChange={(e) => setData('company_name', e.target.value)}
                            placeholder="e.g. Nisala Travels"
                            className="max-w-xl"
                            aria-invalid={!!errors.company_name}
                        />
                        {errors.company_name && (
                            <p className="text-xs text-destructive font-medium">{errors.company_name}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Legal and branding name of your agency.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                        {/* Phone Number */}
                        <div className="space-y-2">
                            <Label htmlFor="company_phone" className="text-sm font-semibold flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                Phone Number
                            </Label>
                            <Input
                                id="company_phone"
                                name="company_phone"
                                value={data.company_phone}
                                onChange={(e) => setData('company_phone', e.target.value)}
                                placeholder="e.g. +94 71 995 1812"
                                aria-invalid={!!errors.company_phone}
                            />
                            {errors.company_phone && (
                                <p className="text-xs text-destructive font-medium">{errors.company_phone}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Main office telephone or hotline.
                            </p>
                        </div>

                        {/* WhatsApp Number */}
                        <div className="space-y-2">
                            <Label htmlFor="company_whatsapp_number" className="text-sm font-semibold flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-500" />
                                WhatsApp Number
                            </Label>
                            <Input
                                id="company_whatsapp_number"
                                name="company_whatsapp_number"
                                value={data.company_whatsapp_number}
                                onChange={(e) => setData('company_whatsapp_number', e.target.value)}
                                placeholder="e.g. +94 76 127 7010"
                                aria-invalid={!!errors.company_whatsapp_number}
                            />
                            {errors.company_whatsapp_number && (
                                <p className="text-xs text-destructive font-medium">{errors.company_whatsapp_number}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Customer support WhatsApp line.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                        {/* Support Email */}
                        <div className="space-y-2">
                            <Label htmlFor="company_support_email" className="text-sm font-semibold flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                Support Email
                            </Label>
                            <Input
                                id="company_support_email"
                                name="company_support_email"
                                type="email"
                                value={data.company_support_email}
                                onChange={(e) => setData('company_support_email', e.target.value)}
                                placeholder="e.g. support@nisalatravels.com"
                                aria-invalid={!!errors.company_support_email}
                            />
                            {errors.company_support_email && (
                                <p className="text-xs text-destructive font-medium">{errors.company_support_email}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Inbound customer support and inquiry inbox.
                            </p>
                        </div>

                        {/* Office Hours */}
                        <div className="space-y-2">
                            <Label htmlFor="company_office_hours" className="text-sm font-semibold flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                Office Hours
                            </Label>
                            <Input
                                id="company_office_hours"
                                name="company_office_hours"
                                value={data.company_office_hours}
                                onChange={(e) => setData('company_office_hours', e.target.value)}
                                placeholder="e.g. Mon - Sat: 8:30 AM - 5:30 PM"
                                aria-invalid={!!errors.company_office_hours}
                            />
                            {errors.company_office_hours && (
                                <p className="text-xs text-destructive font-medium">{errors.company_office_hours}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Operating hours shown to travelers.
                            </p>
                        </div>
                    </div>

                    {/* Physical Address */}
                    <div className="space-y-2 max-w-4xl">
                        <Label htmlFor="company_address" className="text-sm font-semibold flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            Physical Address
                        </Label>
                        <Textarea
                            id="company_address"
                            name="company_address"
                            value={data.company_address}
                            onChange={(e) => setData('company_address', e.target.value)}
                            placeholder="e.g. Airport road, Hingurakgoda, Sri Lanka"
                            rows={3}
                            aria-invalid={!!errors.company_address}
                        />
                        {errors.company_address && (
                            <p className="text-xs text-destructive font-medium">{errors.company_address}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Office address printed on booking vouchers and legal receipts.
                        </p>
                    </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t bg-muted/20 px-6 py-4">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        {recentlySuccessful ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Changes saved to database
                            </span>
                        ) : isDirty ? (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                                Unsaved changes
                            </span>
                        ) : (
                            <span>All changes saved</span>
                        )}
                    </div>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="gap-2 shadow-sm"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
