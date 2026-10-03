<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Customer;

class NewInquiryNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $lead;

    public function __construct(Customer $lead)
    {
        $this->lead = $lead;
    }

    public function via(object $notifiable): array
    {
        return \App\Services\NotificationGate::resolveChannels($notifiable, 'NewInquiryNotification');
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(strip_tags("New Inquiry Submitted"))
            ->greeting('Hello!')
            ->line("A new inquiry was submitted by " . $this->lead->full_name . ".")
            ->action('View Details', config("app.url") . "/admin/inquiries/" . $this->lead->id);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'NewInquiryNotification',
            'title' => "New Inquiry Submitted",
            'body' => "A new inquiry was submitted by " . $this->lead->full_name . ".",
            'url' => config("app.url") . "/admin/inquiries/" . $this->lead->id,
            'icon' => "inbox",
            'severity' => "info",
            'data' => [
                'id' => $this->lead->id,
            ],
        ];
    }
}
