<?php

namespace App\Listeners;

use App\Events\BookingConfirmed;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

use App\Contracts\NotificationServiceInterface;
use App\Notifications\BookingConfirmedNotification;

class SendBookingConfirmedNotification implements ShouldQueue
{
    public $notificationService;
    /**
     * Create the event listener.
     */
    public function __construct(NotificationServiceInterface $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Handle the event.
     */
    public function handle(BookingConfirmed $event): void
    {
        $booking = $event->booking;
        if ($booking && $booking->customer) {
            $this->notificationService->send(
                $booking->customer,
                new BookingConfirmedNotification($booking)
            );
        }
    }
}
