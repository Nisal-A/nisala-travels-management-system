<?php

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\TourPackage;
use App\Models\BookingReminder;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\DB;
use App\Events\TripReminderDue;

beforeEach(function () {
    DB::table('booking_reminders')->truncate();
    Booking::query()->forceDelete();
});

test('trip reminder command sends for 14 days and skips cancelled', function () {
    Event::fake([TripReminderDue::class]);

    $customer = Customer::factory()->create();
    $tour = TourPackage::factory()->create();

    $booking = Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $tour->id,
        'booking_status' => BookingStatus::Confirmed,
        'travel_date' => now()->addDays(14),
    ]);

    $cancelledBooking = Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $tour->id,
        'booking_status' => BookingStatus::Cancelled,
        'travel_date' => now()->addDays(14),
    ]);

    $this->artisan('notifications:trip-reminders')->assertExitCode(0);

    Event::assertDispatched(TripReminderDue::class, function ($event) use ($booking) {
        return $event->booking->id === $booking->id && $event->daysBefore === 14;
    });

    Event::assertNotDispatched(TripReminderDue::class, function ($event) use ($cancelledBooking) {
        return $event->booking->id === $cancelledBooking->id;
    });
});

test('trip reminder command prevents duplicate sends', function () {
    Event::fake([TripReminderDue::class]);

    $customer = Customer::factory()->create();
    $tour = TourPackage::factory()->create();

    $booking = Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $tour->id,
        'booking_status' => BookingStatus::Confirmed,
        'travel_date' => now()->addDays(7),
    ]);

    // Run first time
    $this->artisan('notifications:trip-reminders')->assertExitCode(0);
    
    Event::assertDispatched(TripReminderDue::class, 1);
    
    // Check DB record
    expect(BookingReminder::where('booking_id', $booking->id)->where('days_before', 7)->exists())->toBeTrue();

    // Clear recorded events
    Event::fake([TripReminderDue::class]);

    // Run second time
    $this->artisan('notifications:trip-reminders')->assertExitCode(0);

    // Should not dispatch again
    Event::assertNotDispatched(TripReminderDue::class);
});
