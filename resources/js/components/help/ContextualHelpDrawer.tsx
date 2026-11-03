import React, { useMemo, useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Compass,
    CreditCard,
    FileCheck2,
    Globe,
    Keyboard,
    LayoutDashboard,
    MessageSquarePlus,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';

export type GuideCategory =
    | 'All Guides'
    | 'Daily Operations'
    | 'Bookings & Leads'
    | 'Finance & Receipts'
    | 'Public Website & Catalog'
    | 'System & Roles';

export interface GuideStep {
    stepNumber: number;
    title: string;
    description: string;
    badge?: string;
}

export interface GuideActionLink {
    label: string;
    href: string;
}

export interface HelpGuideModule {
    id: string;
    number: number;
    title: string;
    subtitle: string;
    category: Exclude<GuideCategory, 'All Guides'>;
    matchPrefixes: string[];
    primaryHref: string;
    primaryCtaLabel: string;
    secondaryLinks: GuideActionLink[];
    overview: string;
    highlights: { label: string; detail: string }[];
    steps: GuideStep[];
    tips: string[];
}

export const HELP_CATEGORIES: GuideCategory[] = [
    'All Guides',
    'Daily Operations',
    'Bookings & Leads',
    'Finance & Receipts',
    'Public Website & Catalog',
    'System & Roles',
];

export const HELP_GUIDE_MODULES: HelpGuideModule[] = [
    {
        id: 'executive-dashboard-triage',
        number: 1,
        title: 'Executive Dashboard & Daily Triage',
        subtitle: 'KPI monitoring, Revenue vs. Supplier Cost analysis, and clearing the 3 Daily Triage queues.',
        category: 'Daily Operations',
        matchPrefixes: ['/dashboard', '/calendar'],
        primaryHref: '/dashboard',
        primaryCtaLabel: 'Go to Executive Dashboard',
        secondaryLinks: [
            { label: 'Operations Calendar', href: '/calendar' },
            { label: 'Bookings Register', href: '/bookings' },
        ],
        overview:
            'The Executive Dashboard serves as your daily command center, combining real-time financial KPIs, 6-month gross margin trends, and an actionable 3-tab Operational Triage Queue.',
        highlights: [
            {
                label: '4 Executive KPI Cards',
                detail: 'Tracks Gross Revenue (Base currency + LKR equivalent), Active Bookings count, Pending Web Inquiries, and Overdue/Pending Installment totals with period comparisons.',
            },
            {
                label: 'Revenue vs. Supplier Cost Chart',
                detail: 'Interactive 6-month bar chart comparing collected customer revenue against contracted package cost lines to surface your net profit and +88% Avg Gross Margin.',
            },
            {
                label: '3 Daily Triage Queues',
                detail: 'Prioritizes the top 5 Overdue Installments, top 5 Unverified Passports/Visas, and top 5 New Web Inquiries for immediate staff resolution.',
            },
        ],
        steps: [
            {
                stepNumber: 1,
                title: 'Audit Top KPI Cards at Morning Standup',
                description:
                    'Review Gross Revenue (LKR), Active Bookings, Pending Inquiries, and Overdue Installments to identify immediate cash-flow or fulfillment bottlenecks.',
                badge: 'KPIs',
            },
            {
                stepNumber: 2,
                title: 'Inspect 6-Month Revenue vs. Supplier Cost & Net Margin',
                description:
                    'Hover over any monthly bar in the financial chart to inspect exact Revenue, Supplier Cost, and Net Margin figures calculated from confirmed bookings and package cost lines.',
                badge: 'Margin',
            },
            {
                stepNumber: 3,
                title: 'Clear the 3 Operational Triage Tabs (Overdue, Docs, Leads)',
                description:
                    'Switch between "Overdue" (payment schedules past due_date), "Docs" (unverified customer passports/visas), and "Leads" (new web inquiries) and click each item to resolve it directly.',
                badge: 'Triage',
            },
            {
                stepNumber: 4,
                title: 'Filter Recent Bookings & Fulfillment Status',
                description:
                    'Use the bottom fulfillment table pills (All, Confirmed, Pending, Overdue) and document verification progress bars to verify upcoming departure readiness.',
                badge: 'Fulfillment',
            },
        ],
        tips: [
            'Resolve all items in the "Overdue" and "Docs" triage tabs before 11:00 AM daily to prevent departure delays.',
            'Use the Operations Calendar (/calendar) alongside the Dashboard to visualize weekly departure capacity.',
        ],
    },
    {
        id: 'web-inquiries-lead-conversion',
        number: 2,
        title: 'Handling Web Inquiries & Lead Conversion',
        subtitle: 'Next.js marketing website intake (/api/v1/public/inquiries), notifications, and 1-click wizard pre-fill.',
        category: 'Bookings & Leads',
        matchPrefixes: ['/inquiries', '/admin/inquiries'],
        primaryHref: '/admin/inquiries',
        primaryCtaLabel: 'Go to Web Inquiries',
        secondaryLinks: [
            { label: 'Launch Booking Wizard', href: '/bookings/create' },
            { label: 'Customer Directory', href: '/customers' },
        ],
        overview:
            'Prospective travelers browsing the public Next.js website submit tour inquiries that arrive automatically in the Admin Portal and can be converted into draft bookings in a single click.',
        highlights: [
            {
                label: 'Public API Intake (/api/v1/public/inquiries)',
                detail: 'Inquiries submitted on the Next.js marketing site are validated and stored via the secured public API endpoint.',
            },
            {
                label: 'Instant Staff Notifications',
                detail: 'New inquiries trigger real-time bell notifications (NotificationBell) and appear in the Dashboard "Leads" triage queue.',
            },
            {
                label: '1-Click "Convert to Draft Booking"',
                detail: 'Navigates to /bookings/create?inquiry_id={id} and pre-populates Customer details, Destination/Tour, Travel Date, and Pax count.',
            },
        ],
        steps: [
            {
                stepNumber: 1,
                title: 'Receive Lead from Next.js Website (/api/v1/public/inquiries)',
                description:
                    'When a client submits an inquiry on the public website for Thailand or India packages, the system records their contact info, preferred destination, travel dates, and group size.',
                badge: 'API Intake',
            },
            {
                stepNumber: 2,
                title: 'Assign Sales Consultant & Update Inquiry Status',
                description:
                    'Open Web Inquiries (/admin/inquiries), assign the lead to an operations/sales staff member, and update the status from "Pending" to "Contacted" after initial client outreach.',
                badge: 'Triage',
            },
            {
                stepNumber: 3,
                title: 'Click "Convert to Draft Booking"',
                description:
                    'From either the Inquiries table row or the Inquiry detail view, click "Convert to Draft Booking" to launch the 6-Step Booking Wizard with ?inquiry_id={inquiry.id}.',
                badge: 'Conversion',
            },
            {
                stepNumber: 4,
                title: 'Verify Gold Pre-fill Banner in Booking Wizard',
                description:
                    'Confirm the gold banner "Pre-filling draft from Web Inquiry #{id}" appears: Step 1 (Customer name/email/phone), Step 2 (Destination/Tour/Dates), and Step 3 (Pax count) are pre-populated automatically.',
                badge: 'Wizard Pre-fill',
            },
        ],
        tips: [
            'If the inquiry email or phone matches an existing customer in Step 1, select that customer; otherwise click "+ Create New Customer" in Step 1 with the pre-filled inquiry fields.',
            'Responding to web inquiries within 2 hours maximizes conversion rates on Thailand and India departures.',
        ],
    },
    {
        id: 'booking-wizard-traveler-documents',
        number: 3,
        title: '6-Step Booking Wizard & Traveler Documents',
        subtitle: 'Complete walkthrough of Steps 1–6, slide-over inspector, and passport/visa verification in /documents.',
        category: 'Bookings & Leads',
        matchPrefixes: ['/bookings', '/customers', '/documents'],
        primaryHref: '/bookings',
        primaryCtaLabel: 'Go to Bookings',
        secondaryLinks: [
            { label: '+ New Booking Wizard', href: '/bookings/create' },
            { label: 'Traveler Documents', href: '/documents' },
            { label: 'Customers CRM', href: '/customers' },
        ],
        overview:
            'The 6-Step Booking Wizard standardizes multi-traveler reservations with locked exchange rates and installment schedules, while the Documents module manages passport/visa verification.',
        highlights: [
            {
                label: 'Slide-Over Detail Inspector',
                detail: 'Click any row or the Inspect (eye) button on /bookings to preview Travelers, Documents, Installments, and Supplier Margin in a right-side drawer without leaving the list.',
            },
            {
                label: 'FX Rate Lock & Cost Lines',
                detail: 'Locks base currency (USD/THB/INR) to LKR exchange rates at booking time and links supplier cost lines for accurate profitability.',
            },
            {
                label: 'Customer Portal Document Sync',
                detail: 'Approving or rejecting passports/visas in /documents immediately updates the customer’s self-service Portal status.',
            },
        ],
        steps: [
            {
                stepNumber: 1,
                title: 'Step 1: Customer Selection & Slide-Over Creation',
                description:
                    'Search existing customers by name, email, phone, or passport number, or open the Customer Slide-Over drawer to create a new profile without leaving the wizard.',
                badge: 'Step 1',
            },
            {
                stepNumber: 2,
                title: 'Step 2: Tour Package & Travel Dates',
                description:
                    'Select the destination and active tour package (Thailand or India), specify departure date, and review available seat capacity.',
                badge: 'Step 2',
            },
            {
                stepNumber: 3,
                title: 'Step 3: Traveler Manifest (Adult / Child / Infant)',
                description:
                    'Add all passengers in the traveling party, designating lead traveler, adult/child/infant passenger types, passport numbers, and special dietary/medical notes.',
                badge: 'Step 3',
            },
            {
                stepNumber: 4,
                title: 'Step 4: Base Currency vs. LKR Exchange Rate Lock & Supplier Costs',
                description:
                    'Configure per-person pricing, lock the foreign currency to LKR exchange rate, apply authorized discounts, and review package supplier cost lines.',
                badge: 'Step 4',
            },
            {
                stepNumber: 5,
                title: 'Step 5: Installment Payment Schedule',
                description:
                    'Define deposit and balance installment milestones with specific due dates so automated overdue tracking works on the Dashboard.',
                badge: 'Step 5',
            },
            {
                stepNumber: 6,
                title: 'Step 6: Final Review, Confirmation & Document Verification (/documents)',
                description:
                    'Confirm the booking and verify uploaded customer passports/visas in /documents or Customer Documents. Verified/Rejected statuses sync immediately to the Customer Portal.',
                badge: 'Step 6 & Docs',
            },
        ],
        tips: [
            'Click any booking row in /bookings to open the Slide-Over Detail Inspector for a fast overview of documents, installments, and net margin.',
            'Ensure every traveler passport has at least 6 months validity beyond the scheduled return date before clicking Verify.',
        ],
    },
    {
        id: 'payments-receipts-costs-refunds',
        number: 4,
        title: 'Payments, PDF Receipts, Supplier Costs & Refunds',
        subtitle: 'Installment collection, sequential PaymentReceipt PDFs, supplier cost lines, and refund approvals.',
        category: 'Finance & Receipts',
        matchPrefixes: ['/payments', '/refunds', '/suppliers', '/package-cost-lines'],
        primaryHref: '/payments',
        primaryCtaLabel: 'Go to Payments & Receipts',
        secondaryLinks: [
            { label: 'Refunds Workflow', href: '/refunds' },
            { label: 'Suppliers Directory', href: '/suppliers' },
        ],
        overview:
            'Manage end-to-end tour accounting: record installment receipts with sequential PDF generation, maintain supplier cost lines for net margin reporting, and process multi-stage refunds.',
        highlights: [
            {
                label: 'Sequential PaymentReceipt & PDF',
                detail: 'Every recorded payment generates an immutable sequential receipt number with downloadable corporate PDF receipt.',
            },
            {
                label: 'Supplier Cost Lines (4 Categories)',
                detail: 'Track contracted Hotel, Flight, Transport, and Guide costs per tour package to power real-time Tour Profitability calculations.',
            },
            {
                label: 'Controlled Refund Workflow',
                detail: 'Refund requests in /refunds follow a strict Draft/Pending -> Approved/Rejected -> Marked Paid audit trail.',
            },
        ],
        steps: [
            {
                stepNumber: 1,
                title: 'Record Installment Payments in /payments',
                description:
                    'Select the booking and installment schedule, enter the amount received, payment method (Bank Transfer, Card, Cash), and bank reference number.',
                badge: 'Payments',
            },
            {
                stepNumber: 2,
                title: 'Download Sequential PaymentReceipt PDF',
                description:
                    'Once saved, the system generates a sequential PaymentReceipt record. Download or email the official PDF receipt from /payments or the Booking Slide-Over drawer.',
                badge: 'PDF Receipt',
            },
            {
                stepNumber: 3,
                title: 'Maintain Supplier Cost Lines (Hotel, Flight, Transport, Guide)',
                description:
                    'Register vendors in /suppliers and attach Package Cost Lines (Hotel, Flight, Transport, Guide) on each tour package to compare contracted costs against revenue.',
                badge: 'Cost Lines',
            },
            {
                stepNumber: 4,
                title: 'Process Customer Refunds in /refunds',
                description:
                    'Submit cancellation or adjustment refund requests in /refunds, obtain Manager/Admin approval, and mark the refund as Paid once disbursed.',
                badge: 'Refunds',
            },
        ],
        tips: [
            'Packages without supplier cost lines are flagged as "Costs not entered" in the Tour Profitability report—always enter cost lines before departure.',
            'Always verify bank transfer reference numbers against bank statements before issuing final balance receipts.',
        ],
    },
    {
        id: 'catalog-maldives-nextjs-sync',
        number: 5,
        title: 'Catalog Management, Maldives "Coming Soon" & Next.js Sync',
        subtitle: 'Managing /destinations, /tours, /admin/memories, listing states, and manual Next.js cache revalidation.',
        category: 'Public Website & Catalog',
        matchPrefixes: ['/destinations', '/tours', '/admin/memories'],
        primaryHref: '/destinations',
        primaryCtaLabel: 'Go to Destinations Catalog',
        secondaryLinks: [
            { label: 'Tour Packages', href: '/tours' },
            { label: 'Photo Memories', href: '/admin/memories' },
        ],
        overview:
            'Destinations, Tour Packages, and Memories managed in the Admin Portal power the separate Next.js public marketing website via cached API endpoints and webhook revalidation.',
        highlights: [
            {
                label: 'Destination Listing States',
                detail: 'Controls public visibility: Active (Emerald) for Thailand & India, Coming Soon (Gold/Amber) locked for Maldives, and Draft (Slate) for hidden destinations.',
            },
            {
                label: 'Business Policy Enforcement',
                detail: 'Sri Lanka packages are permanently retired per corporate policy; Maldives remains locked to Coming Soon until official launch.',
            },
            {
                label: 'Sync Public Cache Now',
                detail: 'Dispatches RevalidateNextJs job (POST /catalog/revalidate-public-cache) to immediately refresh the Next.js marketing website.',
            },
        ],
        steps: [
            {
                stepNumber: 1,
                title: 'Manage Destinations & Listing States (/destinations)',
                description:
                    'Maintain hero imagery, highlights, travel facts, and listing_state: Active (Live) for Thailand & India, Coming Soon for Maldives (locked until launch), or Draft (Hidden).',
                badge: 'Destinations',
            },
            {
                stepNumber: 2,
                title: 'Curate Tour Packages & Tiers (/tours)',
                description:
                    'Configure multi-day itineraries, inclusions, group min/max capacity, package tiers, and pricing for active destinations.',
                badge: 'Tours',
            },
            {
                stepNumber: 3,
                title: 'Publish Annual Photo Memories (/admin/memories)',
                description:
                    'Upload curated traveler photo galleries organized by year and toggle their published state for the public website showcase.',
                badge: 'Memories',
            },
            {
                stepNumber: 4,
                title: 'Click "Sync Public Cache Now" to Revalidate Next.js',
                description:
                    'Whenever you finish bulk catalog edits on /destinations or /tours, click "Sync Public Cache Now" in the top-right header to flush the catalog cache and trigger Next.js webhook revalidation immediately.',
                badge: 'Next.js Sync',
            },
        ],
        tips: [
            'Saving an individual destination or tour automatically queues Next.js revalidation; use "Sync Public Cache Now" whenever you want to force an immediate full-catalog refresh.',
            'Maldives cannot be switched to Active until the launch lock policy is lifted.',
        ],
    },
    {
        id: 'reports-fx-roles-settings',
        number: 6,
        title: 'Reports, Exchange Rates & Role Permissions',
        subtitle: 'Exporting Financial & Operational reports (PDF/CSV/Excel), RBAC matrix, and /settings configuration.',
        category: 'System & Roles',
        matchPrefixes: ['/reports', '/employees', '/settings', '/profile', '/help'],
        primaryHref: '/reports',
        primaryCtaLabel: 'Go to Reports Center',
        secondaryLinks: [
            { label: 'Employees & Roles', href: '/employees' },
            { label: 'System Settings', href: '/settings' },
        ],
        overview:
            'Generate audit-ready Financial and Operational exports in PDF, CSV, or Excel, manage role-based staff permissions, and configure system-wide exchange rates and notification matrices.',
        highlights: [
            {
                label: 'Financial & Operational Reports',
                detail: 'Includes Tour Profitability, Income & Expenses, Booking Register, Passenger Count, Document Status, and Upcoming Tours.',
            },
            {
                label: '4 Staff Access Roles (RBAC)',
                detail: 'Granular access across Super Admin (Admin), Manager, Staff (Operations), and Finance roles.',
            },
            {
                label: 'Exchange Rates & Notifications (/settings)',
                detail: 'Configure base currency exchange rates, organization details, and automated notification channels.',
            },
        ],
        steps: [
            {
                stepNumber: 1,
                title: 'Run Financial Reports (Tour Profitability, Income & Expenses)',
                description:
                    'Filter by date range, destination, tier, and status in /reports to analyze gross revenue, converted supplier costs, net profit, and margin percentages.',
                badge: 'Financial Reports',
            },
            {
                stepNumber: 2,
                title: 'Run Operational Reports & Export to PDF / CSV / Excel',
                description:
                    'Generate Booking Register, Passenger Count, Document Status, and Upcoming Tours reports, then click Export (PDF, CSV, or Excel) for accounting or ground-handling manifests.',
                badge: 'Operational Exports',
            },
            {
                stepNumber: 3,
                title: 'Review Staff Access Roles (/employees)',
                description:
                    'Assign employees to Admin (full system & settings), Manager (operations + finance + catalog), Operations/Staff (bookings, inquiries, customers, documents, catalog), or Finance (payments, refunds, suppliers, cost lines, reports).',
                badge: 'RBAC Roles',
            },
            {
                stepNumber: 4,
                title: 'Configure Exchange Rates & Notification Matrix (/settings)',
                description:
                    'Super Admins can update default currency conversion rates, company branding on PDF receipts, and event notification triggers in /settings.',
                badge: 'Settings',
            },
        ],
        tips: [
            'Use the Upcoming Tours report every Monday to identify departures within the next 7 days or packages with <= 20% seats remaining.',
            'Press Cmd/Ctrl + K from any page to jump directly to any report or system setting.',
        ],
    },
];

export function matchHelpModuleByPath(pathname: string): HelpGuideModule {
    const cleanPath = (pathname || '/dashboard').split('?')[0];

    for (const mod of HELP_GUIDE_MODULES) {
        if (mod.matchPrefixes.some((prefix) => cleanPath === prefix || cleanPath.startsWith(prefix + '/'))) {
            return mod;
        }
    }

    if (cleanPath.includes('/inquiries')) {
        return HELP_GUIDE_MODULES[1];
    }
    if (cleanPath.includes('/memories')) {
        return HELP_GUIDE_MODULES[4];
    }

    return HELP_GUIDE_MODULES[0];
}

export function getModuleIcon(moduleId: string) {
    switch (moduleId) {
        case 'executive-dashboard-triage':
            return LayoutDashboard;
        case 'web-inquiries-lead-conversion':
            return MessageSquarePlus;
        case 'booking-wizard-traveler-documents':
            return FileCheck2;
        case 'payments-receipts-costs-refunds':
            return CreditCard;
        case 'catalog-maldives-nextjs-sync':
            return Globe;
        case 'reports-fx-roles-settings':
        default:
            return ShieldCheck;
    }
}

interface ContextualHelpDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentPath: string;
}

export function ContextualHelpDrawer({ open, onOpenChange, currentPath }: ContextualHelpDrawerProps) {
    const matchedModule = useMemo(() => matchHelpModuleByPath(currentPath), [currentPath]);
    const [selectedModuleId, setSelectedModuleId] = useState<string>(matchedModule.id);

    useEffect(() => {
        setSelectedModuleId(matchedModule.id);
    }, [matchedModule.id, open]);

    const activeModule = useMemo(
        () => HELP_GUIDE_MODULES.find((m) => m.id === selectedModuleId) ?? matchedModule,
        [selectedModuleId, matchedModule],
    );

    const ActiveIcon = getModuleIcon(activeModule.id);
    const isMatchedToCurrentPage = activeModule.id === matchedModule.id;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0 flex flex-col">
                {/* Navy & Gold Executive Header */}
                <SheetHeader className="border-b border-[#1B3A5E] bg-[#0E2A47] text-white p-5 space-y-2.5 shrink-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F59E0B]">
                            <BookOpen className="size-4" />
                            <span>Contextual SOP Guide</span>
                        </div>
                        {isMatchedToCurrentPage ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C49A2C]/25 border border-[#F59E0B]/40 px-2.5 py-0.5 text-[11px] font-semibold text-[#F59E0B]">
                                <Compass className="size-3" />
                                Matched to Current Page
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setSelectedModuleId(matchedModule.id)}
                                className="text-[11px] font-medium text-amber-300 underline hover:text-white cursor-pointer"
                            >
                                Reset to current page ({matchedModule.category})
                            </button>
                        )}
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-[#C49A2C]/40 text-[#F59E0B]">
                            <ActiveIcon className="size-5" />
                        </div>
                        <div className="space-y-1 min-w-0">
                            <SheetTitle className="text-base sm:text-lg font-bold tracking-tight text-white leading-snug">
                                {activeModule.number}. {activeModule.title}
                            </SheetTitle>
                            <SheetDescription className="text-xs text-slate-300 leading-relaxed">
                                {activeModule.subtitle}
                            </SheetDescription>
                        </div>
                    </div>

                    {/* Quick Module Switcher Pills inside Drawer */}
                    <div className="pt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {HELP_GUIDE_MODULES.map((mod) => {
                            const isSelected = mod.id === activeModule.id;
                            const isPageMatch = mod.id === matchedModule.id;
                            return (
                                <button
                                    key={mod.id}
                                    type="button"
                                    onClick={() => setSelectedModuleId(mod.id)}
                                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${isSelected
                                            ? 'bg-[#C49A2C] text-slate-950 font-semibold shadow-xs'
                                            : 'bg-white/10 text-slate-200 hover:bg-white/20'
                                        }`}
                                >
                                    <span>#{mod.number}</span>
                                    <span className="truncate max-w-[110px]">{mod.category}</span>
                                    {isPageMatch && !isSelected && (
                                        <span className="size-1.5 rounded-full bg-[#F59E0B]" title="Current page match" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </SheetHeader>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* Overview Card */}
                    <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {activeModule.overview}
                    </div>

                    {/* Key Highlights */}
                    <div className="space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Key System Capabilities
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                            {activeModule.highlights.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-lg border border-border bg-card p-3 shadow-2xs"
                                >
                                    <div className="text-xs font-semibold text-[#0E2A47] dark:text-[#F59E0B]">
                                        {item.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                        {item.detail}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step-by-Step SOP Checklist */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <CheckCircle2 className="size-3.5 text-[#0E2A47] dark:text-[#C49A2C]" />
                            Step-by-Step Standard Operating Procedure
                        </h4>
                        <ol className="space-y-2.5">
                            {activeModule.steps.map((step) => (
                                <li
                                    key={step.stepNumber}
                                    className="rounded-xl border border-border bg-card p-3.5 shadow-2xs space-y-1.5"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0E2A47] text-[11px] font-bold text-[#F59E0B]">
                                                {step.stepNumber}
                                            </span>
                                            <span className="text-xs font-bold text-foreground">
                                                {step.title}
                                            </span>
                                        </div>
                                        {step.badge && (
                                            <Badge variant="outline" className="text-[10px] border-[#C49A2C]/40 text-[#0E2A47] dark:text-amber-300">
                                                {step.badge}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                                        {step.description}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Executive Tips */}
                    <div className="space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Sparkles className="size-3.5 text-[#F59E0B]" />
                            Operational Best Practices
                        </h4>
                        <ul className="space-y-2">
                            {activeModule.tips.map((tip, index) => (
                                <li
                                    key={index}
                                    className="rounded-lg border border-amber-200/80 bg-amber-50/70 dark:border-amber-800/50 dark:bg-amber-950/30 p-3 text-xs text-amber-950 dark:text-amber-200 leading-relaxed"
                                >
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick Jump Links for this Module */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Direct Section Shortcuts
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={activeModule.primaryHref}
                                onClick={() => onOpenChange(false)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0E2A47] hover:bg-[#0B3D91] text-white px-3 py-1.5 text-xs font-semibold transition-colors"
                            >
                                <span>{activeModule.primaryCtaLabel}</span>
                                <ArrowRight className="size-3.5 text-[#F59E0B]" />
                            </Link>
                            {activeModule.secondaryLinks.map((lnk) => (
                                <Link
                                    key={lnk.href}
                                    href={lnk.href}
                                    onClick={() => onOpenChange(false)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors"
                                >
                                    <span>{lnk.label}</span>
                                    <ArrowRight className="size-3 text-muted-foreground" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Keyboard Shortcuts */}
                    <div className="rounded-lg border border-border bg-card p-3.5 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                            <Keyboard className="size-4 text-[#C49A2C]" />
                            <span>Global Keyboard Shortcut</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Open Command Palette from any screen</span>
                            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                                Ctrl / ⌘ + K
                            </kbd>
                        </div>
                    </div>
                </div>

                {/* Sticky Footer with "Open Full Help Center (/help)" */}
                <div className="border-t border-border bg-card p-4 flex items-center justify-between gap-3 shrink-0">
                    <Link
                        href={`/help?module=${activeModule.id}`}
                        onClick={() => onOpenChange(false)}
                        className={buttonVariants({
                            variant: 'default',
                            size: 'sm',
                            className: 'bg-[#0E2A47] hover:bg-[#0B3D91] text-white font-semibold',
                        })}
                    >
                        <BookOpen className="mr-1.5 size-3.5 text-[#F59E0B]" />
                        Open Full Help Center (/help)
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default ContextualHelpDrawer;

