<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Services\NotificationGate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TripReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    public function via(object $notifiable): array
    {
        return NotificationGate::resolveChannels($notifiable, 'TripReminderNotification');
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(strip_tags('Upcoming Trip Reminder'))
            ->greeting('Hello!')
            ->line('Your trip to '.($this->booking->tourPackage->name ?? 'Destination').' is coming up on '.$this->booking->travel_date.'!')
            ->action('View Details', config('app.url').'/portal/bookings/'.$this->booking->id);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'TripReminderNotification',
            'title' => 'Upcoming Trip Reminder',
            'body' => 'Your trip to '.($this->booking->tourPackage->name ?? 'Destination').' is coming up on '.$this->booking->travel_date.'!',
            'url' => config('app.url').'/portal/bookings/'.$this->booking->id,
            'icon' => 'calendar',
            'severity' => 'info',
            'data' => [
                'id' => $this->booking->id,
            ],
        ];
    }
}
