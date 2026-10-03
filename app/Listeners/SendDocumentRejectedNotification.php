<?php

namespace App\Listeners;

use \App\Events\DocumentRejected;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SendDocumentRejectedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(\App\Events\DocumentRejected $event): void
    {
        Notification::send(\App\Services\NotificationRecipients::getCustomer($event->document->customer), new \App\Notifications\DocumentRejectedNotification($event->document));
    }
}
