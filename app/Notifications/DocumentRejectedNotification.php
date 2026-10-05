<?php

namespace App\Notifications;

use App\Models\CustomerDocument;
use App\Services\NotificationGate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

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
        return NotificationGate::resolveChannels($notifiable, 'DocumentRejectedNotification');
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Action Required: Document Update Needed')
            ->view('emails.document.rejected', [
                'document' => $this->document,
                'customerName' => $notifiable->full_name ?? 'Valued Customer',
                'travelerName' => $this->document->traveler->full_name ?? null,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'DocumentRejectedNotification',
            'title' => 'Document Rejected',
            'body' => 'Your document ('.($this->document->documentType->name ?? 'Document').') was rejected. Reason: '.$this->document->rejection_reason,
            'url' => config('app.url').'/portal/documents/'.$this->document->id,
            'icon' => 'x-circle',
            'severity' => 'error',
            'data' => [
                'id' => $this->document->id,
            ],
        ];
    }
}
