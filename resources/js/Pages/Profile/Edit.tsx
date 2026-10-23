import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toaster, toast } from '@/components/ui/toast';
import { useTheme } from '@/components/theme-provider';
import {
    User,
    Phone,
    Mail,
    Shield,
    Lock,
    KeyRound,
    Sun,
    Moon,
    Laptop,
    Smartphone,
    Monitor,
    LogOut,
    CheckCircle2,
    Loader2,
    Save,
    AlertCircle,
    Info,
} from 'lucide-react';

interface UserProps {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string;
}

interface SessionItem {
    id: string;
    ip_address: string;
    is_current_device: boolean;
    agent: {
        is_desktop: boolean;
        platform: string;
        browser: string;
    };
    last_active: string;
}

interface ProfileEditProps {
    user: UserProps;
    sessions: SessionItem[];
}

export default function ProfileEdit({ user, sessions }: ProfileEditProps) {
    const { theme, setTheme } = useTheme();
    const [loggingOutSessions, setLoggingOutSessions] = useState(false);

    // 1. Profile Details Form
    const profileForm = useForm({
        name: user.name || '',
        phone: user.phone || '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.add({
                    title: 'Profile updated',
                    description: 'Your profile details have been saved.',
                    type: 'success',
                });
            },
            onError: () => {
                toast.add({
                    title: 'Error updating profile',
                    description: 'Please review the form errors and try again.',
                    type: 'error',
                });
            },
        });
    };

    // 2. Change Password Form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put(route('profile.password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                toast.add({
                    title: 'Password updated',
                    description: 'Your password has been changed successfully.',
                    type: 'success',
                });
            },
            onError: () => {
                toast.add({
                    title: 'Error updating password',
                    description: 'Please check your current password and try again.',
                    type: 'error',
                });
            },
        });
    };

    // 3. Other Browser Sessions Logout
    const handleLogoutOtherSessions = () => {
        setLoggingOutSessions(true);
        router.delete(route('profile.sessions.destroy'), {
            preserveScroll: true,
            onSuccess: () => {
                setLoggingOutSessions(false);
                toast.add({
                    title: 'Sessions signed out',
                    description: 'All other browser sessions have been logged out.',
                    type: 'success',
                });
            },
            onError: () => {
                setLoggingOutSessions(false);
                toast.add({
                    title: 'Failed to sign out sessions',
                    description: 'An error occurred while signing out other sessions.',
                    type: 'error',
                });
            },
        });
    };

    const formatRoleName = (role: string) => {
        return role.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    };

    return (
        <AppLayout
            title="My Profile"
            breadcrumbs={[
                { label: 'Dashboard', href: '/admin' },
                { label: 'My Profile' },
            ]}
        >
            <Head title="My Profile" />

            <Toaster />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="border-b pb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                My Profile
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Manage your personal account details, password credentials, color theme, and active login sessions.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 1. Profile Details Card */}
                <form onSubmit={handleProfileSubmit}>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Profile Details</CardTitle>
                                    <CardDescription>
                                        Update your display name and contact phone number.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name (Editable) */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        Full Name
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={profileForm.data.name}
                                        onChange={(e) => profileForm.setData('name', e.target.value)}
                                        placeholder="Your full name"
                                        aria-invalid={!!profileForm.errors.name}
                                    />
                                    {profileForm.errors.name && (
                                        <p className="text-xs text-destructive font-medium">{profileForm.errors.name}</p>
                                    )}
                                </div>

                                {/* Phone (Editable) */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={profileForm.data.phone}
                                        onChange={(e) => profileForm.setData('phone', e.target.value)}
                                        placeholder="e.g. +94 77 123 4567"
                                        aria-invalid={!!profileForm.errors.phone}
                                    />
                                    {profileForm.errors.phone && (
                                        <p className="text-xs text-destructive font-medium">{profileForm.errors.phone}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                {/* Email (Read-Only) */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        Email Address (Read-only)
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        value={user.email}
                                        disabled
                                        readOnly
                                        className="bg-muted cursor-not-allowed opacity-80"
                                    />
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Info className="h-3.5 w-3.5 shrink-0" />
                                        Email cannot be changed here. Contact a super administrator for address changes.
                                    </p>
                                </div>

                                {/* Role (Read-Only) */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        Assigned Role (Read-only)
                                    </Label>
                                    <div className="h-9 px-3 py-1.5 rounded-md border bg-muted flex items-center justify-between">
                                        <span className="text-sm font-medium text-foreground">
                                            {formatRoleName(user.role)}
                                        </span>
                                        <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold">
                                            {user.role}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        System permissions are automatically determined by your assigned role.
                                    </p>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex items-center justify-between border-t bg-muted/20 px-6 py-4">
                            <span className="text-xs text-muted-foreground">
                                {profileForm.recentlySuccessful && (
                                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Profile saved
                                    </span>
                                )}
                            </span>
                            <Button
                                type="submit"
                                disabled={profileForm.processing}
                                className="gap-2 shadow-sm"
                            >
                                {profileForm.processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Save Profile Details
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>

                {/* 2. Change Password Card */}
                <form onSubmit={handlePasswordSubmit}>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                                    <KeyRound className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Change Password</CardTitle>
                                    <CardDescription>
                                        Ensure your account is protected with a secure and strong password.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6 pt-6">
                            {/* Strength Rule Notice */}
                            <div className="rounded-xl border bg-muted/40 p-4 text-xs text-muted-foreground flex items-start gap-2.5">
                                <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold text-foreground">Password Security Rule: </span>
                                    <span>Must be at least 8 characters long. We recommend including a mix of letters, numbers, and special symbols.</span>
                                </div>
                            </div>

                            <div className="space-y-4 max-w-xl">
                                {/* Current Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="current_password" className="text-sm font-semibold">
                                        Current Password
                                    </Label>
                                    <Input
                                        id="current_password"
                                        name="current_password"
                                        type="password"
                                        value={passwordForm.data.current_password}
                                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        aria-invalid={!!passwordForm.errors.current_password}
                                    />
                                    {passwordForm.errors.current_password && (
                                        <p className="text-xs text-destructive font-medium">{passwordForm.errors.current_password}</p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-semibold">
                                        New Password
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={passwordForm.data.password}
                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                        placeholder="Minimum 8 characters"
                                        autoComplete="new-password"
                                        aria-invalid={!!passwordForm.errors.password}
                                    />
                                    {passwordForm.errors.password && (
                                        <p className="text-xs text-destructive font-medium">{passwordForm.errors.password}</p>
                                    )}
                                </div>

                                {/* Confirm New Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="text-sm font-semibold">
                                        Confirm New Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                        placeholder="Repeat new password"
                                        autoComplete="new-password"
                                        aria-invalid={!!passwordForm.errors.password_confirmation}
                                    />
                                    {passwordForm.errors.password_confirmation && (
                                        <p className="text-xs text-destructive font-medium">{passwordForm.errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex items-center justify-between border-t bg-muted/20 px-6 py-4">
                            <span className="text-xs text-muted-foreground">
                                {passwordForm.recentlySuccessful && (
                                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Password updated successfully
                                    </span>
                                )}
                            </span>
                            <Button
                                type="submit"
                                disabled={passwordForm.processing}
                                className="gap-2 shadow-sm"
                            >
                                {passwordForm.processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4" />
                                        Update Password
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>

                {/* 3. Appearance Card */}
                <Card className="border shadow-sm">
                    <CardHeader className="pb-4 border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                                <Sun className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Appearance & Theme</CardTitle>
                                <CardDescription>
                                    Customize how the application looks on your device.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Light Mode */}
                            <button
                                type="button"
                                onClick={() => {
                                    setTheme('light');
                                    toast.add({ title: 'Theme updated', description: 'Appearance set to Light mode.' });
                                }}
                                className={`flex flex-col items-center gap-3 p-4 rounded-xl border text-center transition-all ${
                                    theme === 'light'
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 text-foreground font-semibold shadow-sm'
                                        : 'border-border hover:border-foreground/30 text-muted-foreground'
                                }`}
                            >
                                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                                    <Sun className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">Light</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">Bright clean interface</div>
                                </div>
                            </button>

                            {/* Dark Mode */}
                            <button
                                type="button"
                                onClick={() => {
                                    setTheme('dark');
                                    toast.add({ title: 'Theme updated', description: 'Appearance set to Dark mode.' });
                                }}
                                className={`flex flex-col items-center gap-3 p-4 rounded-xl border text-center transition-all ${
                                    theme === 'dark'
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 text-foreground font-semibold shadow-sm'
                                        : 'border-border hover:border-foreground/30 text-muted-foreground'
                                }`}
                            >
                                <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                                    <Moon className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">Dark</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">Easy on the eyes</div>
                                </div>
                            </button>

                            {/* System Mode */}
                            <button
                                type="button"
                                onClick={() => {
                                    setTheme('system');
                                    toast.add({ title: 'Theme updated', description: 'Appearance set to System preference.' });
                                }}
                                className={`flex flex-col items-center gap-3 p-4 rounded-xl border text-center transition-all ${
                                    theme === 'system'
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 text-foreground font-semibold shadow-sm'
                                        : 'border-border hover:border-foreground/30 text-muted-foreground'
                                }`}
                            >
                                <div className="p-3 rounded-full bg-muted text-foreground">
                                    <Laptop className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">System</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">Sync with OS settings</div>
                                </div>
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Browser Sessions Card */}
                <Card className="border shadow-sm">
                    <CardHeader className="pb-4 border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                                <Monitor className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Browser Sessions</CardTitle>
                                <CardDescription>
                                    View and manage active login sessions across your devices.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-6">
                        <p className="text-sm text-muted-foreground">
                            If you suspect unauthorized activity or have logged in from a shared computer, you can log out of all other browsers with a single click.
                        </p>

                        {sessions.length > 0 ? (
                            <div className="space-y-3 pt-2">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="flex items-center justify-between p-3.5 rounded-xl border bg-card"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                                                {session.agent.is_desktop ? (
                                                    <Monitor className="h-5 w-5" />
                                                ) : (
                                                    <Smartphone className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium flex items-center gap-2">
                                                    <span>
                                                        {session.agent.platform || 'Unknown OS'} - {session.agent.browser || 'Unknown Browser'}
                                                    </span>
                                                    {session.is_current_device && (
                                                        <Badge variant="outline" className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300">
                                                            This device
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {session.ip_address} • {session.is_current_device ? 'Active now' : `Last active ${session.last_active}`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl border bg-muted/20 text-xs text-muted-foreground">
                                Active session tracking is managed via current browser cookies.
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex items-center justify-between border-t bg-muted/20 px-6 py-4">
                        <span className="text-xs text-muted-foreground">
                            Your current session will remain active
                        </span>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleLogoutOtherSessions}
                            disabled={loggingOutSessions}
                            className="gap-2 shadow-sm"
                        >
                            {loggingOutSessions ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Signing out…
                                </>
                            ) : (
                                <>
                                    <LogOut className="h-4 w-4" />
                                    Sign out of other browsers
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}
