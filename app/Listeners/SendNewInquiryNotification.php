<?php

namespace App\Listeners;

use App\Events\InquirySubmitted;
use App\Notifications\NewInquiryNotification;
use App\Services\NotificationRecipients;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SendNewInquiryNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(InquirySubmitted $event): void
    {
        Notification::send(NotificationRecipients::getStaffByRole(['Sales', 'Admin']), new NewInquiryNotification($event->lead));
    }
}
