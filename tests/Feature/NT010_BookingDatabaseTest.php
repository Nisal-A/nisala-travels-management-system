<?php

use App\Enums\BookingStatus;
use App\Enums\TravelerType;
use App\Models\Booking;
use App\Models\BookingTraveler;
use App\Models\Customer;
use App\Models\TourPackage;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

test('booking table has expected columns', function () {
    $this->assertTrue(Schema::hasColumns('bookings', [
        'id', 'booking_reference', 'customer_id', 'tour_package_id',
        'assigned_to', 'booking_date', 'travel_date', 'number_of_travelers',
        'base_amount', 'discount_amount', 'final_amount', 'paid_amount', 'balance_amount',
        'currency', 'booking_status', 'payment_status', 'notes',
        'created_by', 'updated_by', 'created_at', 'updated_at', 'deleted_at',
    ]));
});

test('booking traveler table has expected columns', function () {
    $this->assertTrue(Schema::hasColumns('booking_travelers', [
        'id', 'booking_id', 'customer_id', 'full_name', 'dob', 'gender',
        'nationality', 'nic', 'passport_number', 'passport_expiry',
        'relationship_to_primary', 'traveler_type', 'contact_information',
        'special_requirements', 'notes', 'created_at', 'updated_at',
    ]));
});

test('can create a booking with relationships and calculate balances', function () {
    $customer = Customer::factory()->create();
    $package = TourPackage::factory()->create();
    $user = User::factory()->create();

    $booking = Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $package->id,
        'base_amount' => 1000,
        'discount_amount' => 100,
        'final_amount' => 900,
        'paid_amount' => 400,
        'balance_amount' => 500,
        'booking_status' => BookingStatus::Confirmed,
        'created_by' => $user->id,
    ]);

    $this->assertDatabaseHas('bookings', [
        'id' => $booking->id,
        'customer_id' => $customer->id,
        'base_amount' => 1000.00,
        'booking_status' => 'confirmed',
    ]);

    $this->assertInstanceOf(Customer::class, $booking->customer);
    $this->assertInstanceOf(TourPackage::class, $booking->tourPackage);
    $this->assertInstanceOf(User::class, $booking->createdBy);
});

test('can add multiple travelers to a booking', function () {
    $booking = Booking::factory()->create();

    $traveler1 = BookingTraveler::factory()->create([
        'booking_id' => $booking->id,
        'traveler_type' => TravelerType::Adult,
    ]);

    $traveler2 = BookingTraveler::factory()->create([
        'booking_id' => $booking->id,
        'traveler_type' => TravelerType::Child,
    ]);

    $this->assertCount(2, $booking->travelers);
    $this->assertEquals('adult', $booking->travelers[0]->traveler_type->value);
    $this->assertEquals('child', $booking->travelers[1]->traveler_type->value);
    $this->assertInstanceOf(Booking::class, $traveler1->booking);
});

test('booking reference is unique', function () {
    $booking1 = Booking::factory()->create(['booking_reference' => 'NT-1234']);

    $this->expectException(QueryException::class);

    Booking::factory()->create(['booking_reference' => 'NT-1234']);
});

test('customer has many bookings relationship works', function () {
    $customer = Customer::factory()->create();
    Booking::factory()->count(3)->create(['customer_id' => $customer->id]);

    $this->assertCount(3, $customer->bookings);
});

test('tour package has many bookings relationship works', function () {
    $package = TourPackage::factory()->create();
    Booking::factory()->count(2)->create(['tour_package_id' => $package->id]);

    $this->assertCount(2, $package->bookings);
});

test('booking supports soft deletes', function () {
    $booking = Booking::factory()->create();
    $bookingId = $booking->id;

    $booking->delete();

    $this->assertSoftDeleted('bookings', ['id' => $bookingId]);
});
