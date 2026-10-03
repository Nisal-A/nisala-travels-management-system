<?php

namespace App\Notifications;

use App\Models\CustomerDocument;
use App\Services\NotificationGate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DocumentVerifiedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $document;

    public function __construct(CustomerDocument $document)
    {
        $this->document = $document;
    }

    public function via(object $notifiable): array
    {
        return NotificationGate::resolveChannels($notifiable, 'DocumentVerifiedNotification');
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(strip_tags('Document Verified'))
            ->greeting('Hello!')
            ->line('Your document ('.($this->document->documentType->name ?? 'Document').') has been verified.')
            ->action('View Details', config('app.url').'/portal/documents/'.$this->document->id);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'DocumentVerifiedNotification',
            'title' => 'Document Verified',
            'body' => 'Your document ('.($this->document->documentType->name ?? 'Document').') has been verified.',
            'url' => config('app.url').'/portal/documents/'.$this->document->id,
            'icon' => 'shield-check',
            'severity' => 'success',
            'data' => [
                'id' => $this->document->id,
            ],
        ];
    }
}
