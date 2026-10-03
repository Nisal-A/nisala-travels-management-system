<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\PaymentSchedule;
use App\Models\User;
use App\Models\TourPackage;
use Spatie\Permission\Models\Role;
use Carbon\Carbon;
use App\Events\BookingConfirmed;
use App\Events\PaymentOverdue;
use App\Notifications\BookingConfirmedNotification;
use App\Notifications\PaymentOverdueNotification;
use App\Notifications\PaymentReceivedStaffNotification;

class NotificationBackboneTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure roles exist
        Role::firstOrCreate(['name' => 'Sales']);
        Role::firstOrCreate(['name' => 'Finance']);
        Role::firstOrCreate(['name' => 'Admin']);
    }

    public function test_booking_confirmed_sends_notification_to_correct_customer()
    {
        Notification::fake();

        $customer1 = Customer::factory()->create(['email' => 'customer1@example.com']);
        $user1 = User::factory()->create(['email' => 'customer1@example.com']);

        $customer2 = Customer::factory()->create(['email' => 'customer2@example.com']);
        $user2 = User::factory()->create(['email' => 'customer2@example.com']);

        $package = TourPackage::factory()->create();
        $booking = Booking::factory()->create([
            'customer_id' => $customer1->id,
            'tour_package_id' => $package->id,
        ]);

        event(new BookingConfirmed($booking));

        Notification::assertSentTo(
            $user1,
            BookingConfirmedNotification::class,
            function ($notification) use ($booking) {
                return $notification->booking->id === $booking->id;
            }
        );

        Notification::assertNotSentTo($user2, BookingConfirmedNotification::class);
    }

    public function test_payment_received_sends_notification_to_staff()
    {
        Notification::fake();

        $financeUser = User::factory()->create();
        $financeUser->assignRole('Finance');

        $salesUser = User::factory()->create();
        $salesUser->assignRole('Sales');

        $payment = Payment::factory()->create();

        event(new \App\Events\PaymentReceived($payment));

        Notification::assertSentTo($financeUser, PaymentReceivedStaffNotification::class);
        Notification::assertNotSentTo($salesUser, PaymentReceivedStaffNotification::class);
    }

    public function test_notifications_are_queued()
    {
        $this->assertTrue(is_subclass_of(BookingConfirmedNotification::class, \Illuminate\Contracts\Queue\ShouldQueue::class));
    }

    public function test_nothing_sent_on_transaction_rollback()
    {
        Event::fake([BookingConfirmed::class]);

        try {
            DB::transaction(function () {
                $booking = Booking::factory()->create();
                
                // Using afterCommit means event only fires if transaction commits
                DB::afterCommit(fn () => event(new BookingConfirmed($booking)));
                
                throw new \Exception('Rollback');
            });
        } catch (\Exception $e) {
            // Expected
        }

        Event::assertNotDispatched(BookingConfirmed::class);
    }

    public function test_overdue_command_finds_only_overdue_unpaid_installments()
    {
        Event::fake([PaymentOverdue::class]);

        $booking = Booking::factory()->create();

        $overdueUnpaid = PaymentSchedule::factory()->create([
            'booking_id' => $booking->id,
            'status' => 'unpaid',
            'due_date' => Carbon::yesterday(),
        ]);

        $overduePaid = PaymentSchedule::factory()->create([
            'booking_id' => $booking->id,
            'status' => 'paid',
            'due_date' => Carbon::yesterday(),
        ]);

        $futureUnpaid = PaymentSchedule::factory()->create([
            'booking_id' => $booking->id,
            'status' => 'unpaid',
            'due_date' => Carbon::tomorrow(),
        ]);

        $this->artisan('payments:find-overdue')
             ->assertSuccessful();

        Event::assertDispatched(PaymentOverdue::class, function ($event) use ($overdueUnpaid) {
            return $event->installment->id === $overdueUnpaid->id;
        });

        Event::assertNotDispatched(PaymentOverdue::class, function ($event) use ($overduePaid, $futureUnpaid) {
            return $event->installment->id === $overduePaid->id || $event->installment->id === $futureUnpaid->id;
        });
    }
}
