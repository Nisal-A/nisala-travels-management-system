<?php

namespace App\Listeners;

use App\Events\TripReminderDue;
use App\Notifications\TripReminderNotification;
use App\Services\NotificationRecipients;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SendTripReminderNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(TripReminderDue $event): void
    {
        Notification::send(NotificationRecipients::getCustomer($event->booking->customer), new TripReminderNotification($event->booking, $event->daysBefore));
    }
}
