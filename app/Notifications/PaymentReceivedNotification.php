<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Payment;

class PaymentReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $payment;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    public function via(object $notifiable): array
    {
        return \App\Services\NotificationGate::resolveChannels($notifiable, 'PaymentReceivedNotification');
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(strip_tags("Payment Received"))
            ->greeting('Hello!')
            ->line("We have received your payment of " . number_format($this->payment->amount, 2) . " " . $this->payment->currency . ".")
            ->action('View Details', config("app.url") . "/portal/payments/" . $this->payment->id);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'PaymentReceivedNotification',
            'title' => "Payment Received",
            'body' => "We have received your payment of " . number_format($this->payment->amount, 2) . " " . $this->payment->currency . ".",
            'url' => config("app.url") . "/portal/payments/" . $this->payment->id,
            'icon' => "credit-card",
            'severity' => "info",
            'data' => [
                'id' => $this->payment->id,
            ],
        ];
    }
}
