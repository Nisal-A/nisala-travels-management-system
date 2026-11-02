<?php

namespace App\Notifications;

use App\Models\Refund;
use App\Services\NotificationGate;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RefundStatusNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Refund $refund,
        public string $action = 'updated'
    ) {}

    public function via(object $notifiable): array
    {
        return NotificationGate::resolveChannels($notifiable, 'RefundStatusNotification');
    }

    public function toMail(object $notifiable): MailMessage
    {
        $statusStr = is_string($this->refund->status) ? $this->refund->status : $this->refund->status->value;

        return (new MailMessage)
            ->subject("Refund Notification: {$this->refund->refund_number}")
            ->greeting('Hello!')
            ->line("Refund {$this->refund->refund_number} has been {$statusStr}.")
            ->line("Amount: " . number_format((float) $this->refund->amount, 2) . " {$this->refund->currency}")
            ->action('View Refund Details', url("/refunds/{$this->refund->id}"));
    }

    public function toArray(object $notifiable): array
    {
        $statusStr = is_string($this->refund->status) ? $this->refund->status : $this->refund->status->value;

        return [
            'type' => 'RefundStatusNotification',
            'title' => 'Refund ' . ucfirst($statusStr),
            'body' => "Refund {$this->refund->refund_number} for " . number_format((float) $this->refund->amount, 2) . " {$this->refund->currency} has been {$statusStr}.",
            'url' => "/refunds/{$this->refund->id}",
            'icon' => 'rotate-ccw',
            'severity' => match ($statusStr) {
                'approved', 'paid' => 'success',
                'rejected' => 'error',
                default => 'info',
            },
            'data' => [
                'id' => $this->refund->id,
                'refund_number' => $this->refund->refund_number,
                'status' => $statusStr,
            ],
        ];
    }
}
