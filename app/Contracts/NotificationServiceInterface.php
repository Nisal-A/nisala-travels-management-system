<?php

namespace App\Contracts;

interface NotificationServiceInterface
{
    /**
     * Send a notification to a notifiable entity.
     *
     * @param mixed $notifiable
     * @param mixed $notification
     * @return void
     */
    public function send($notifiable, $notification): void;
}
