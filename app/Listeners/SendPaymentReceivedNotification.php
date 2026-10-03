<?php

namespace App\Listeners;

use \App\Events\PaymentReceived;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SendPaymentReceivedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(\App\Events\PaymentReceived $event): void
    {
        Notification::send(\App\Services\NotificationRecipients::getCustomer($event->payment->customer), new \App\Notifications\PaymentReceivedNotification($event->payment));
    }
}
