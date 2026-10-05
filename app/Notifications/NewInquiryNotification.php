<?php

namespace App\Notifications;

use App\Models\Customer;
use App\Services\NotificationGate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

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
        return NotificationGate::resolveChannels($notifiable, 'NewInquiryNotification');
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
            'title' => 'New Inquiry Submitted',
            'body' => 'A new inquiry was submitted by '.$this->lead->full_name.'.',
            'url' => config('app.url').'/admin/inquiries/'.$this->lead->id,
            'icon' => 'inbox',
            'severity' => 'info',
            'data' => [
                'id' => $this->lead->id,
            ],
        ];
    }
}
