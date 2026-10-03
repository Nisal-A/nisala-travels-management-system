<?php

namespace App\Listeners;

use Illuminate\Notifications\Events\NotificationSent;
use Illuminate\Notifications\Events\NotificationFailed;
use App\Models\NotificationLog;
use Illuminate\Events\Dispatcher;

class LogNotificationDelivery
{
    public function handleSent(NotificationSent $event)
    {
        $this->log($event, 'sent');
    }

    public function handleFailed(NotificationFailed $event)
    {
        $this->log($event, 'failed', $event->data['message'] ?? 'Failed to send notification');
    }

    protected function log($event, $status, $error = null)
    {
        $notifiable = $event->notifiable;
        $notifiableType = is_object($notifiable) && method_exists($notifiable, 'getMorphClass') 
            ? $notifiable->getMorphClass() 
            : (is_object($notifiable) ? get_class($notifiable) : null);
        
        $notifiableId = is_object($notifiable) && isset($notifiable->id) ? $notifiable->id : null;

        if ($notifiable instanceof \Illuminate\Notifications\AnonymousNotifiable) {
            $notifiableType = 'Anonymous';
            $routes = $notifiable->routes;
            $notifiableId = is_array($routes) ? implode(', ', array_values($routes)) : null;
        }

        NotificationLog::create([
            'notification_id' => method_exists($event->notification, 'id') ? clone $event->notification->id : null,
            'notifiable_type' => $notifiableType,
            'notifiable_id' => (string)$notifiableId,
            'type' => get_class($event->notification),
            'channel' => $event->channel,
            'status' => $status,
            'error' => $error,
            'sent_at' => $status === 'sent' ? now() : null,
        ]);
    }

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            NotificationSent::class,
            [LogNotificationDelivery::class, 'handleSent']
        );

        $events->listen(
            NotificationFailed::class,
            [LogNotificationDelivery::class, 'handleFailed']
        );
    }
}
