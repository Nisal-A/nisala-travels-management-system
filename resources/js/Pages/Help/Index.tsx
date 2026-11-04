import React, { useMemo, useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { PageHeader, StatusBadge } from '@/components/common';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    HELP_CATEGORIES,
    HELP_GUIDE_MODULES,
    getModuleIcon,
    type GuideCategory,
    type HelpGuideModule,
} from '@/components/help/ContextualHelpDrawer';
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Compass,
    FileSpreadsheet,
    Globe,
    Keyboard,
    Layers,
    Lock,
    RefreshCw,
    Search,
    ShieldCheck,
    Sparkles,
    X,
} from 'lucide-react';

export default function HelpIndex() {
    const { url } = usePage();

    const initialModuleFromQuery = useMemo(() => {
        const queryIndex = url.indexOf('?');
        if (queryIndex === -1) return null;
        const params = new URLSearchParams(url.slice(queryIndex + 1));
        return params.get('module');
    }, [url]);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<GuideCategory>('All Guides');
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        HELP_GUIDE_MODULES.forEach((mod) => {
            initial[mod.id] = true;
        });
        return initial;
    });
    const [activeTabByModule, setActiveTabByModule] = useState<
        Record<string, 'steps' | 'highlights' | 'tips'>
    >({});

    useEffect(() => {
        if (initialModuleFromQuery) {
            setExpandedModules((prev) => ({
                ...prev,
                [initialModuleFromQuery]: true,
            }));
            const el = document.getElementById(`guide-module-${initialModuleFromQuery}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [initialModuleFromQuery]);

    const filteredModules = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();

        return HELP_GUIDE_MODULES.filter((mod) => {
            const matchesCategory =
                activeCategory === 'All Guides' || mod.category === activeCategory;
            if (!matchesCategory) return false;

            if (!q) return true;

            const searchableText = [
                mod.title,
                mod.subtitle,
                mod.category,
                mod.overview,
                ...mod.highlights.map((h) => `${h.label} ${h.detail}`),
                ...mod.steps.map((s) => `${s.title} ${s.description} ${s.badge || ''}`),
                ...mod.tips,
            ]
                .join(' ')
                .toLowerCase();

            return searchableText.includes(q);
        });
    }, [searchQuery, activeCategory]);

    const toggleModuleExpanded = (id: string) => {
        setExpandedModules((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const expandAll = () => {
        const next: Record<string, boolean> = {};
        HELP_GUIDE_MODULES.forEach((m) => {
            next[m.id] = true;
        });
        setExpandedModules(next);
    };

    const collapseAll = () => {
        const next: Record<string, boolean> = {};
        HELP_GUIDE_MODULES.forEach((m) => {
            next[m.id] = false;
        });
        setExpandedModules(next);
    };

    const getActiveTab = (moduleId: string): 'steps' | 'highlights' | 'tips' => {
        return activeTabByModule[moduleId] || 'steps';
    };

    const setModuleTab = (moduleId: string, tab: 'steps' | 'highlights' | 'tips') => {
        setActiveTabByModule((prev) => ({
            ...prev,
            [moduleId]: tab,
        }));
    };

    return (
        <AppLayout
            title="Help & Guides"
            breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Help & Guides' },
            ]}
        >
            <Head title="User Help & Standard Operating Procedures" />

            <div className="space-y-6">
                <PageHeader
                    title="User Help & Standard Operating Procedures"
                    badge={<StatusBadge status="Active" />}
                    description="Comprehensive staff handbook, step-by-step operational workflows, and role-based system guides for the Nisala Travels Management System."
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={expandAll}
                            >
                                Expand All SOPs
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={collapseAll}
                            >
                                Collapse All
                            </Button>
                            <Link
                                href="/bookings/create"
                                className={buttonVariants({
                                    variant: 'default',
                                    size: 'sm',
                                    className: 'bg-[#0E2A47] hover:bg-[#0B3D91] text-white',
                                })}
                            >
                                <span>Launch Booking Wizard</span>
                                <ArrowRight className="ml-1.5 size-3.5 text-[#F59E0B]" />
                            </Link>
                        </div>
                    }
                />

                {/* Executive Quick-Start Banner */}
                <div className="rounded-2xl border border-[#1B3A5E] bg-gradient-to-r from-[#0E2A47] via-[#0E2A47] to-[#0B3D91] p-5 sm:p-6 text-white shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-1.5 max-w-3xl">
                            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F59E0B]">
                                <BookOpen className="size-4" />
                                <span>Nisala Travels Operations Playbook</span>
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                                Everything you need to manage inquiries, bookings, documents, accounting, and the public website
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                                Click the <span className="font-semibold text-[#F59E0B]">? Guide</span> button in the top header bar from any screen to open the contextual slide-over SOP drawer matched to your active page, or press{' '}
                                <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-xs text-amber-200 border border-white/20">
                                    Ctrl / ⌘ + K
                                </kbd>{' '}
                                to jump to any record immediately.
                            </p>
                        </div>

                        {/* Quick Jump Index Pills */}
                        <div className="flex flex-wrap gap-2 shrink-0">
                            {HELP_GUIDE_MODULES.map((mod) => (
                                <a
                                    key={mod.id}
                                    href={`#guide-module-${mod.id}`}
                                    onClick={() =>
                                        setExpandedModules((prev) => ({ ...prev, [mod.id]: true }))
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-[#C49A2C]/40 px-3 py-1.5 text-xs font-medium text-white transition-colors"
                                >
                                    <span className="font-bold text-[#F59E0B]">#{mod.number}</span>
                                    <span>{mod.category}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Live Search Input & Category Filter Pills */}
                <Card className="p-4 sm:p-5 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-xl">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search SOPs by keyword (e.g., 'inquiry_id', 'Maldives', 'PaymentReceipt', '6-step wizard', 'triage')..."
                                className="pl-9 pr-9 bg-background h-10"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                                    aria-label="Clear search"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Showing <span className="font-semibold text-foreground">{filteredModules.length}</span> of{' '}
                            <span className="font-semibold text-foreground">{HELP_GUIDE_MODULES.length}</span> SOP modules
                        </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        {HELP_CATEGORIES.map((category) => {
                            const isActive = activeCategory === category;
                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setActiveCategory(category)}
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-[#0E2A47] text-white shadow-xs ring-1 ring-[#C49A2C]'
                                            : 'bg-muted/70 text-slate-700 dark:text-slate-300 hover:bg-muted'
                                    }`}
                                >
                                    {isActive && <span className="size-1.5 rounded-full bg-[#F59E0B]" />}
                                    <span>{category}</span>
                                </button>
                            );
                        })}
                    </div>
                </Card>

                {/* 6 Interactive Guide Modules */}
                {filteredModules.length === 0 ? (
                    <Card className="p-12 text-center space-y-3">
                        <Compass className="size-10 mx-auto text-muted-foreground opacity-40" />
                        <div className="text-base font-semibold text-foreground">
                            No SOP guides match your current search or category filter
                        </div>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                            Try clearing your search query or switching back to "All Guides" to view all 6 operational modules.
                        </p>
                        <div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery('');
                                    setActiveCategory('All Guides');
                                }}
                            >
                                Reset Filters
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-5">
                        {filteredModules.map((mod: HelpGuideModule) => {
                            const IconComponent = getModuleIcon(mod.id);
                            const isExpanded = expandedModules[mod.id] ?? true;
                            const activeTab = getActiveTab(mod.id);

                            return (
                                <Card
                                    key={mod.id}
                                    id={`guide-module-${mod.id}`}
                                    className="overflow-hidden border border-border shadow-xs transition-all"
                                >
                                    {/* Accordion Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-muted/25 border-b border-border/70">
                                        <div
                                            className="flex items-start gap-3.5 cursor-pointer flex-1 min-w-0"
                                            onClick={() => toggleModuleExpanded(mod.id)}
                                        >
                                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#0E2A47] text-[#F59E0B] shadow-xs border border-[#C49A2C]/40">
                                                <IconComponent className="size-5" />
                                            </div>
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="inline-flex items-center rounded-md bg-[#0E2A47]/10 dark:bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-[#0E2A47] dark:text-[#F59E0B]">
                                                        MODULE {mod.number}
                                                    </span>
                                                    <Badge variant="outline" className="text-[11px] border-[#C49A2C]/40">
                                                        {mod.category}
                                                    </Badge>
                                                </div>
                                                <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                                                    {mod.title}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-muted-foreground">
                                                    {mod.subtitle}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right Header Actions: Direct "Go to Section ->" + Expand Toggle */}
                                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                            <Link
                                                href={mod.primaryHref}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0E2A47] hover:bg-[#0B3D91] text-white px-3.5 py-2 text-xs font-semibold shadow-2xs transition-colors"
                                            >
                                                <span>{mod.primaryCtaLabel}</span>
                                                <ArrowRight className="size-3.5 text-[#F59E0B]" />
                                            </Link>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => toggleModuleExpanded(mod.id)}
                                                aria-label={isExpanded ? 'Collapse module' : 'Expand module'}
                                            >
                                                {isExpanded ? (
                                                    <ChevronUp className="size-4" />
                                                ) : (
                                                    <ChevronDown className="size-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Collapsible Body */}
                                    {isExpanded && (
                                        <div className="p-5 sm:p-6 space-y-6">
                                            {/* Overview + Secondary Links Bar */}
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 p-4">
                                                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
                                                    {mod.overview}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 shrink-0">
                                                    {mod.secondaryLinks.map((sec) => (
                                                        <Link
                                                            key={sec.href}
                                                            href={sec.href}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-colors"
                                                        >
                                                            <span>{sec.label}</span>
                                                            <ArrowRight className="size-3 text-[#C49A2C]" />
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Interactive Module View Tabs */}
                                            <div className="flex items-center justify-between border-b border-border pb-3">
                                                <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 p-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setModuleTab(mod.id, 'steps')}
                                                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                                            activeTab === 'steps'
                                                                ? 'bg-card text-foreground shadow-2xs'
                                                                : 'text-muted-foreground hover:text-foreground'
                                                        }`}
                                                    >
                                                        <CheckCircle2 className="size-3.5 text-[#C49A2C]" />
                                                        <span>Step-by-Step SOP ({mod.steps.length})</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setModuleTab(mod.id, 'highlights')}
                                                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                                            activeTab === 'highlights'
                                                                ? 'bg-card text-foreground shadow-2xs'
                                                                : 'text-muted-foreground hover:text-foreground'
                                                        }`}
                                                    >
                                                        <Layers className="size-3.5 text-[#0E2A47] dark:text-[#F59E0B]" />
                                                        <span>Architecture & Capabilities ({mod.highlights.length})</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setModuleTab(mod.id, 'tips')}
                                                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                                            activeTab === 'tips'
                                                                ? 'bg-card text-foreground shadow-2xs'
                                                                : 'text-muted-foreground hover:text-foreground'
                                                        }`}
                                                    >
                                                        <Sparkles className="size-3.5 text-[#F59E0B]" />
                                                        <span>Best Practices ({mod.tips.length})</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Tab 1: Step-by-Step SOP Stepper Cards */}
                                            {activeTab === 'steps' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {mod.steps.map((step) => (
                                                        <div
                                                            key={step.stepNumber}
                                                            className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-2xs hover:border-[#C49A2C]/50 transition-colors"
                                                        >
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <div className="flex items-center gap-2.5">
                                                                        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0E2A47] text-xs font-bold text-[#F59E0B]">
                                                                            {step.stepNumber}
                                                                        </span>
                                                                        <h4 className="text-sm font-bold text-foreground">
                                                                            {step.title}
                                                                        </h4>
                                                                    </div>
                                                                    {step.badge && (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-[10px] border-[#C49A2C]/40 text-[#0E2A47] dark:text-amber-300 shrink-0"
                                                                        >
                                                                            {step.badge}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                                                                    {step.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Tab 2: Highlights Cards */}
                                            {activeTab === 'highlights' && (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {mod.highlights.map((hl, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="rounded-xl border border-border bg-muted/20 p-4 space-y-1.5"
                                                        >
                                                            <div className="text-sm font-bold text-[#0E2A47] dark:text-[#F59E0B]">
                                                                {hl.label}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                                {hl.detail}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Tab 3: Pro Tips */}
                                            {activeTab === 'tips' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {mod.tips.map((tip, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-start gap-3 rounded-xl border border-amber-300/70 bg-amber-50/70 dark:border-amber-800/50 dark:bg-amber-950/30 p-4 text-xs text-amber-950 dark:text-amber-200 leading-relaxed"
                                                        >
                                                            <Sparkles className="size-4 text-[#C49A2C] shrink-0 mt-0.5" />
                                                            <span>{tip}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Quick Reference Matrix: Staff Roles & Catalog Policy */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Role Permissions Summary */}
                    <Card className="p-5 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <ShieldCheck className="size-5 text-[#0E2A47] dark:text-[#F59E0B]" />
                                <h3 className="text-base font-bold tracking-tight text-foreground">
                                    Staff Access Roles (RBAC Matrix)
                                </h3>
                            </div>
                            <Link
                                href="/employees"
                                className="text-xs font-semibold text-[#0B3D91] dark:text-[#F59E0B] hover:underline inline-flex items-center gap-1"
                            >
                                <span>Manage Employees</span>
                                <ArrowRight className="size-3" />
                            </Link>
                        </div>
                        <div className="space-y-2.5 text-xs">
                            <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                                <div>
                                    <span className="font-bold text-foreground">Admin (Super Admin)</span>
                                    <p className="text-muted-foreground mt-0.5">
                                        Full unrestricted access across Operations, Catalog, Finance, Reports, Employees, and `/settings` (Exchange Rates & Notification Matrix).
                                    </p>
                                </div>
                                <StatusBadge status="Active" />
                            </div>
                            <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                                <div>
                                    <span className="font-bold text-foreground">Manager</span>
                                    <p className="text-muted-foreground mt-0.5">
                                        Full operational and financial oversight including Bookings, Inquiries, Tours, Destinations, Memories, Payments, Refund approvals, Suppliers, Cost Lines, and Reports.
                                    </p>
                                </div>
                                <StatusBadge status="Active" />
                            </div>
                            <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                                <div>
                                    <span className="font-bold text-foreground">Operations (Staff)</span>
                                    <p className="text-muted-foreground mt-0.5">
                                        Day-to-day reservations: Web Inquiries, 6-Step Booking Wizard, Customer CRM, Passport/Visa verification (`/documents`), Calendar, Catalog, and Operational Reports.
                                    </p>
                                </div>
                                <StatusBadge status="Active" />
                            </div>
                            <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                                <div>
                                    <span className="font-bold text-foreground">Finance</span>
                                    <p className="text-muted-foreground mt-0.5">
                                        Accounting & reconciliation: Installment Payments, PDF `PaymentReceipt` generation, Refunds workflow, Suppliers, Package Cost Lines, and Financial/Profitability Reports.
                                    </p>
                                </div>
                                <StatusBadge status="Active" />
                            </div>
                        </div>
                    </Card>

                    {/* Public Website Sync & Destination Policy */}
                    <Card className="p-5 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <Globe className="size-5 text-[#C49A2C]" />
                                <h3 className="text-base font-bold tracking-tight text-foreground">
                                    Destination States & Next.js Website Sync
                                </h3>
                            </div>
                            <Link
                                href="/destinations"
                                className="text-xs font-semibold text-[#0B3D91] dark:text-[#F59E0B] hover:underline inline-flex items-center gap-1"
                            >
                                <span>Manage Destinations</span>
                                <ArrowRight className="size-3" />
                            </Link>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between rounded-lg border border-border p-3">
                                <div className="space-y-0.5">
                                    <div className="font-bold text-foreground">Thailand & India Packages</div>
                                    <div className="text-muted-foreground">
                                        Core bookable destinations published live on the public Next.js website.
                                    </div>
                                </div>
                                <StatusBadge status="Active" />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border border-amber-300/70 bg-amber-50/50 dark:bg-amber-950/25 dark:border-amber-800/50 p-3">
                                <div className="space-y-0.5">
                                    <div className="font-bold text-foreground flex items-center gap-1.5">
                                        <span>Maldives Packages</span>
                                        <Lock className="size-3.5 text-[#C49A2C]" />
                                    </div>
                                    <div className="text-muted-foreground">
                                        Locked to <span className="font-semibold">Coming Soon</span> on the public website until official launch.
                                    </div>
                                </div>
                                <StatusBadge status="Coming Soon" />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                                <div className="space-y-0.5">
                                    <div className="font-bold text-foreground">Hidden / Draft Destinations</div>
                                    <div className="text-muted-foreground">
                                        Internal staging records excluded from public Next.js API responses (`Sri Lanka` permanently retired per business policy).
                                    </div>
                                </div>
                                <StatusBadge status="Draft" />
                            </div>

                            <div className="rounded-xl border border-[#C49A2C]/40 bg-card p-3.5 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <RefreshCw className="size-4 text-[#C49A2C] shrink-0" />
                                    <span className="text-muted-foreground">
                                        Use <strong className="text-foreground">"Sync Public Cache Now"</strong> on `/destinations` or `/tours` to trigger `RevalidateNextJs` immediately.
                                    </span>
                                </div>
                                <Link
                                    href="/tours"
                                    className="inline-flex items-center gap-1 rounded-md bg-[#0E2A47] px-2.5 py-1.5 text-[11px] font-semibold text-white shrink-0 hover:bg-[#0B3D91]"
                                >
                                    <span>Go to Tours</span>
                                    <ArrowRight className="size-3 text-[#F59E0B]" />
                                </Link>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

