<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\PaymentSchedule;

class PaymentOverdueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $installment;

    public function __construct(PaymentSchedule $installment)
    {
        $this->installment = $installment;
    }

    public function via(object $notifiable): array
    {
        return \App\Services\NotificationGate::resolveChannels($notifiable, 'PaymentOverdueNotification');
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(strip_tags("Payment Overdue"))
            ->greeting('Hello!')
            ->line("Your installment of " . number_format($this->installment->amount, 2) . " was due on " . $this->installment->due_date . ".")
            ->action('View Details', config("app.url") . "/portal/bookings/" . $this->installment->booking_id . "/payments");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'PaymentOverdueNotification',
            'title' => "Payment Overdue",
            'body' => "Your installment of " . number_format($this->installment->amount, 2) . " was due on " . $this->installment->due_date . ".",
            'url' => config("app.url") . "/portal/bookings/" . $this->installment->booking_id . "/payments",
            'icon' => "alert-triangle",
            'severity' => "warning",
            'data' => [
                'id' => $this->installment->id,
            ],
        ];
    }
}
