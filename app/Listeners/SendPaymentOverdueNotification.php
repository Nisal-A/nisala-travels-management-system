<?php

namespace App\Listeners;

use App\Events\PaymentOverdue;
use App\Notifications\PaymentOverdueNotification;
use App\Services\NotificationRecipients;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SendPaymentOverdueNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(PaymentOverdue $event): void
    {
        Notification::send(NotificationRecipients::getCustomer($event->installment->booking->customer), new PaymentOverdueNotification($event->installment));
    }
}
