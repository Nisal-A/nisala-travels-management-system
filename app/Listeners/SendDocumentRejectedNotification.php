<?php

namespace App\Listeners;

use App\Events\DocumentRejected;
use App\Notifications\DocumentRejectedNotification;
use App\Services\NotificationRecipients;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SendDocumentRejectedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(DocumentRejected $event): void
    {
        Notification::send(NotificationRecipients::getCustomer($event->document->customer), new DocumentRejectedNotification($event->document));
    }
}
