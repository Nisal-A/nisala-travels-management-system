<?php

namespace App\Services;

class NotificationGate
{
    /**
     * Resolve the notification channels for the given user and notification class.
     * For now it returns defaults (mail + database for everyone).
     * Part D will back it with saved preferences, so keep this as the single place channel selection happens.
     */
    public static function resolveChannels(object $notifiable, string $notificationType): array
    {
        $config = self::getNotificationConfig($notificationType);
        if (!$config) {
            return ['mail', 'database']; // Fallback
        }

        $availableChannels = $config['channels'] ?? [];
        $mandatory = $config['mandatory'] ?? false;

        $cacheKey = "user_{$notifiable->id}_notification_prefs";
        $preferences = \Illuminate\Support\Facades\Cache::rememberForever($cacheKey, function () use ($notifiable) {
            return \App\Models\NotificationPreference::where('user_id', $notifiable->id)
                ->get()
                ->keyBy(function ($item) {
                    return $item->type . '_' . $item->channel;
                });
        });

        $resolvedChannels = [];

        foreach ($availableChannels as $channel) {
            $prefKey = $notificationType . '_' . $channel;
            
            if ($preferences->has($prefKey)) {
                if ($preferences->get($prefKey)->enabled) {
                    $resolvedChannels[] = $channel;
                }
            } else {
                // Check if channel is default enabled
                if (in_array($channel, $config['default_enabled'] ?? [])) {
                    $resolvedChannels[] = $channel;
                }
            }
        }

        // Enforce mandatory rule: At minimum, database must be on for mandatory notifications
        if ($mandatory && empty($resolvedChannels)) {
            $resolvedChannels[] = 'database';
        } elseif ($mandatory && !in_array('database', $resolvedChannels)) {
            // Wait, does it strictly have to be 'database', or just ANY channel?
            // "at minimum the in-app channel stays on"
            $resolvedChannels[] = 'database';
        }

        // Filter out SMS if feature flag is disabled
        if (in_array('sms', $resolvedChannels) && !config('messaging.sms_enabled', false)) {
            $resolvedChannels = array_diff($resolvedChannels, ['sms']);
        }
        
        return array_values(array_unique($resolvedChannels));
    }

    public static function getNotificationConfig(string $type): ?array
    {
        $categories = config('notification_types.categories', []);
        foreach ($categories as $category) {
            if (isset($category['types'][$type])) {
                return $category['types'][$type];
            }
        }
        return null;
    }
}
