import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />

            <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-800 flex items-center justify-center p-6">
                <div className="text-center max-w-2xl">
                    {/* Logo / Icon */}
                    <div className="mb-8 flex justify-center">
                        <div className="h-20 w-20 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center backdrop-blur-sm">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 text-indigo-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Heading */}
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
                        Nisala Travels
                    </h1>
                    <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                        Centralized travel agency management system — customers, bookings, tours, and more.
                    </p>

                    {/* Stack badges */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {[
                            { label: 'Laravel 12', color: 'from-red-500/20 to-orange-500/20 border-red-500/30 text-red-300' },
                            { label: 'React 19', color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300' },
                            { label: 'Inertia.js', color: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-300' },
                            { label: 'Tailwind v4', color: 'from-teal-500/20 to-emerald-500/20 border-teal-500/30 text-teal-300' },
                            { label: 'TypeScript', color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-300' },
                        ].map((badge) => (
                            <span
                                key={badge.label}
                                className={`px-4 py-1.5 text-sm font-medium rounded-full border bg-gradient-to-r backdrop-blur-sm ${badge.color}`}
                            >
                                {badge.label}
                            </span>
                        ))}
                    </div>

                    {/* Foundation note */}
                    <p className="mt-10 text-xs text-slate-600 uppercase tracking-widest">
                        NT-001 Foundation · Ready
                    </p>
                </div>
            </main>
        </>
    );
}
