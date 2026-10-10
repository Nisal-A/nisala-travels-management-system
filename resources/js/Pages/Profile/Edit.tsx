import React, { useRef, useState } from 'react';
import { Head, useForm as useInertiaForm } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { PageHeader, Card, CardHeader, CardTitle, CardContent, CardDescription, Button, Input } from '@/components/common';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, Trash2, Loader2, Save } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional().nullable(),
});

const passwordSchema = z.object({
    current_password: z.string().min(1, 'Current password is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(8, 'Please confirm your new password'),
}).refine(data => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfileEdit() {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    
    // Inertia forms for submission
    const inertiaProfile = useInertiaForm({
        name: user?.name || '',
        phone: user?.phone || '',
    });

    const inertiaPassword = useInertiaForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const inertiaAvatar = useInertiaForm({
        avatar: null as File | null,
    });

    // React Hook Form for client validation (Profile)
    const { control: profileControl, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            phone: user?.phone || '',
        },
    });

    // React Hook Form for client validation (Password)
    const { control: passwordControl, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPasswordForm } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            current_password: '',
            password: '',
            password_confirmation: '',
        },
    });

    const onSubmitProfile = (data: ProfileFormValues) => {
        inertiaProfile.setData({ name: data.name, phone: data.phone || '' });
        inertiaProfile.patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Profile updated successfully'),
            onError: (err) => {
                toast.error('Failed to update profile');
                // Server errors mapping would happen here natively via Inertia
            }
        });
    };

    const onSubmitPassword = (data: PasswordFormValues) => {
        inertiaPassword.setData({ 
            current_password: data.current_password,
            password: data.password,
            password_confirmation: data.password_confirmation
        });
        inertiaPassword.put(route('profile.password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Password changed successfully');
                resetPasswordForm();
                inertiaPassword.reset();
            },
            onError: () => toast.error('Failed to change password'),
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('File must be smaller than 2MB');
            return;
        }

        setIsUploadingAvatar(true);
        inertiaAvatar.setData('avatar', file);
        inertiaAvatar.post(route('profile.avatar.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Avatar updated successfully');
                setIsUploadingAvatar(false);
            },
            onError: () => {
                toast.error('Failed to upload avatar');
                setIsUploadingAvatar(false);
            }
        });
    };

    const handleRemoveAvatar = () => {
        setIsUploadingAvatar(true);
        inertiaAvatar.delete(route('profile.avatar.destroy'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Avatar removed successfully');
                setIsUploadingAvatar(false);
            },
            onError: () => {
                toast.error('Failed to remove avatar');
                setIsUploadingAvatar(false);
            }
        });
    };

    const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

    return (
        <AppLayout title="My Profile">
            <Head title="My Profile" />

            <div className="mb-8">
                <PageHeader title="My Profile" description="Manage your personal information and security." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Picture</CardTitle>
                            <CardDescription>JPG, PNG or WEBP. Max 2MB.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <div className="relative group">
                                <Avatar className="h-32 w-32 mb-4 border-4 border-background shadow-sm">
                                    <AvatarImage src={user?.avatar_url || ''} className="object-cover" />
                                    <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
                                </Avatar>
                                {isUploadingAvatar && (
                                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-full mb-4">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-2">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/jpeg,image/png,image/webp" 
                                    onChange={handleAvatarChange} 
                                />
                                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploadingAvatar}>
                                    <Camera className="mr-2 h-4 w-4" />
                                    Change
                                </Button>
                                {user?.avatar_url && (
                                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleRemoveAvatar} disabled={isUploadingAvatar}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your personal details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileSubmit(onSubmitProfile)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={user?.email || ''} readOnly className="bg-muted text-muted-foreground" />
                                    <p className="text-[0.8rem] text-muted-foreground">Email addresses can only be changed by a System Administrator.</p>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Controller
                                        name="name"
                                        control={profileControl}
                                        render={({ field }) => (
                                            <Input {...field} id="name" />
                                        )}
                                    />
                                    {(profileErrors.name || inertiaProfile.errors.name) && (
                                        <p className="text-sm text-destructive">{profileErrors.name?.message || inertiaProfile.errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Controller
                                        name="phone"
                                        control={profileControl}
                                        render={({ field }) => (
                                            <Input {...field} id="phone" value={field.value || ''} />
                                        )}
                                    />
                                    {(profileErrors.phone || inertiaProfile.errors.phone) && (
                                        <p className="text-sm text-destructive">{profileErrors.phone?.message || inertiaProfile.errors.phone}</p>
                                    )}
                                </div>

                                <Button type="submit" disabled={inertiaProfile.processing}>
                                    {inertiaProfile.processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current_password">Current Password</Label>
                                    <Controller
                                        name="current_password"
                                        control={passwordControl}
                                        render={({ field }) => (
                                            <Input {...field} id="current_password" type="password" />
                                        )}
                                    />
                                    {(passwordErrors.current_password || inertiaPassword.errors.current_password) && (
                                        <p className="text-sm text-destructive">{passwordErrors.current_password?.message || inertiaPassword.errors.current_password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Controller
                                        name="password"
                                        control={passwordControl}
                                        render={({ field }) => (
                                            <Input {...field} id="password" type="password" />
                                        )}
                                    />
                                    {(passwordErrors.password || inertiaPassword.errors.password) && (
                                        <p className="text-sm text-destructive">{passwordErrors.password?.message || inertiaPassword.errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                    <Controller
                                        name="password_confirmation"
                                        control={passwordControl}
                                        render={({ field }) => (
                                            <Input {...field} id="password_confirmation" type="password" />
                                        )}
                                    />
                                    {(passwordErrors.password_confirmation || inertiaPassword.errors.password_confirmation) && (
                                        <p className="text-sm text-destructive">{passwordErrors.password_confirmation?.message || inertiaPassword.errors.password_confirmation}</p>
                                    )}
                                </div>

                                <Button type="submit" disabled={inertiaPassword.processing}>
                                    {inertiaPassword.processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Update Password
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
