import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';
import { Save, X, Sun, Moon, Laptop, LayoutGrid, LayoutList } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme-provider';

export default function AppearanceSettings({ user }: { user: any }) {
    const { setTheme } = useTheme();
    const preferences = user.preferences || {};
    
    const { data, setData, put, processing, isDirty, reset } = useForm({
        theme: preferences.theme || 'system',
        density: preferences.density || 'comfortable',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('settings.appearance.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setTheme(data.theme);
                toast.success(t('Appearance updated. Your preference has been saved.'));
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6 relative pb-20">
            <div className="mb-6">
                <h2 className="text-lg font-semibold">{t('Appearance')}</h2>
                <p className="text-sm text-muted-foreground">{t('Customize how the application looks and feels on this device.')}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('Interface Theme')}</CardTitle>
                    <CardDescription>{t('Select a color scheme for the application.')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label className="text-base">{t('Theme preference')}</Label>
                            <p className="text-sm text-muted-foreground pb-2">{t('Choose light or dark mode, or sync with your system settings.')}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: 'light', label: 'Light', icon: Sun },
                                { id: 'dark', label: 'Dark', icon: Moon },
                                { id: 'system', label: 'System', icon: Laptop },
                            ].map((theme) => {
                                const Icon = theme.icon;
                                return (
                                    <div
                                        key={theme.id}
                                        onClick={() => setData('theme', theme.id)}
                                        className={`cursor-pointer flex flex-col items-center justify-center p-6 border rounded-lg transition-all ${
                                            data.theme === theme.id ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'hover:border-primary/50'
                                        }`}
                                    >
                                        <Icon className="w-8 h-8 mb-2" />
                                        <span className="font-medium">{t(theme.label)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label className="text-base">{t('Display density')}</Label>
                            <p className="text-sm text-muted-foreground pb-2">{t('Adjust the spacing between elements on the screen.')}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { id: 'comfortable', label: 'Comfortable', icon: LayoutGrid },
                                { id: 'compact', label: 'Compact', icon: LayoutList },
                            ].map((density) => {
                                const Icon = density.icon;
                                return (
                                    <div
                                        key={density.id}
                                        onClick={() => setData('density', density.id)}
                                        className={`cursor-pointer flex items-center p-4 border rounded-lg transition-all ${
                                            data.density === density.id ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'hover:border-primary/50'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5 mr-3" />
                                        <span className="font-medium">{t(density.label)}</span>
                                    </div>
                                );
                            })}
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
