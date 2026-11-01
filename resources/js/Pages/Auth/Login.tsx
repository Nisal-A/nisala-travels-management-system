import { useState, type FormEvent } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    Loader2,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import { siteContent } from '@/content/site';
import type { PageProps } from '@/types';

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

export default function Login({ status, canResetPassword = false }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const page = usePage<PageProps>();
    const flash = page.props.flash;

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    }

    const currentYear = new Date().getFullYear();

    const isEmailFieldValidation = Boolean(
        errors.email && (
            errors.email.toLowerCase().includes('required') ||
            errors.email.toLowerCase().includes('must be a valid') ||
            errors.email.toLowerCase().includes('email format')
        )
    );

    const generalErrorMessage = flash?.error || (!isEmailFieldValidation ? errors.email : undefined);
    const statusMessage = status || flash?.success;

    return (
        <>
            <Head title="Sign in | Nisala Travels">
                <title>Sign in | Nisala Travels</title>
                <meta name="robots" content="noindex" />
            </Head>

            <div className="relative min-h-svh flex flex-col justify-between font-sans selection:bg-primary/20 selection:text-primary">
                {/* Background Photo & Dark Gradient Overlay */}
                <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
                    <img
                        src="/images/hero/hero-poster.jpg"
                        alt=""
                        className="h-full w-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-background/85 backdrop-blur-[2px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/90" />
                </div>

                {/* Top Desktop Header with Logo */}
                <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex items-center justify-between">
                    <div className="hidden sm:block">
                        <Link
                            href="/"
                            className="inline-block transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
                        >
                            <img
                                src="/images/nisala-travels-logo.png"
                                alt="Nisala Travels"
                                className="h-10 sm:h-12 w-auto"
                            />
                        </Link>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-6 w-full">
                    <div className="w-full max-w-md mx-auto flex flex-col">
                        {/* Mobile Centered Logo */}
                        <div className="sm:hidden mb-6 flex justify-center">
                            <Link
                                href="/"
                                className="inline-block transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
                            >
                                <img
                                    src="/images/nisala-travels-logo.png"
                                    alt="Nisala Travels"
                                    className="h-10 w-auto"
                                />
                            </Link>
                        </div>

                        {/* Frosted Card */}
                        <Card className="w-full bg-card/90 backdrop-blur-md border border-border/80 shadow-xl rounded-2xl">
                            <CardHeader className="text-center pb-2 pt-8 px-6 sm:px-8 space-y-1.5">
                                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                                    Nisala Travels Management System
                                </p>
                                <CardTitle className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                    Welcome back
                                </CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">
                                    Sign in to your Nisala Travels account.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="px-6 sm:px-8 pb-8 pt-4">
                                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                                    {/* Status Flash Message */}
                                    {statusMessage && (
                                        <div
                                            role="alert"
                                            aria-live="polite"
                                            className="flex items-start gap-2.5 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success"
                                        >
                                            <CheckCircle2 className="size-4 mt-0.5 shrink-0" aria-hidden="true" />
                                            <span className="leading-relaxed">{statusMessage}</span>
                                        </div>
                                    )}

                                    {/* General Error Alert */}
                                    {generalErrorMessage && (
                                        <div
                                            id="general-error"
                                            role="alert"
                                            aria-live="polite"
                                            className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                                        >
                                            <AlertCircle className="size-4 mt-0.5 shrink-0" aria-hidden="true" />
                                            <span className="leading-relaxed">{generalErrorMessage}</span>
                                        </div>
                                    )}

                                    {/* Email Field */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="email" className="text-sm font-medium text-foreground">
                                            Email address
                                        </Label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                                <Mail className="size-4" aria-hidden="true" />
                                            </div>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                autoFocus
                                                required
                                                autoComplete="username"
                                                disabled={processing}
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="name@example.com"
                                                aria-invalid={!!errors.email}
                                                aria-describedby={
                                                    isEmailFieldValidation
                                                        ? 'email-error'
                                                        : generalErrorMessage
                                                            ? 'general-error'
                                                            : undefined
                                                }
                                                className="pl-9 h-10 border-input bg-background/50 focus-visible:ring-ring"
                                            />
                                        </div>
                                        {isEmailFieldValidation && (
                                            <p id="email-error" className="text-xs text-destructive mt-1">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                                Password
                                            </Label>
                                            {canResetPassword && (
                                                <Link
                                                    href={route('password.request')}
                                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                                                >
                                                    Forgot password?
                                                </Link>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                                <Lock className="size-4" aria-hidden="true" />
                                            </div>
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                autoComplete="current-password"
                                                disabled={processing}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="••••••••"
                                                aria-invalid={!!errors.password}
                                                aria-describedby={errors.password ? 'password-error' : undefined}
                                                className="pl-9 pr-10 h-10 border-input bg-background/50 focus-visible:ring-ring"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                aria-pressed={showPassword}
                                                disabled={processing}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-lg disabled:pointer-events-none"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="size-4" aria-hidden="true" />
                                                ) : (
                                                    <Eye className="size-4" aria-hidden="true" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p id="password-error" className="text-xs text-destructive mt-1">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    {/* Remember Me */}
                                    <div className="flex items-center gap-2.5 pt-0.5">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            checked={data.remember}
                                            disabled={processing}
                                            onCheckedChange={(checked) => setData('remember', Boolean(checked))}
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="text-sm font-normal text-muted-foreground cursor-pointer select-none"
                                        >
                                            Remember me
                                        </Label>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full h-10 gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm motion-reduce:transition-none cursor-pointer"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                                                <span>Signing in...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Sign in</span>
                                                <ArrowRight className="size-4" aria-hidden="true" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Back to Website */}
                        <div className="mt-6 text-center">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1"
                            >
                                <ArrowLeft className="size-4" aria-hidden="true" />
                                <span>Back to website</span>
                            </Link>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="w-full py-6 px-4 text-center text-xs text-muted-foreground">
                    <p>
                        &copy; {currentYear} {siteContent.company.name} &bull; {siteContent.contact.email}
                    </p>
                </footer>
            </div>
        </>
    );
}
