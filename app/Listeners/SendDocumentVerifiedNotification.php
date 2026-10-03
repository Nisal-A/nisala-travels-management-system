<?php

namespace App\Listeners;

use \App\Events\DocumentVerified;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SendDocumentVerifiedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(\App\Events\DocumentVerified $event): void
    {
        Notification::send(\App\Services\NotificationRecipients::getCustomer($event->document->customer), new \App\Notifications\DocumentVerifiedNotification($event->document));
    }
}
