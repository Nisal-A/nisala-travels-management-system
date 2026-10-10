<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use App\Contracts\MessagingProvider;
use Illuminate\Support\Facades\DB;

class MessagingChannel
{
    protected MessagingProvider $provider;

    public function __construct(MessagingProvider $provider)
    {
        $this->provider = $provider;
    }

    public function send(object $notifiable, Notification $notification): void
    {
        if (!config('messaging.sms_enabled', false)) {
            return;
        }

        // Must have phone number
        $phone = $notifiable->phone ?? null;
        if (!$phone) {
            return;
        }

        // Normalize phone to E.164 (simplified for Sri Lanka as example, though requirements just say +94...)
        $normalizedPhone = preg_replace('/^0/', '+94', $phone);
        
        // Notification class should have toMessaging method
        if (!method_exists($notification, 'toMessaging')) {
            return;
        }

        $messageData = $notification->toMessaging($notifiable);
        $message = $messageData['message'] ?? '';
        $channel = $messageData['channel'] ?? 'sms'; // or whatsapp
        $options = $messageData['options'] ?? [];

        // Truncate or template based on channel
        if ($channel === 'sms' && mb_strlen($message) > 160) {
            $message = mb_substr($message, 0, 157) . '...';
        }

        try {
            $result = $this->provider->send($normalizedPhone, $message, $options);
            
            // Record in notification_logs
            DB::table('notification_logs')->insert([
                'notification_id' => $notification->id ?? null,
                'notifiable_type' => get_class($notifiable),
                'notifiable_id' => $notifiable->id,
                'type' => get_class($notification),
                'channel' => $channel,
                'status' => $result->success ? 'sent' : 'failed',
                'error' => $result->error,
                'sent_at' => $result->success ? now() : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

        } catch (\Exception $e) {
            DB::table('notification_logs')->insert([
                'notification_id' => $notification->id ?? null,
                'notifiable_type' => get_class($notifiable),
                'notifiable_id' => $notifiable->id,
                'type' => get_class($notification),
                'channel' => $channel,
                'status' => 'failed',
                'error' => $e->getMessage(),
                'sent_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
