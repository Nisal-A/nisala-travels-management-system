<?php

namespace App\Listeners;

use \App\Events\PaymentOverdue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SendPaymentOverdueNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(\App\Events\PaymentOverdue $event): void
    {
        Notification::send(\App\Services\NotificationRecipients::getCustomer($event->installment->booking->customer), new \App\Notifications\PaymentOverdueNotification($event->installment));
    }
}
