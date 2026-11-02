import React from 'react';
import { Building2, Bell, ShieldCheck, Globe, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SettingsSection {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
    {
        id: 'general',
        title: 'General',
        description: 'Company info, contacts & hours',
        icon: Building2,
    },
    {
        id: 'exchange_rates',
        title: 'Exchange Rates',
        description: 'Currency rates & manual updates',
        icon: ArrowRightLeft,
    },
    {
        id: 'notifications',
        title: 'Notifications',
        description: 'Channels & alert rules',
        icon: Bell,
    },
    {
        id: 'access_roles',
        title: 'Access & Roles',
        description: 'System roles & member count',
        icon: ShieldCheck,
    },
    {
        id: 'public_website',
        title: 'Public Website',
        description: 'API key status & cache tools',
        icon: Globe,
    },
];

interface SettingsNavProps {
    activeSection: string;
    onSelectSection: (sectionId: string) => void;
}

export function SettingsNav({ activeSection, onSelectSection }: SettingsNavProps) {
    return (
        <nav aria-label="Settings navigation" className="w-full md:w-64 shrink-0 space-y-1">
            {SETTINGS_SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                    <button
                        key={section.id}
                        type="button"
                        onClick={() => onSelectSection(section.id)}
                        title={section.description}
                        className={cn(
                            'w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            isActive
                                ? 'bg-card shadow-sm border-border text-primary font-semibold'
                                : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <Icon className="size-4 shrink-0" />
                        <span className="truncate">{section.title}</span>
                    </button>
                );
            })}
        </nav>
    );
}
