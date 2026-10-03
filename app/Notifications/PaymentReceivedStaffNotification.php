<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Payment;

class PaymentReceivedStaffNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $payment;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    public function via(object $notifiable): array
    {
        return \App\Services\NotificationGate::resolveChannels($notifiable, 'PaymentReceivedStaffNotification');
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(strip_tags("Payment Received"))
            ->greeting('Hello!')
            ->line("A payment of " . number_format($this->payment->amount, 2) . " " . $this->payment->currency . " was received.")
            ->action('View Details', config("app.url") . "/admin/payments/" . $this->payment->id);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'PaymentReceivedStaffNotification',
            'title' => "Payment Received",
            'body' => "A payment of " . number_format($this->payment->amount, 2) . " " . $this->payment->currency . " was received.",
            'url' => config("app.url") . "/admin/payments/" . $this->payment->id,
            'icon' => "dollar-sign",
            'severity' => "success",
            'data' => [
                'id' => $this->payment->id,
            ],
        ];
    }
}
