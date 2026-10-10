import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock, Mail, Bell, MessageCircle, Smartphone } from 'lucide-react';
import { useForm, router } from '@inertiajs/react';
import { toast } from '@/components/ui/toast';

interface NotificationType {
    label: string;
    description: string;
    audience: string[];
    channels: string[];
    default_enabled: string[];
    mandatory: boolean;
}

interface Category {
    label: string;
    types: Record<string, NotificationType>;
}

interface Props {
    categories: Record<string, Category>;
    preferences: Record<string, Record<string, boolean>>;
    smsEnabled: boolean;
    hasPhone: boolean;
    updateUrl: string;
}

export function NotificationSettingsMatrix({ categories, preferences, smsEnabled, hasPhone, updateUrl }: Props) {
    const handleToggle = (type: string, channel: string, currentEnabled: boolean, mandatory: boolean) => {
        if (mandatory && currentEnabled && channel === 'database') {
            toast.add({
                title: 'Cannot disable',
                description: 'This is a mandatory notification channel.',
                type: 'error',
            });
            return;
        }
        if ((channel === 'sms' || channel === 'whatsapp') && !hasPhone) {
            toast.add({
                title: 'Phone number required',
                description: 'Please add a phone number in your profile to enable SMS or WhatsApp notifications.',
                type: 'error',
            });
            return;
        }
        if (channel === 'sms' && !smsEnabled) {
            return; // Globally disabled
        }

        const newEnabled = !currentEnabled;
        
        router.put(updateUrl, { type, channel, enabled: newEnabled }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.add({ title: "Preferences saved" });
            },
            onError: () => {
                toast.add({ title: "Failed to save preference", type: 'error' });
            }
        });
    };

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case 'mail': return <Mail className="h-4 w-4" />;
            case 'database': return <Bell className="h-4 w-4" />;
            case 'whatsapp': return <MessageCircle className="h-4 w-4 text-green-500" />;
            case 'sms': return <Smartphone className="h-4 w-4" />;
            default: return null;
        }
    };

    const getChannelLabel = (channel: string) => {
        switch (channel) {
            case 'mail': return 'Email';
            case 'database': return 'In-app';
            case 'whatsapp': return 'WhatsApp';
            case 'sms': return 'SMS';
            default: return channel;
        }
    };

    return (
        <TooltipProvider>
            <div className="space-y-8">
                {Object.entries(categories).map(([catKey, category]) => (
                    <div key={catKey} className="space-y-4">
                        <h3 className="text-lg font-semibold tracking-tight">{category.label}</h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(category.types).map(([typeKey, typeInfo]) => (
                                <Card key={typeKey}>
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-base flex items-center justify-between">
                                            {typeInfo.label}
                                            {typeInfo.mandatory && (
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Mandatory notification</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </CardTitle>
                                        <CardDescription>{typeInfo.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 space-y-4">
                                        {['database', 'mail', 'whatsapp', 'sms'].map(channel => {
                                            if (!typeInfo.channels.includes(channel)) return null;

                                            const isEnabled = preferences[typeKey]?.[channel] ?? false;
                                            const isMandatoryDatabase = typeInfo.mandatory && channel === 'database';
                                            const isDisabledSms = channel === 'sms' && !smsEnabled;
                                            const needsPhone = (channel === 'sms' || channel === 'whatsapp') && !hasPhone;

                                            return (
                                                <div key={channel} className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        {getChannelIcon(channel)}
                                                        <Label className="text-sm font-medium leading-none">
                                                            {getChannelLabel(channel)}
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {isDisabledSms ? (
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <Switch disabled checked={false} />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>SMS notifications are currently disabled by the system.</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ) : (
                                                            <Switch 
                                                                checked={isEnabled} 
                                                                disabled={isMandatoryDatabase}
                                                                onCheckedChange={() => handleToggle(typeKey, channel, isEnabled, typeInfo.mandatory)}
                                                            />
                                                        )}
                                                        {needsPhone && (
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Requires a verified phone number in profile.</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </TooltipProvider>
    );
}
