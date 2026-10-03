<?php

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\TourPackage;
use App\Models\User;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->manager = User::factory()->manager()->create();
    $this->staff = User::factory()->staff()->create();

    $this->customer = Customer::factory()->create();
    $this->package = TourPackage::factory()->create(['capacity' => 20, 'price' => 1000]);
});

test('cannot transition completed booking back to pending', function () {
    $booking = Booking::factory()->create([
        'customer_id' => $this->customer->id,
        'booking_status' => BookingStatus::Completed,
    ]);

    $this->actingAs($this->manager)
        ->patch(route('bookings.status', $booking), [
            'booking_status' => BookingStatus::Pending->value,
        ])
        ->assertSessionHasErrors('error');
});

test('manager can cancel pending booking', function () {
    $booking = Booking::factory()->create([
        'customer_id' => $this->customer->id,
        'booking_status' => BookingStatus::Pending,
    ]);

    $this->actingAs($this->manager)
        ->patch(route('bookings.status', $booking), [
            'booking_status' => BookingStatus::Cancelled->value,
        ])
        ->assertSessionHasNoErrors();

    $this->assertEquals(BookingStatus::Cancelled, $booking->fresh()->booking_status);
});

test('cannot update completed or cancelled booking', function () {
    $booking = Booking::factory()->create([
        'customer_id' => $this->customer->id,
        'booking_status' => BookingStatus::Completed,
        'tour_package_id' => $this->package->id,
    ]);

    $this->actingAs($this->manager)
        ->put(route('bookings.update', $booking), [
            'customer_id' => $this->customer->id,
            'tour_package_id' => $this->package->id,
            'booking_date' => now()->format('Y-m-d'),
            'travel_date' => now()->addDays(10)->format('Y-m-d'),
            'travelers' => [['full_name' => 'John', 'traveler_type' => 'adult']],
        ])
        ->assertSessionHasErrors('error');
});

test('cannot change tour package on confirmed booking', function () {
    $booking = Booking::factory()->create([
        'customer_id' => $this->customer->id,
        'booking_status' => BookingStatus::Confirmed,
        'tour_package_id' => $this->package->id,
    ]);

    $otherPackage = TourPackage::factory()->create(['capacity' => 10]);

    $this->actingAs($this->manager)
        ->put(route('bookings.update', $booking), [
            'customer_id' => $this->customer->id,
            'tour_package_id' => $otherPackage->id,
            'booking_date' => now()->format('Y-m-d'),
            'travel_date' => now()->addDays(10)->format('Y-m-d'),
        ])
        ->assertSessionHasErrors('error');
});
