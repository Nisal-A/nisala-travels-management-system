<?php

namespace App\Notifications;

use App\Models\CustomerDocument;
use App\Services\NotificationGate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DocumentUploadedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $document;

    public function __construct(CustomerDocument $document)
    {
        $this->document = $document;
    }

    public function via(object $notifiable): array
    {
        return NotificationGate::resolveChannels($notifiable, 'DocumentUploadedNotification');
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(strip_tags('Document Uploaded'))
            ->greeting('Hello!')
            ->line('Customer uploaded a new document ('.($this->document->documentType->name ?? 'Document').').')
            ->action('View Details', config('app.url').'/admin/documents/'.$this->document->id);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'DocumentUploadedNotification',
            'title' => 'Document Uploaded',
            'body' => 'Customer uploaded a new document ('.($this->document->documentType->name ?? 'Document').').',
            'url' => config('app.url').'/admin/documents/'.$this->document->id,
            'icon' => 'file-up',
            'severity' => 'info',
            'data' => [
                'id' => $this->document->id,
            ],
        ];
    }
}
