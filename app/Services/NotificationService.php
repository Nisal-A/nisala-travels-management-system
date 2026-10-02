<?php

namespace App\Services;

use App\Contracts\NotificationServiceInterface;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;

class NotificationService implements NotificationServiceInterface
{
    /**
     * Send a notification to a notifiable entity.
     *
     * @param mixed $notifiable
     * @param mixed $notification
     * @return void
     */
    public function send($notifiable, $notification): void
    {
        try {
            Notification::send($notifiable, $notification);
        } catch (\Exception $e) {
            Log::error('Failed to send notification: ' . $e->getMessage(), [
                'notifiable' => $notifiable,
                'notification' => get_class($notification)
            ]);
            
            // Re-throw if it should be handled by the caller or queue, 
            // but usually in a service we might just log or handle failures gracefully
            throw $e;
        }
    }
}
