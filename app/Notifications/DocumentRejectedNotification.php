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

    /**
     * Create a new notification instance.
     */
    public function __construct(CustomerDocument $document)
    {
        $this->document = $document;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Document Needs Attention - ' . config('app.name'))
            ->greeting('Hello ' . ($notifiable->full_name ?? 'Customer') . ',')
            ->line('There is an issue with your document: ' . $this->document->documentType?->name)
            ->line('Please review and re-upload the document.')
            ->line('Thank you for choosing ' . config('app.name') . '!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'document_id' => $this->document->id,
            'message' => 'Your document ' . $this->document->documentType?->name . ' needs attention/re-upload.',
        ];
    }
}
