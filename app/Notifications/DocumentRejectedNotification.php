<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\CustomerDocument;

class DocumentRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $document;

    public function __construct(CustomerDocument $document)
    {
        $this->document = $document;
    }

    public function via(object $notifiable): array
    {
        return \App\Services\NotificationGate::resolveChannels($notifiable, 'DocumentRejectedNotification');
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(strip_tags("Document Rejected"))
            ->greeting('Hello!')
            ->line("Your document (" . ($this->document->documentType->name ?? "Document") . ") was rejected. Reason: " . $this->document->rejection_reason)
            ->action('View Details', config("app.url") . "/portal/documents/" . $this->document->id);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'DocumentRejectedNotification',
            'title' => "Document Rejected",
            'body' => "Your document (" . ($this->document->documentType->name ?? "Document") . ") was rejected. Reason: " . $this->document->rejection_reason,
            'url' => config("app.url") . "/portal/documents/" . $this->document->id,
            'icon' => "x-circle",
            'severity' => "error",
            'data' => [
                'id' => $this->document->id,
            ],
        ];
    }
}
