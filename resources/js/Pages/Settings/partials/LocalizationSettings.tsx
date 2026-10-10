import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LocalizationSettings({ settings }: { settings: Record<string, string> }) {
    
    const { data, setData, put, processing, errors, isDirty, reset } = useForm({
        language: settings.language || 'en',
        currency: settings.currency || 'LKR',
        date_format: settings.date_format || 'Y-m-d',
        timezone: settings.timezone || 'Asia/Colombo',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('settings.localization.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('Localization settings have been updated.'));
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6 relative pb-20">
            <div className="mb-6">
                <h2 className="text-lg font-semibold">{t('Localization')}</h2>
                <p className="text-sm text-muted-foreground">{t('Configure language, currency, and regional formats for the system.')}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('Regional Formats')}</CardTitle>
                    <CardDescription>{t('Set the default presentation of dates and money.')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-base">{t('System Language')}</Label>
                            <p className="text-sm text-muted-foreground pb-2">{t('Select the primary language used across the dashboard.')}</p>
                            <Select value={data.language} onValueChange={(val) => setData('language', val as string)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('Select Language')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="si" disabled>Sinhala (Coming soon: translation in progress)</SelectItem>
                                    <SelectItem value="ta" disabled>Tamil (Coming soon: translation in progress)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.language && <p className="text-sm text-destructive">{errors.language}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-base">{t('Default Currency')}</Label>
                            <p className="text-sm text-muted-foreground pb-2">{t('Used for all pricing and revenue calculations.')}</p>
                            <Select value={data.currency} onValueChange={(val) => setData('currency', val as string)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('Select Currency')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LKR">LKR - Sri Lankan Rupee</SelectItem>
                                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.currency && <p className="text-sm text-destructive">{errors.currency}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-base">{t('Date Format')}</Label>
                            <p className="text-sm text-muted-foreground pb-2">{t('Choose how dates are displayed in reports and tables.')}</p>
                            <Select value={data.date_format} onValueChange={(val) => setData('date_format', val as string)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('Select Date Format')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Y-m-d">YYYY-MM-DD</SelectItem>
                                    <SelectItem value="d/m/Y">DD/MM/YYYY</SelectItem>
                                    <SelectItem value="m/d/Y">MM/DD/YYYY</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.date_format && <p className="text-sm text-destructive">{errors.date_format}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-base">{t('Timezone')}</Label>
                            <p className="text-sm text-muted-foreground pb-2">{t('The time base used for all bookings and activity logs.')}</p>
                            <Select value={data.timezone} onValueChange={(val) => setData('timezone', val as string)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('Select Timezone')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Asia/Colombo">Asia/Colombo (GMT+5:30)</SelectItem>
                                    <SelectItem value="UTC">UTC</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.timezone && <p className="text-sm text-destructive">{errors.timezone}</p>}
                        </div>
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
