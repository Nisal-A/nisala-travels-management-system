<?php

namespace App\Listeners;

use App\Events\DocumentVerified;
use App\Notifications\DocumentVerifiedNotification;
use App\Services\NotificationRecipients;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SendDocumentVerifiedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(DocumentVerified $event): void
    {
        Notification::send(NotificationRecipients::getCustomer($event->document->customer), new DocumentVerifiedNotification($event->document));
    }
}
