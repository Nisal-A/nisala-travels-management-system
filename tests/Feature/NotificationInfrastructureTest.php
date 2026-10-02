<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\Booking;
use App\Events\PaymentReceived;
use App\Notifications\PaymentReceivedNotification;
use App\Contracts\NotificationServiceInterface;
use Tests\TestCase;

class NotificationInfrastructureTest extends TestCase
{
    use RefreshDatabase;

    public function test_payment_received_event_dispatches_notification()
    {
        Notification::fake();

        // Create mock data without factories (assuming we might not have them)
        $customer = new Customer(['id' => 1, 'email' => 'test@example.com', 'full_name' => 'Test User']);
        $booking = new Booking(['id' => 1]);
        $booking->setRelation('customer', $customer);
        $payment = new Payment(['id' => 1, 'amount' => 1000]);
        $payment->setRelation('booking', $booking);

        // Dispatch Event directly
        $event = new PaymentReceived($payment);
        
        $listener = app(\App\Listeners\SendPaymentReceivedNotification::class);
        $listener->handle($event);

        Notification::assertSentTo(
            [$customer], PaymentReceivedNotification::class
        );
    }

    public function test_notification_service_is_bound_and_sends_notification()
    {
        Notification::fake();

        $service = app(NotificationServiceInterface::class);
        $this->assertInstanceOf(\App\Services\NotificationService::class, $service);

        $customer = new Customer(['id' => 1, 'email' => 'test@example.com', 'full_name' => 'Test User']);
        $payment = new Payment(['id' => 1, 'amount' => 500]);
        
        $service->send($customer, new PaymentReceivedNotification($payment));

        Notification::assertSentTo(
            [$customer], PaymentReceivedNotification::class
        );
    }
}
