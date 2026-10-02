<?php

namespace App\Listeners;

use App\Events\InquirySubmitted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

use App\Contracts\NotificationServiceInterface;
use App\Notifications\InquirySubmittedNotification;
use Illuminate\Support\Facades\Notification;

class SendInquirySubmittedNotification implements ShouldQueue
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
    public function handle(InquirySubmitted $event): void
    {
        $inquiry = $event->inquiry;
        $notification = new InquirySubmittedNotification($inquiry);
        
        if ($inquiry->customer) {
            $this->notificationService->send($inquiry->customer, $notification);
        } elseif (filter_var($inquiry->contact_information, FILTER_VALIDATE_EMAIL)) {
            // Send on-demand notification to the email provided in the contact_information
            Notification::route('mail', $inquiry->contact_information)
                        ->notify($notification);
        }
    }
}
