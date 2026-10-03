<?php

namespace App\Listeners;

use App\Events\BookingConfirmed;
use App\Notifications\BookingConfirmedNotification;
use App\Services\NotificationRecipients;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SendBookingConfirmedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(BookingConfirmed $event): void
    {
        Notification::send(NotificationRecipients::getCustomer($event->booking->customer), new BookingConfirmedNotification($event->booking));
    }
}
