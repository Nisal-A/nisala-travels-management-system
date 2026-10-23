import React from 'react';
import { Building2, Bell, ShieldCheck, Globe } from 'lucide-react';
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
        <nav aria-label="Settings navigation" className="space-y-1.5">
            {SETTINGS_SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                    <button
                        key={section.id}
                        type="button"
                        onClick={() => onSelectSection(section.id)}
                        className={cn(
                            'w-full flex items-start gap-3.5 px-3.5 py-3 rounded-xl text-left transition-all duration-150',
                            isActive
                                ? 'bg-primary text-primary-foreground shadow-sm font-medium'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/40'
                        )}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <div
                            className={cn(
                                'p-2 rounded-lg shrink-0 transition-colors',
                                isActive
                                    ? 'bg-primary-foreground/15 text-primary-foreground'
                                    : 'bg-muted text-foreground/70'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium leading-tight">
                                {section.title}
                            </div>
                            <div
                                className={cn(
                                    'text-xs mt-1 truncate',
                                    isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                )}
                            >
                                {section.description}
                            </div>
                        </div>
                    </button>
                );
            })}
        </nav>
    );
}
