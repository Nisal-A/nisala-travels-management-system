<?php

namespace App\Listeners;

use \App\Events\DocumentUploaded;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SendDocumentUploadedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(\App\Events\DocumentUploaded $event): void
    {
        Notification::send(\App\Services\NotificationRecipients::getStaffByRole(['Admin', 'Manager']), new \App\Notifications\DocumentUploadedNotification($event->document));
    }
}
