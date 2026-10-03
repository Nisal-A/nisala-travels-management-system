<?php

namespace App\Listeners;

use \App\Events\PaymentReceived;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SendPaymentReceivedStaffNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(\App\Events\PaymentReceived $event): void
    {
        Notification::send(\App\Services\NotificationRecipients::getStaffByRole(['Finance', 'Admin']), new \App\Notifications\PaymentReceivedStaffNotification($event->payment));
    }
}
