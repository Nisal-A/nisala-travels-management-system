<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Services\NotificationGate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingConfirmedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    public function via(object $notifiable): array
    {
        return NotificationGate::resolveChannels($notifiable, 'BookingConfirmedNotification');
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(strip_tags('Booking Confirmed'))
            ->greeting('Hello!')
            ->line('Your booking (Ref: '.$this->booking->booking_reference.') has been confirmed.')
            ->action('View Details', config('app.url').'/portal/bookings/'.$this->booking->id);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'BookingConfirmedNotification',
            'title' => 'Booking Confirmed',
            'body' => 'Your booking (Ref: '.$this->booking->booking_reference.') has been confirmed.',
            'url' => config('app.url').'/portal/bookings/'.$this->booking->id,
            'icon' => 'check-circle',
            'severity' => 'success',
            'data' => [
                'id' => $this->booking->id,
            ],
        ];
    }
}
