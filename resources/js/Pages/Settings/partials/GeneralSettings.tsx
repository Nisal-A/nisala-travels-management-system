import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function GeneralSettings({ settings }: { settings: Record<string, string> }) {
    const { data, setData, post, processing, errors, isDirty, reset } = useForm({
        company_name: settings.company_name || '',
        contact_phone: settings.contact_phone || '',
        email: settings.email || '',
        address: settings.address || '',
        whatsapp_number: settings.whatsapp_number || '',
        business_registration_no: settings.business_registration_no || '',
        logo: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('settings.general.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('General settings have been updated.'));
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6 relative pb-20">
            <div className="mb-6">
                <h2 className="text-lg font-semibold">{t('General Settings')}</h2>
                <p className="text-sm text-muted-foreground">{t('Update your company details and basic operational information.')}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('Company Profile')}</CardTitle>
                    <CardDescription>{t('These details will appear on customer invoices and reports.')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-1 mb-2">
                            <Label className="text-base">{t('Company Logo')}</Label>
                            <p className="text-sm text-muted-foreground">{t('Upload a square image. Recommended size: 256x256 pixels.')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {data.logo ? (
                                <img src={URL.createObjectURL(data.logo)} alt="Logo Preview" className="h-16 w-16 object-contain rounded border" />
                            ) : settings.logo_url ? (
                                <img src={settings.logo_url} alt="Current Logo" className="h-16 w-16 object-contain rounded border" />
                            ) : (
                                <div className="h-16 w-16 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">{t('No logo')}</div>
                            )}
                            <Input
                                id="logo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('logo', e.target.files ? e.target.files[0] : null)}
                                className="max-w-sm"
                            />
                        </div>
                        {errors.logo && <p className="text-sm text-destructive">{errors.logo}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="company_name">{t('Company Name')}</Label>
                            <Input
                                id="company_name"
                                value={data.company_name}
                                onChange={(e) => setData('company_name', e.target.value)}
                            />
                            {errors.company_name && <p className="text-sm text-destructive">{errors.company_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="business_registration_no">{t('Business Registration Number')}</Label>
                            <Input
                                id="business_registration_no"
                                value={data.business_registration_no}
                                onChange={(e) => setData('business_registration_no', e.target.value)}
                            />
                            {errors.business_registration_no && <p className="text-sm text-destructive">{errors.business_registration_no}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact_phone">{t('Primary Phone Number')}</Label>
                            <Input
                                id="contact_phone"
                                value={data.contact_phone}
                                onChange={(e) => setData('contact_phone', e.target.value)}
                            />
                            {errors.contact_phone && <p className="text-sm text-destructive">{errors.contact_phone}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp_number">{t('WhatsApp Number')}</Label>
                            <Input
                                id="whatsapp_number"
                                value={data.whatsapp_number}
                                onChange={(e) => setData('whatsapp_number', e.target.value)}
                            />
                            {errors.whatsapp_number && <p className="text-sm text-destructive">{errors.whatsapp_number}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('Email Address')}</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">{t('Address')}</Label>
                        <Input
                            id="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                        />
                        {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                    </div>
                </CardContent>
            </Card>

            {isDirty && (
                <div className="fixed bottom-0 left-0 right-0 md:left-64 z-40 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-t">
                    <p className="text-sm text-muted-foreground">{t('You have unsaved changes.')}</p>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={() => reset()} disabled={processing}>
                            <X className="w-4 h-4 mr-2" />
                            {t('Discard')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {t('Save changes')}
                        </Button>
                    </div>
                </div>
            )}
        </form>
    );
}
