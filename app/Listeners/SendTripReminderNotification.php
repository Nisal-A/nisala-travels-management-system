<?php

namespace App\Listeners;

use \App\Events\TripReminderDue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SendTripReminderNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(\App\Events\TripReminderDue $event): void
    {
        Notification::send(\App\Services\NotificationRecipients::getCustomer($event->booking->customer), new \App\Notifications\TripReminderNotification($event->booking));
    }
}
