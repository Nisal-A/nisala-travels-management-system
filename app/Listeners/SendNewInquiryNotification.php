<?php

namespace App\Listeners;

use App\Enums\UserRole;
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
        Notification::send(
            NotificationRecipients::getStaffByRole([
                UserRole::SuperAdmin,
                UserRole::Manager,
                UserRole::Staff,
            ]),
            new NewInquiryNotification($event->lead)
        );
    }
}
