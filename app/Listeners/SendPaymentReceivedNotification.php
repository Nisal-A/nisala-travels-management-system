<?php

namespace App\Listeners;

use App\Events\PaymentReceived;
use App\Notifications\PaymentReceivedNotification;
use App\Services\NotificationRecipients;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SendPaymentReceivedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(PaymentReceived $event): void
    {
        Notification::send(NotificationRecipients::getCustomer($event->payment->customer), new PaymentReceivedNotification($event->payment));
    }
}
