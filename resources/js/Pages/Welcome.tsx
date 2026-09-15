import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Globe,
    Plane,
    Users,
    ShieldCheck,
    ArrowRight,
} from 'lucide-react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />

            <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 flex flex-col items-center justify-center p-6 gap-12">
                {/* ─── Hero ─── */}
                <div className="text-center max-w-2xl">
                    <div className="mb-8 flex justify-center">
                        <div className="h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center backdrop-blur-sm">
                            <Globe className="h-10 w-10 text-primary" />
                        </div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
                        Nisala Travels
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                        Centralized travel agency management system — customers,
                        bookings, tours, and more.
                    </p>

                    {/* Stack badges */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                        {[
                            'Laravel 12',
                            'React 19',
                            'Inertia.js',
                            'Tailwind v4',
                            'shadcn/ui',
                            'TypeScript',
                        ].map((label) => (
                            <span
                                key={label}
                                className="px-3 py-1 text-xs font-medium rounded-full border border-border bg-card/50 text-muted-foreground backdrop-blur-sm"
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ─── Component Showcase (NT-002 Acceptance) ─── */}
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: Buttons Showcase */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plane className="h-4 w-4" />
                                Button Variants
                            </CardTitle>
                            <CardDescription>
                                All shadcn/ui button variants working with
                                Tailwind v4.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <div className="flex flex-wrap gap-2">
                                <Button>Default</Button>
                                <Button variant="secondary">Secondary</Button>
                                <Button variant="outline">Outline</Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button variant="ghost">Ghost</Button>
                                <Button variant="destructive">
                                    Destructive
                                </Button>
                                <Button variant="link">Link</Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button size="sm">Small</Button>
                                <Button size="default">Default</Button>
                                <Button size="lg">Large</Button>
                            </div>
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground">
                            6 variants · 4 sizes
                        </CardFooter>
                    </Card>

                    {/* Card 2: Form Elements */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Form Inputs
                            </CardTitle>
                            <CardDescription>
                                Input and Label components for forms.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="demo-email">Email</Label>
                                <Input
                                    id="demo-email"
                                    type="email"
                                    placeholder="admin@nisalatravels.lk"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="demo-password">Password</Label>
                                <Input
                                    id="demo-password"
                                    type="password"
                                    placeholder="••••••••"
                                />
                            </div>
                            <Button className="w-full">
                                Sign In
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground">
                            Ready for Phase 2 Auth
                        </CardFooter>
                    </Card>

                    {/* Card 3: System Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                System Status
                            </CardTitle>
                            <CardDescription>
                                Foundation verification checklist.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2.5 text-sm">
                                {[
                                    {
                                        label: 'NT-001 Foundation',
                                        done: true,
                                    },
                                    {
                                        label: 'NT-002 UI Components',
                                        done: true,
                                    },
                                    {
                                        label: 'shadcn/ui Button',
                                        done: true,
                                    },
                                    { label: 'shadcn/ui Card', done: true },
                                    { label: 'shadcn/ui Input', done: true },
                                    { label: 'shadcn/ui Table', done: true },
                                    { label: 'shadcn/ui Label', done: true },
                                    {
                                        label: 'Tailwind v4 CSS Vars',
                                        done: true,
                                    },
                                ].map((item) => (
                                    <li
                                        key={item.label}
                                        className="flex items-center gap-2"
                                    >
                                        <span
                                            className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                                                item.done
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            {item.done ? '✓' : '○'}
                                        </span>
                                        <span
                                            className={
                                                item.done
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground'
                                            }
                                        >
                                            {item.label}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground">
                            All systems operational
                        </CardFooter>
                    </Card>
                </div>

                {/* Footer */}
                <p className="text-xs text-neutral-600 uppercase tracking-widest">
                    NT-002 UI System · Ready
                </p>
            </main>
        </>
    );
}
