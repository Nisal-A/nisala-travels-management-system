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
    phones?: string;
    company_phones?: string;
    website?: string;
    company_website?: string;
    email?: string;
    company_email?: string;
    registration_number?: string;
    company_registration_number?: string;
    bank_details?: string;
    company_bank_details?: string;
    logo_path?: string;
    company_logo_path?: string;
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
        company_name: initialData.company_name ?? initialData.name ?? 'Nisala Travels',
        phones: initialData.phones ?? initialData.company_phones ?? initialData.company_phone ?? initialData.phone ?? '071 9951812 and 076 1277010',
        website: initialData.website ?? initialData.company_website ?? 'www.nisalatravels.com',
        email: initialData.email ?? initialData.company_email ?? initialData.company_support_email ?? initialData.support_email ?? 'info@example.com',
        registration_number: initialData.registration_number ?? initialData.company_registration_number ?? '',
        bank_details: initialData.bank_details ?? initialData.company_bank_details ?? 'Example Bank, Example Branch, Nisala Travels, 0000000000',
        logo_path: initialData.logo_path ?? initialData.company_logo_path ?? 'public/images/nisala-travels-full-logo.png',
        company_phone: initialData.company_phone ?? initialData.phone ?? '071 9951812 and 076 1277010',
        company_whatsapp_number: initialData.company_whatsapp_number ?? initialData.whatsapp_number ?? '+94 76 127 7010',
        company_support_email: initialData.company_support_email ?? initialData.support_email ?? 'info@example.com',
        company_address: initialData.company_address ?? initialData.address ?? 'Airport Road, Hingurakgoda, Sri Lanka',
        company_office_hours: initialData.company_office_hours ?? initialData.office_hours ?? 'Mon - Sat: 8:30 AM - 5:30 PM',
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
                                These details are displayed across report exports, PDF letterheads, customer receipts, and email communications.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                    {/* Company Name & Registration Number */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
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
                                aria-invalid={!!errors.company_name}
                            />
                            {errors.company_name && (
                                <p className="text-xs text-destructive font-medium">{errors.company_name}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Legal and branding name shown on exports and letterheads.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="registration_number" className="text-sm font-semibold flex items-center gap-2">
                                Business Registration No.
                            </Label>
                            <Input
                                id="registration_number"
                                name="registration_number"
                                value={data.registration_number}
                                onChange={(e) => setData('registration_number', e.target.value)}
                                placeholder="e.g. PV00293812"
                                aria-invalid={!!errors.registration_number}
                            />
                            {errors.registration_number && (
                                <p className="text-xs text-destructive font-medium">{errors.registration_number}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Company registration number for legal letterheads.
                            </p>
                        </div>
                    </div>

                    {/* Phones and Website */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                        <div className="space-y-2">
                            <Label htmlFor="phones" className="text-sm font-semibold flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                Telephone / Hotline Numbers
                            </Label>
                            <Input
                                id="phones"
                                name="phones"
                                value={data.phones}
                                onChange={(e) => setData('phones', e.target.value)}
                                placeholder="e.g. 071 9951812 and 076 1277010"
                                aria-invalid={!!errors.phones}
                            />
                            {errors.phones && (
                                <p className="text-xs text-destructive font-medium">{errors.phones}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Contact phone numbers printed on PDF letterheads.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website" className="text-sm font-semibold flex items-center gap-2">
                                Website
                            </Label>
                            <Input
                                id="website"
                                name="website"
                                value={data.website}
                                onChange={(e) => setData('website', e.target.value)}
                                placeholder="e.g. www.nisalatravels.com"
                                aria-invalid={!!errors.website}
                            />
                            {errors.website && (
                                <p className="text-xs text-destructive font-medium">{errors.website}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Official agency domain / web address.
                            </p>
                        </div>
                    </div>

                    {/* Email and Logo Path */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                Official Email Address
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="e.g. info@example.com"
                                aria-invalid={!!errors.email}
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive font-medium">{errors.email}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Inbound official email address.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="logo_path" className="text-sm font-semibold flex items-center gap-2">
                                Logo Path
                            </Label>
                            <Input
                                id="logo_path"
                                name="logo_path"
                                value={data.logo_path}
                                onChange={(e) => setData('logo_path', e.target.value)}
                                placeholder="e.g. public/images/nisala-travels-full-logo.png"
                                aria-invalid={!!errors.logo_path}
                            />
                            {errors.logo_path && (
                                <p className="text-xs text-destructive font-medium">{errors.logo_path}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Relative or public path to the company letterhead logo.
                            </p>
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="space-y-2 max-w-4xl">
                        <Label htmlFor="bank_details" className="text-sm font-semibold flex items-center gap-2">
                            Bank Account & Remittance Details
                        </Label>
                        <Textarea
                            id="bank_details"
                            name="bank_details"
                            value={data.bank_details}
                            onChange={(e) => setData('bank_details', e.target.value)}
                            placeholder="e.g. Example Bank, Example Branch, Nisala Travels, 0000000000"
                            rows={2}
                            aria-invalid={!!errors.bank_details}
                        />
                        {errors.bank_details && (
                            <p className="text-xs text-destructive font-medium">{errors.bank_details}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Bank details included on payment instructions and financial summaries.
                        </p>
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
                            placeholder="e.g. Airport Road, Hingurakgoda, Sri Lanka"
                            rows={2}
                            aria-invalid={!!errors.company_address}
                        />
                        {errors.company_address && (
                            <p className="text-xs text-destructive font-medium">{errors.company_address}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Office address printed on reports and legal vouchers.
                        </p>
                    </div>

                    {/* Secondary Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl pt-2 border-t">
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
                        </div>

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
                        </div>
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
