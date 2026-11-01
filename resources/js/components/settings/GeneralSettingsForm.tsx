import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { Building2, CheckCircle2, ImageOff } from 'lucide-react';
import { SettingsPanel, settingsInputClass, settingsLabelClass } from './SettingsPanel';

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
    const { data, setData, put, processing, errors, recentlySuccessful, isDirty, reset, clearErrors } = useForm({
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

    const handleCancel = () => {
        reset();
        clearErrors();
    };

    // Resolve the stored logo path (e.g. "public/images/logo.png") to a browser URL for the read-only tile.
    const logoUrl = (() => {
        const path = (data.logo_path ?? '').trim();
        if (!path) return '';
        if (/^https?:\/\//i.test(path)) return path;
        return '/' + path.replace(/^\/+/, '').replace(/^public\//, '');
    })();
    const [logoFailed, setLogoFailed] = useState(false);

    const field = (
        name: keyof typeof data,
        label: string,
        helper: string,
        options: { type?: string; placeholder?: string; textarea?: boolean; wide?: boolean } = {},
    ) => {
        const error = errors[name];
        const describedBy = `${name}-help${error ? ` ${name}-error` : ''}`;
        return (
            <div className={options.wide ? 'md:col-span-2' : undefined}>
                <Label htmlFor={name} className={`${settingsLabelClass} block`}>
                    {label}
                </Label>
                {options.textarea ? (
                    <Textarea
                        id={name}
                        name={name}
                        value={data[name]}
                        onChange={(e) => setData(name, e.target.value)}
                        placeholder={options.placeholder}
                        rows={3}
                        aria-invalid={!!error}
                        aria-describedby={describedBy}
                        className={settingsInputClass}
                    />
                ) : (
                    <Input
                        id={name}
                        name={name}
                        type={options.type ?? 'text'}
                        value={data[name]}
                        onChange={(e) => setData(name, e.target.value)}
                        placeholder={options.placeholder}
                        aria-invalid={!!error}
                        aria-describedby={describedBy}
                        className={settingsInputClass}
                    />
                )}
                {error && (
                    <p id={`${name}-error`} className="mt-1 text-xs font-medium text-destructive">
                        {error}
                    </p>
                )}
                <p id={`${name}-help`} className="mt-1 text-xs text-muted-foreground">
                    {helper}
                </p>
            </div>
        );
    };

    return (
        <SettingsPanel
            title="Company Profile & Contact Information"
            description="Shown on report exports, PDF letterheads, customer receipts and email communications."
            icon={Building2}
            onSubmit={handleSubmit}
            footer={{
                isDirty,
                processing,
                onCancel: handleCancel,
                status: recentlySuccessful ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                        <CheckCircle2 className="size-3.5 text-success" />
                        Changes saved
                    </span>
                ) : isDirty ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                        <span className="size-2 rounded-full bg-warning" aria-hidden="true" />
                        Unsaved changes
                    </span>
                ) : null,
            }}
        >
            {/* Logo (read-only preview of the configured logo path) */}
            <div className="flex items-center gap-4 mb-8">
                <div className="size-20 rounded-xl border bg-muted grid place-items-center overflow-hidden shrink-0">
                    {logoUrl && !logoFailed ? (
                        <img
                            src={logoUrl}
                            alt="Current company logo"
                            className="size-full object-contain p-2"
                            onError={() => setLogoFailed(true)}
                        />
                    ) : (
                        <ImageOff className="size-6 text-muted-foreground" aria-label="No logo available" />
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Company logo</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Preview of the logo used on letterheads. Change it with the Logo Path field below.
                    </p>
                </div>
            </div>

            <h3 className="text-base font-bold mb-4 text-foreground">Company details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {field('company_name', 'Company Name', 'Legal and branding name shown on exports and letterheads.', {
                    placeholder: 'e.g. Nisala Travels',
                })}
                {field('registration_number', 'Business Registration No.', 'Company registration number for legal letterheads.', {
                    placeholder: 'e.g. PV00293812',
                })}
                {field('logo_path', 'Logo Path', 'Relative or public path to the company letterhead logo.', {
                    placeholder: 'e.g. public/images/nisala-travels-full-logo.png',
                    wide: true,
                })}
                {field('bank_details', 'Bank Account & Remittance Details', 'Included on payment instructions and financial summaries.', {
                    textarea: true,
                    wide: true,
                })}
            </div>

            <div className="my-8 border-t" />

            <h3 className="text-base font-bold mb-4 text-foreground">Contact information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {field('phones', 'Telephone / Hotline Numbers', 'Contact phone numbers printed on PDF letterheads.', {
                    placeholder: 'e.g. 071 9951812 and 076 1277010',
                })}
                {field('website', 'Website', 'Official agency domain / web address.', {
                    placeholder: 'e.g. www.nisalatravels.com',
                })}
                {field('email', 'Official Email Address', 'Inbound official email address.', {
                    type: 'email',
                    placeholder: 'e.g. info@nisalatravels.com',
                })}
                {field('company_whatsapp_number', 'WhatsApp Number', 'Number customers can reach on WhatsApp.', {
                    placeholder: 'e.g. +94 76 127 7010',
                })}
                {field('company_office_hours', 'Office Hours', 'Opening hours shown to customers.', {
                    placeholder: 'e.g. Mon - Sat: 8:30 AM - 5:30 PM',
                })}
                {field('company_address', 'Physical Address', 'Office address printed on reports and legal vouchers.', {
                    textarea: true,
                    wide: true,
                })}
            </div>
        </SettingsPanel>
    );
}
