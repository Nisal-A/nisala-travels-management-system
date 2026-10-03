<?php

namespace App\Listeners;

use \App\Events\BookingConfirmed;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SendBookingConfirmedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(\App\Events\BookingConfirmed $event): void
    {
        Notification::send(\App\Services\NotificationRecipients::getCustomer($event->booking->customer), new \App\Notifications\BookingConfirmedNotification($event->booking));
    }
}
