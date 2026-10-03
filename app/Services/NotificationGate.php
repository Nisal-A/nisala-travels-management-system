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
        return ['mail', 'database'];
    }
}
