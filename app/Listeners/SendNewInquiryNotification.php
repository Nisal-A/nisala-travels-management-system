<?php

namespace App\Listeners;

use \App\Events\InquirySubmitted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SendNewInquiryNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(\App\Events\InquirySubmitted $event): void
    {
        Notification::send(\App\Services\NotificationRecipients::getStaffByRole(['Sales', 'Admin']), new \App\Notifications\NewInquiryNotification($event->lead));
    }
}
