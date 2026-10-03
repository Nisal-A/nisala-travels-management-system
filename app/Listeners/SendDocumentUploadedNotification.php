<?php

namespace App\Listeners;

use App\Events\DocumentUploaded;
use App\Notifications\DocumentUploadedNotification;
use App\Services\NotificationRecipients;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SendDocumentUploadedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(DocumentUploaded $event): void
    {
        Notification::send(NotificationRecipients::getStaffByRole(['Admin', 'Manager']), new DocumentUploadedNotification($event->document));
    }
}
