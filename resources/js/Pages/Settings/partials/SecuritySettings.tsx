import { useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';
import { Save, X, Monitor, Smartphone, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SecuritySettings({ activeSessions, user }: { activeSessions: any[], user: any }) {
    
    const { data, setData, put, processing, errors, isDirty, reset } = useForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
        session_timeout: user.preferences?.session_timeout || '120',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('settings.security.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('current_password', 'new_password', 'new_password_confirmation');
                toast.success(t('Security settings have been updated.'));
            },
        });
    };

    const logoutOtherSessions = () => {
        if (confirm(t('Are you sure you want to sign out of all other browser sessions?'))) {
            router.delete(route('settings.security.sessions.destroy'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('All other browser sessions have been logged out.'));
                },
            });
        }
    };

    return (
        <div className="space-y-6 relative pb-20">
            <div className="mb-6">
                <h2 className="text-lg font-semibold">{t('Security & Authentication')}</h2>
                <p className="text-sm text-muted-foreground">{t('Manage your password, two-factor authentication, and active devices.')}</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('Change Password')}</CardTitle>
                        <CardDescription>{t('Ensure your account is using a long, random password to stay secure.')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2 max-w-xl">
                            <Label htmlFor="current_password">{t('Current Password')}</Label>
                            <Input
                                id="current_password"
                                type="password"
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                            />
                            {errors.current_password && <p className="text-sm text-destructive">{errors.current_password}</p>}
                        </div>
                        <div className="space-y-2 max-w-xl">
                            <Label htmlFor="new_password">{t('New Password')}</Label>
                            <Input
                                id="new_password"
                                type="password"
                                value={data.new_password}
                                onChange={(e) => setData('new_password', e.target.value)}
                            />
                            {errors.new_password && <p className="text-sm text-destructive">{errors.new_password}</p>}
                        </div>
                        <div className="space-y-2 max-w-xl">
                            <Label htmlFor="new_password_confirmation">{t('Confirm Password')}</Label>
                            <Input
                                id="new_password_confirmation"
                                type="password"
                                value={data.new_password_confirmation}
                                onChange={(e) => setData('new_password_confirmation', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('Two-Factor Authentication')}</CardTitle>
                        <CardDescription>{t('Add additional security to your account using two-factor authentication.')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted p-4 rounded-lg flex items-center justify-between max-w-xl">
                            <div>
                                <h4 className="font-semibold">{t('2FA is not enabled')}</h4>
                                <p className="text-sm text-muted-foreground">{t('Enable 2FA to improve your account security. (Coming soon: infrastructure update required)')}</p>
                            </div>
                            <Button type="button" variant="outline" disabled>{t('Enable')}</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('Session Preferences')}</CardTitle>
                        <CardDescription>{t('Manage your session duration.')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-w-xl">
                            <Label className="text-base">{t('Session Timeout')}</Label>
                            <p className="text-sm text-muted-foreground pb-2">{t('You will be automatically signed out after this much inactivity.')}</p>
                            <Select value={data.session_timeout} onValueChange={(val) => setData('session_timeout', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('Select Timeout')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 {t('Minutes')}</SelectItem>
                                    <SelectItem value="30">30 {t('Minutes')}</SelectItem>
                                    <SelectItem value="60">1 {t('Hour')}</SelectItem>
                                    <SelectItem value="120">2 {t('Hours')}</SelectItem>
                                    <SelectItem value="1440">24 {t('Hours')}</SelectItem>
                                </SelectContent>
                            </Select>
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

            <Card>
                <CardHeader>
                    <CardTitle>{t('Browser Sessions')}</CardTitle>
                    <CardDescription>{t('Manage and log out your active sessions on other browsers and devices.')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {activeSessions && activeSessions.length > 0 ? (
                        <div className="space-y-4">
                            {activeSessions.map((session, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0">
                                        {session.agent.is_desktop ? (
                                            <Monitor className="w-5 h-5 text-muted-foreground" />
                                        ) : (
                                            <Smartphone className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">
                                            {session.agent.platform} - {session.agent.browser}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {session.ip_address} • {session.is_current_device ? (
                                                <span className="text-primary font-medium flex items-center gap-1 inline-flex">
                                                    <CheckCircle2 className="w-3 h-3" /> {t('This device')}
                                                </span>
                                            ) : (
                                                t('Last active') + ' ' + session.last_active
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">{t('No other active sessions found.')}</p>
                    )}
                    
                    <div className="pt-4 border-t">
                        <Button type="button" variant="destructive" onClick={logoutOtherSessions}>
                            {t('Log out other browser sessions')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
