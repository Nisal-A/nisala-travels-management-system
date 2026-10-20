<?php

namespace App\Notifications;

use App\Models\Inquiry;
use App\Services\NotificationGate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewInquiryNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $lead;

    public function __construct(Inquiry $lead)
    {
        $this->lead = $lead;
    }

    public function via(object $notifiable): array
    {
        return NotificationGate::resolveChannels($notifiable, 'new_inquiry');
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Inquiry Received')
            ->view('emails.staff.new_inquiry', [
                'lead' => $this->lead,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'NewInquiryNotification',
            'title' => 'New enquiry received',
            'body' => "{$this->lead->name} asked about {$this->lead->interest}. Reference {$this->lead->reference}.",
            'url' => "/admin/inquiries/{$this->lead->id}",
            'icon' => 'inbox',
            'severity' => 'info',
            'data' => [
                'id' => $this->lead->id,
                'reference' => $this->lead->reference,
            ],
        ];
    }
}
