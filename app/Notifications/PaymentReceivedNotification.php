<?php

namespace App\Notifications;

use App\Models\Payment;
use App\Services\NotificationGate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

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
        return NotificationGate::resolveChannels($notifiable, 'PaymentReceivedNotification');
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Payment Receipt: ' . number_format($this->payment->amount, 2) . ' ' . $this->payment->currency)
            ->view('emails.payment.receipt', [
                'payment' => $this->payment,
                'customerName' => $notifiable->full_name ?? 'Valued Customer',
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'PaymentReceivedNotification',
            'title' => 'Payment Received',
            'body' => 'We have received your payment of '.number_format($this->payment->amount, 2).' '.$this->payment->currency.'.',
            'url' => config('app.url').'/portal/payments/'.$this->payment->id,
            'icon' => 'credit-card',
            'severity' => 'info',
            'data' => [
                'id' => $this->payment->id,
            ],
        ];
    }
}
