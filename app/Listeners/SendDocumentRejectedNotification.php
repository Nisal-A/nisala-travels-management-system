<?php

namespace App\Listeners;

use App\Events\DocumentRejected;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

use App\Contracts\NotificationServiceInterface;
use App\Notifications\DocumentRejectedNotification;

class SendDocumentRejectedNotification implements ShouldQueue
{
    public $notificationService;
    /**
     * Create the event listener.
     */
    public function __construct(NotificationServiceInterface $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Handle the event.
     */
    public function handle(DocumentRejected $event): void
    {
        $document = $event->document;
        if ($document && $document->customer) {
            $this->notificationService->send(
                $document->customer,
                new DocumentRejectedNotification($document)
            );
        }
    }
}
