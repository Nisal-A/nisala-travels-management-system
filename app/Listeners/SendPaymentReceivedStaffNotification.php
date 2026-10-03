<?php

namespace App\Listeners;

use App\Events\PaymentReceived;
use App\Notifications\PaymentReceivedStaffNotification;
use App\Services\NotificationRecipients;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SendPaymentReceivedStaffNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(PaymentReceived $event): void
    {
        Notification::send(NotificationRecipients::getStaffByRole(['Finance', 'Admin']), new PaymentReceivedStaffNotification($event->payment));
    }
}
