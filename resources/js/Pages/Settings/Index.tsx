import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { SettingsNav } from '@/components/settings/SettingsNav';
import { GeneralSettingsForm } from '@/components/settings/GeneralSettingsForm';
import { NotificationsCard } from '@/components/settings/NotificationsCard';
import { AccessRolesTable, type RoleData } from '@/components/settings/AccessRolesTable';
import { PublicWebsiteSettings } from '@/components/settings/PublicWebsiteSettings';
import { ExchangeRatesCard, type ExchangeRateData } from '@/components/settings/ExchangeRatesCard';
import { Toaster } from '@/components/ui/toast';
import { Settings, SlidersHorizontal } from 'lucide-react';

interface SettingsIndexProps {
    general: {
        company_name?: string;
        name?: string;
        company_phone?: string;
        phone?: string;
        phones?: string;
        company_phones?: string;
        website?: string;
        company_website?: string;
        email?: string;
        company_email?: string;
        registration_number?: string;
        company_registration_number?: string;
        bank_details?: string;
        company_bank_details?: string;
        logo_path?: string;
        company_logo_path?: string;
        company_whatsapp_number?: string;
        whatsapp_number?: string;
        company_support_email?: string;
        support_email?: string;
        company_address?: string;
        address?: string;
        company_office_hours?: string;
        office_hours?: string;
    };
    notificationSettingsUrl: string;
    roles: RoleData[];
    publicWebsite: {
        isApiKeyConfigured: boolean;
        is_configured?: boolean;
        publicSiteUrl: string;
        public_site_url?: string;
    };
    exchangeRates: ExchangeRateData[];
}

export default function SettingsIndex({
    general,
    notificationSettingsUrl,
    roles,
    publicWebsite,
    exchangeRates = [],
}: SettingsIndexProps) {
    const [activeSection, setActiveSection] = useState('general');

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'general':
                return <GeneralSettingsForm initialData={general} />;
            case 'exchange_rates':
                return <ExchangeRatesCard exchangeRates={exchangeRates} />;
            case 'notifications':
                return <NotificationsCard notificationSettingsUrl={notificationSettingsUrl} />;
            case 'access_roles':
                return <AccessRolesTable roles={roles} />;
            case 'public_website':
                return <PublicWebsiteSettings data={publicWebsite} />;
            default:
                return <GeneralSettingsForm initialData={general} />;
        }
    };

    return (
        <AppLayout
            title="Settings"
            breadcrumbs={[
                { label: 'Dashboard', href: '/admin' },
                { label: 'Settings' },
            ]}
        >
            <Head title="System Settings" />

            {/* Toaster for success/error feedback */}
            <Toaster />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Settings className="h-5 w-5" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                System Settings
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1.5">
                            Manage company identity, alert routing, user role distributions, and public catalog integrations.
                        </p>
                    </div>
                </div>

                {/* Main Content Layout with Left-hand Section List */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Left-hand section navigation list */}
                    <div className="w-full md:w-64 lg:w-72 shrink-0">
                        <div className="sticky top-20 rounded-2xl border bg-card p-3 shadow-sm">
                            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                                Configuration
                            </div>
                            <SettingsNav
                                activeSection={activeSection}
                                onSelectSection={setActiveSection}
                            />
                        </div>
                    </div>

                    {/* Right-hand content panel */}
                    <div className="w-full flex-1 min-w-0">
                        {renderActiveSection()}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
