import { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import CustomerPortalLayout from '@/components/layouts/CustomerPortalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Laptop, Smartphone, CheckCircle2, ShieldAlert, KeyRound, UserRound, MapPin, Phone } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';

const personalDetailsSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').optional().or(z.literal('')),
    whatsapp: z.string().optional().or(z.literal('')),
    address: z.string().max(1000, 'Address is too long').optional().or(z.literal('')),
    emergency_contact_name: z.string().optional().or(z.literal('')),
    emergency_contact_phone: z.string().optional().or(z.literal('')),
});

const passwordSchema = z
    .object({
        current_password: z.string().min(1, 'Current password is required'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
            .regex(/[0-9]/, 'Must contain at least one number')
            .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
        password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Passwords don't match",
        path: ['password_confirmation'],
    });

export default function ProfileEdit({ user, sessions }: any) {
    const { props } = usePage<any>();

    // Forms
    const personalForm = useForm({
        full_name: user.full_name || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        whatsapp: user.whatsapp || '',
        address: user.address || '',
        emergency_contact_name: user.emergency_contact_name || '',
        emergency_contact_phone: user.emergency_contact_phone || '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const logoutSessionsForm = useForm({
        password: '',
    });

    const [zodErrors, setZodErrors] = useState<Record<string, string>>({});
    const [passwordZodErrors, setPasswordZodErrors] = useState<Record<string, string>>({});
    const [confirmingLogout, setConfirmingLogout] = useState(false);

    const onPersonalSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        try {
            personalDetailsSchema.parse(personalForm.data);
            setZodErrors({});

            personalForm.patch(route('portal.profile.update'), {
                preserveScroll: true,
                onSuccess: () => toast.success('Profile updated successfully'),
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors: Record<string, string> = {};
                error.issues.forEach((err) => {
                    if (err.path[0]) {
                        errors[err.path[0].toString()] = err.message;
                    }
                });
                setZodErrors(errors);
            }
        }
    };

    const onPasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        try {
            passwordSchema.parse(passwordForm.data);
            setPasswordZodErrors({});

            passwordForm.put(route('portal.password.update'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Password updated successfully');
                    passwordForm.reset();
                },
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors: Record<string, string> = {};
                error.issues.forEach((err) => {
                    if (err.path[0]) {
                        errors[err.path[0].toString()] = err.message;
                    }
                });
                setPasswordZodErrors(errors);
            }
        }
    };

    const confirmLogout = () => setConfirmingLogout(true);
    const closeLogoutModal = () => {
        setConfirmingLogout(false);
        logoutSessionsForm.reset();
        logoutSessionsForm.clearErrors();
    };

    const logoutOtherBrowserSessions = (e: React.FormEvent) => {
        e.preventDefault();
        logoutSessionsForm.delete(route('portal.profile.sessions.destroy'), {
            preserveScroll: true,
            onSuccess: () => {
                closeLogoutModal();
                toast.success('Other browser sessions have been logged out.');
            },
            onFinish: () => logoutSessionsForm.reset(),
        });
    };

    // Calculate password strength
    const getPasswordStrength = (pass: string) => {
        let score = 0;
        if (!pass) return { score: 0, text: 'None', color: 'bg-muted' };
        if (pass.length > 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;

        if (score <= 1) return { score, text: 'Weak', color: 'bg-destructive' };
        if (score <= 3) return { score, text: 'Medium', color: 'bg-orange-500' };
        return { score, text: 'Strong', color: 'bg-emerald-500' };
    };

    const strength = getPasswordStrength(passwordForm.data.password);

    return (
        <CustomerPortalLayout title="Profile & Security">
            <Head title="Profile & Security" />

            <div className="max-w-4xl space-y-6">
                <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="personal" className="gap-2">
                            <UserRound className="h-4 w-4" /> Personal Details
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2">
                            <ShieldAlert className="h-4 w-4" /> Security
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>
                                    Update your contact details and communication preferences.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={onPersonalSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="full_name">Full Name</Label>
                                            <Input
                                                id="full_name"
                                                value={personalForm.data.full_name}
                                                onChange={(e) => personalForm.setData('full_name', e.target.value)}
                                            />
                                            {(zodErrors.full_name || personalForm.errors.full_name) && (
                                                <p className="text-sm text-destructive">
                                                    {zodErrors.full_name || personalForm.errors.full_name}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={personalForm.data.email}
                                                onChange={(e) => personalForm.setData('email', e.target.value)}
                                            />
                                            {(zodErrors.email || personalForm.errors.email) && (
                                                <p className="text-sm text-destructive">
                                                    {zodErrors.email || personalForm.errors.email}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    className="pl-9"
                                                    value={personalForm.data.phone}
                                                    onChange={(e) => personalForm.setData('phone', e.target.value)}
                                                />
                                            </div>
                                            {(zodErrors.phone || personalForm.errors.phone) && (
                                                <p className="text-sm text-destructive">
                                                    {zodErrors.phone || personalForm.errors.phone}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="whatsapp">WhatsApp (Optional)</Label>
                                            <Input
                                                id="whatsapp"
                                                value={personalForm.data.whatsapp}
                                                onChange={(e) => personalForm.setData('whatsapp', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Textarea
                                                id="address"
                                                className="pl-9 min-h-[100px]"
                                                value={personalForm.data.address}
                                                onChange={(e) => personalForm.setData('address', e.target.value)}
                                            />
                                        </div>
                                        {(zodErrors.address || personalForm.errors.address) && (
                                            <p className="text-sm text-destructive">
                                                {zodErrors.address || personalForm.errors.address}
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t">
                                        <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="emergency_contact_name">Contact Name</Label>
                                                <Input
                                                    id="emergency_contact_name"
                                                    value={personalForm.data.emergency_contact_name}
                                                    onChange={(e) =>
                                                        personalForm.setData('emergency_contact_name', e.target.value)
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                                                <Input
                                                    id="emergency_contact_phone"
                                                    value={personalForm.data.emergency_contact_phone}
                                                    onChange={(e) =>
                                                        personalForm.setData('emergency_contact_phone', e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-4">
                                        <Button type="submit" disabled={personalForm.processing}>
                                            {personalForm.processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent
                        value="security"
                        className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                        {/* Change Password */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <KeyRound className="h-5 w-5" /> Change Password
                                </CardTitle>
                                <CardDescription>
                                    Ensure your account is using a long, random password to stay secure.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={onPasswordSubmit} className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <Label htmlFor="current_password">Current Password</Label>
                                        <Input
                                            id="current_password"
                                            type="password"
                                            value={passwordForm.data.current_password}
                                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                        />
                                        {(passwordZodErrors.current_password ||
                                            passwordForm.errors.current_password) && (
                                            <p className="text-sm text-destructive">
                                                {passwordZodErrors.current_password ||
                                                    passwordForm.errors.current_password}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={passwordForm.data.password}
                                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                                        />

                                        {passwordForm.data.password && (
                                            <div className="flex gap-1 mt-2">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1.5 w-full rounded-full ${i <= strength.score ? strength.color : 'bg-muted'}`}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {(passwordZodErrors.password || passwordForm.errors.password) && (
                                            <p className="text-sm text-destructive">
                                                {passwordZodErrors.password || passwordForm.errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={passwordForm.data.password_confirmation}
                                            onChange={(e) =>
                                                passwordForm.setData('password_confirmation', e.target.value)
                                            }
                                        />
                                        {passwordZodErrors.password_confirmation && (
                                            <p className="text-sm text-destructive">
                                                {passwordZodErrors.password_confirmation}
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-2">
                                        <Button type="submit" disabled={passwordForm.processing}>
                                            {passwordForm.processing ? 'Updating...' : 'Update Password'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Active Sessions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Browser Sessions</CardTitle>
                                <CardDescription>
                                    Manage and log out your active sessions on other browsers and devices.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-sm text-muted-foreground">
                                    If necessary, you may log out of all of your other browser sessions across all of
                                    your devices. Some of your recent sessions are listed below; however, this list may
                                    not be exhaustive.
                                </p>

                                {sessions.length > 0 && (
                                    <div className="space-y-4">
                                        {sessions.map((session: any) => (
                                            <div key={session.id} className="flex items-center gap-4">
                                                <div>
                                                    {session.agent.is_desktop ? (
                                                        <Laptop className="h-8 w-8 text-muted-foreground" />
                                                    ) : (
                                                        <Smartphone className="h-8 w-8 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm text-foreground">
                                                        {session.agent.platform} - {session.agent.browser}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                        {session.ip_address} •
                                                        {session.is_current_device ? (
                                                            <span className="text-emerald-500 font-medium">
                                                                This device
                                                            </span>
                                                        ) : (
                                                            <span>Last active {session.last_active}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center mt-5">
                                    <Button onClick={confirmLogout}>Log Out Other Browser Sessions</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <Dialog open={confirmingLogout} onOpenChange={setConfirmingLogout}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Log Out Other Browser Sessions</DialogTitle>
                        <DialogDescription>
                            Please enter your password to confirm you would like to log out of your other browser
                            sessions across all of your devices.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={logoutOtherBrowserSessions}>
                        <div className="py-4">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={logoutSessionsForm.data.password}
                                onChange={(e) => logoutSessionsForm.setData('password', e.target.value)}
                            />
                            {logoutSessionsForm.errors.password && (
                                <p className="text-sm text-destructive mt-2">{logoutSessionsForm.errors.password}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={closeLogoutModal}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={logoutSessionsForm.processing}>
                                {logoutSessionsForm.processing ? 'Logging out...' : 'Log Out Other Browser Sessions'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </CustomerPortalLayout>
    );
}
