<?php

namespace App\Notifications;

use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InquirySubmittedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $inquiry;

    /**
     * Create a new notification instance.
     */
    public function __construct(Inquiry $inquiry)
    {
        $this->inquiry = $inquiry;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // For on-demand notifications, notifiable might be an AnonymousNotifiable
        if (get_class($notifiable) === 'Illuminate\Notifications\AnonymousNotifiable') {
            return ['mail'];
        }

        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $name = $this->inquiry->name;
        if (get_class($notifiable) !== 'Illuminate\Notifications\AnonymousNotifiable' && isset($notifiable->full_name)) {
            $name = $notifiable->full_name;
        }

        return (new MailMessage)
            ->subject('Inquiry Received - '.config('app.name'))
            ->greeting('Hello '.$name.',')
            ->line('We have successfully received your inquiry.')
            ->line('Our team will get back to you shortly.')
            ->line('Thank you for choosing '.config('app.name').'!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'inquiry_id' => $this->inquiry->id,
            'message' => 'Your inquiry has been received and is being processed.',
        ];
    }
}
