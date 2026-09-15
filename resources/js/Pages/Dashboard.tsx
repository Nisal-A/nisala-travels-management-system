import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { Globe, LogOut, User } from 'lucide-react';
import type { PageProps } from '@/types';
import { type FormEvent } from 'react';

/**
 * Minimal Dashboard Page — NT-004.1
 *
 * A basic authenticated-only page that displays the logged-in user's
 * information and a logout button. Serves as the redirect target after
 * login and proves the auth flow works end-to-end.
 *
 * The full dashboard UI is a separate future task.
 */
export default function Dashboard() {
    const { auth } = usePage<PageProps>().props;
    const { post, processing } = useForm({});

    function handleLogout(e: FormEvent) {
        e.preventDefault();
        post(route('logout'));
    }

    return (
        <>
            <Head title="Dashboard" />

            <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 flex flex-col items-center justify-center p-6">
                {/* Logo */}
                <div className="mb-8 flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center backdrop-blur-sm">
                        <Globe className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Dashboard
                    </h1>
                </div>

                {/* User Card */}
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2 text-lg">
                            <User className="h-4 w-4" />
                            Welcome Back
                        </CardTitle>
                        <CardDescription>
                            You are signed in as:
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col items-center gap-4">
                        {/* User Info */}
                        <div className="text-center space-y-1">
                            <p className="text-lg font-semibold text-foreground">
                                {auth.user?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {auth.user?.email}
                            </p>
                            <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400 capitalize">
                                {auth.user?.status}
                            </span>
                        </div>

                        {/* Logout */}
                        <form onSubmit={handleLogout} className="w-full">
                            <Button
                                type="submit"
                                variant="outline"
                                className="w-full"
                                disabled={processing}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                {processing ? 'Signing out…' : 'Sign Out'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="mt-8 text-xs text-neutral-600 uppercase tracking-widest">
                    NT-004.1 Auth Foundation · Authenticated
                </p>
            </main>
        </>
    );
}
