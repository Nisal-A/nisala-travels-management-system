import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, LogIn, AlertCircle } from 'lucide-react';
import { type FormEvent } from 'react';
import { Logo } from '@/Components/brand/Logo';

/**
 * Minimal Login Page — NT-004.1
 *
 * A functional login form that validates credentials via the backend.
 * This is intentionally minimal; the polished UI is scoped for NT-004.2.
 */
export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    }

    return (
        <>
            <Head title="Login" />

            <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 flex flex-col items-center justify-center p-6">
                {/* Logo / Branding */}
                <div className="mb-8 flex flex-col items-center gap-4">
                    <Logo variant="full" size="xl" theme="dark" isDecorative />
                    <p className="text-sm text-muted-foreground">Management System</p>
                </div>

                {/* Login Card */}
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2 text-lg">
                            <LogIn className="h-4 w-4" />
                            Sign In
                        </CardTitle>
                        <CardDescription>Enter your credentials to access the system.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {/* Global Error */}
                            {errors.email && (
                                <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>{errors.email}</span>
                                </div>
                            )}

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@nisalatravels.lk"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoFocus
                                    autoComplete="email"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                                {errors.password && (
                                    <p className="text-sm font-medium text-destructive">{errors.password}</p>
                                )}
                            </div>

                            {/* Submit */}
                            <Button type="submit" className="w-full mt-2" disabled={processing}>
                                {processing ? 'Signing in…' : 'Sign In'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="mt-8 text-xs text-neutral-600 uppercase tracking-widest">NT-004.1 Auth Foundation</p>
            </main>
        </>
    );
}
