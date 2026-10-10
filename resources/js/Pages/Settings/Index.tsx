import { useState, useEffect, useRef } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { PageHeader } from '@/components/common/page-header';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useAuth } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// Partials
import GeneralSettings from './partials/GeneralSettings.tsx';
import AppearanceSettings from './partials/AppearanceSettings.tsx';
import LocalizationSettings from './partials/LocalizationSettings.tsx';
import NotificationsSettings from './partials/NotificationsSettings.tsx';
import SecuritySettings from './partials/SecuritySettings.tsx';
import RolesSettings from './partials/RolesSettings.tsx';
import { Settings, Palette, Globe, Bell, Shield, Users } from 'lucide-react';

interface SettingsProps {
    settings: Record<string, string>;
    roles_data: any;
    active_sessions: any[];
}

export default function SettingsIndex({ settings, roles_data, active_sessions }: SettingsProps) {
    const { user, hasRole } = useAuth();
    const isSuperAdmin = hasRole('super_admin');

    const tabs = [
        { id: 'general', label: 'General', description: 'Company name, logo, contact details', icon: Settings, component: GeneralSettings, group: 'BUSINESS', show: isSuperAdmin },
        { id: 'localization', label: 'Localization', description: 'Language, timezone, currency', icon: Globe, component: LocalizationSettings, group: 'BUSINESS', show: isSuperAdmin },
        { id: 'appearance', label: 'Appearance', description: 'Theme and display preferences', icon: Palette, component: AppearanceSettings, group: 'ACCOUNT', show: true },
        { id: 'notifications', label: 'Notifications', description: 'Email and system alerts', icon: Bell, component: NotificationsSettings, group: 'ACCOUNT', show: true },
        { id: 'security', label: 'Security', description: 'Password and session management', icon: Shield, component: SecuritySettings, group: 'ACCOUNT', show: true },
        { id: 'roles', label: 'Roles & Permissions', description: 'Access control and team roles', icon: Users, component: RolesSettings, group: 'ACCESS', show: isSuperAdmin },
    ].filter(tab => tab.show);

    const getInitialTab = () => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam && tabs.find(t => t.id === tabParam)) {
            return tabParam;
        }
        return tabs[0].id;
    };

    const [activeTab, setActiveTab] = useState(getInitialTab);
    const mobileTabsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', activeTab);
        window.history.replaceState({}, '', url);

        // Scroll mobile pill into view if needed
        const activeElement = mobileTabsRef.current?.querySelector(`[data-tab-id="${activeTab}"]`);
        if (activeElement) {
            activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [activeTab]);

    const activeTabObj = tabs.find(t => t.id === activeTab) || tabs[0];
    const ActiveComponent = activeTabObj.component;

    const groupedTabs = tabs.reduce((acc, tab) => {
        if (!acc[tab.group]) {
            acc[tab.group] = [];
        }
        acc[tab.group].push(tab);
        return acc;
    }, {} as Record<string, typeof tabs>);

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Settings', href: route('settings.index') },
                { label: activeTabObj.label }
            ]}
        >
            <Head title={`Settings - ${activeTabObj.label}`} />

            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <PageHeader title="Settings" description="Manage your application and account preferences." />

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Mobile Tabs */}
                    <div className="md:hidden mb-4">
                        <ScrollArea className="w-full whitespace-nowrap">
                            <div ref={mobileTabsRef} className="flex w-max space-x-2 p-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        data-tab-id={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        aria-current={activeTab === tab.id ? 'page' : undefined}
                                        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${activeTab === tab.id
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <tab.icon className="w-4 h-4" />
                                            {tab.label}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" className="invisible" />
                        </ScrollArea>
                    </div>

                    {/* Desktop Tabs */}
                    <div className="hidden md:block w-60 shrink-0 space-y-6">
                        {Object.entries(groupedTabs).map(([groupName, groupTabs]) => (
                            <div key={groupName} className="space-y-1">
                                <h4 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {groupName}
                                </h4>
                                <div className="space-y-1">
                                    {groupTabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            aria-current={activeTab === tab.id ? 'page' : undefined}
                                            className={`w-full flex items-start text-left px-3 py-2 rounded-md transition-colors relative ${
                                                activeTab === tab.id
                                                    ? 'bg-accent/50 text-accent-foreground'
                                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                            }`}
                                        >
                                            {activeTab === tab.id && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                                            )}
                                            <div className="flex items-center mt-0.5 mr-3 shrink-0">
                                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : ''}`} />
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-sm font-medium">{tab.label}</span>
                                                <span className="text-xs text-muted-foreground truncate">{tab.description}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 max-w-4xl">
                        <ActiveComponent
                            settings={settings}
                            rolesData={roles_data}
                            activeSessions={active_sessions}
                            user={user}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
