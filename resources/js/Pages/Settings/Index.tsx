import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { PageHeader } from '@/components/common';
import { SettingsNav, SETTINGS_SECTIONS } from '@/components/settings/SettingsNav';
import { GeneralSettingsForm } from '@/components/settings/GeneralSettingsForm';
import { NotificationsCard } from '@/components/settings/NotificationsCard';
import { AccessRolesTable, type RoleData } from '@/components/settings/AccessRolesTable';
import { PublicWebsiteSettings } from '@/components/settings/PublicWebsiteSettings';
import { ExchangeRatesCard, type ExchangeRateData } from '@/components/settings/ExchangeRatesCard';
import { Toaster } from '@/components/ui/toast';

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
    const [activeSection, setActiveSection] = useState<string>(() => {
        const tab = new URLSearchParams(window.location.search).get('tab');
        return tab && SETTINGS_SECTIONS.some((s) => s.id === tab) ? tab : 'general';
    });

    const handleSelectSection = (sectionId: string) => {
        setActiveSection(sectionId);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', sectionId);
        // Client-side Inertia visit: updates ?tab= without a server round trip.
        router.replace({
            url: url.pathname + url.search,
            preserveState: true,
            preserveScroll: true,
        });
    };

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

            <div className="space-y-8">
                <PageHeader
                    title="Settings"
                    description="Manage company details, exchange rates and system preferences."
                />

                {/* Two-column layout: left tab nav, right panel (stacks below md) */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <SettingsNav
                        activeSection={activeSection}
                        onSelectSection={handleSelectSection}
                    />

                    <div className="w-full flex-1 min-w-0">
                        {renderActiveSection()}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
