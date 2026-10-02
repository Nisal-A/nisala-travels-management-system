<?php

namespace App\Listeners;

use App\Events\PaymentReceived;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

use App\Contracts\NotificationServiceInterface;
use App\Notifications\PaymentReceivedNotification;

class SendPaymentReceivedNotification implements ShouldQueue
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
    public function handle(PaymentReceived $event): void
    {
        $payment = $event->payment;
        // Assuming payment belongs to a booking, and booking belongs to a customer
        if ($payment && $payment->booking && $payment->booking->customer) {
            $this->notificationService->send(
                $payment->booking->customer,
                new PaymentReceivedNotification($payment)
            );
        }
    }
}
