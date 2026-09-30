<?php

use App\Enums\UserRole;
use App\Models\User;
use App\Models\Customer;
use App\Models\TourPackage;
use App\Models\Booking;
use App\Models\BookingTraveler;
use App\Enums\BookingStatus;
use App\Enums\TravelerType;

beforeEach(function () {
    $this->seed(\Database\Seeders\RoleSeeder::class);

    $this->superAdmin = User::factory()->superAdmin()->create();
    $this->manager = User::factory()->manager()->create();
    $this->staff = User::factory()->staff()->create();
    
    $this->customerUser = User::factory()->customer()->create();
    $this->otherCustomerUser = User::factory()->customer()->create();

    $this->customer = Customer::factory()->create(['user_id' => $this->customerUser->id]);
    $this->otherCustomer = Customer::factory()->create(['user_id' => $this->otherCustomerUser->id]);

    $this->package = TourPackage::factory()->create(['capacity' => 20, 'price' => 1000]);
});

test('manager can create a booking', function () {
    $payload = [
        'customer_id' => $this->customer->id,
        'tour_package_id' => $this->package->id,
        'booking_date' => now()->format('Y-m-d'),
        'travel_date' => now()->addDays(10)->format('Y-m-d'),
        'discount_amount' => 100,
        'notes' => 'Test booking',
        'travelers' => [
            [
                'full_name' => 'John Doe',
                'traveler_type' => TravelerType::Adult->value,
                'passport_number' => 'AB1234567',
                'passport_expiry' => now()->addYears(2)->format('Y-m-d'),
            ],
            [
                'full_name' => 'Jane Doe',
                'traveler_type' => TravelerType::Adult->value,
            ]
        ]
    ];

    $response = $this->actingAs($this->manager)
        ->post(route('bookings.store'), $payload);

    $response->assertRedirect();
    $this->assertDatabaseHas('bookings', [
        'customer_id' => $this->customer->id,
        'tour_package_id' => $this->package->id,
        'number_of_travelers' => 2,
        'base_amount' => 2000,
        'discount_amount' => 100,
        'final_amount' => 1900,
    ]);
    
    $booking = Booking::first();
    $this->assertCount(2, $booking->travelers);
});

test('customer cannot create a booking', function () {
    $response = $this->actingAs($this->customerUser)
        ->post(route('bookings.store'), []);

    $response->assertForbidden();
});

test('capacity is enforced during creation', function () {
    $this->package->update(['capacity' => 1]);

    $payload = [
        'customer_id' => $this->customer->id,
        'tour_package_id' => $this->package->id,
        'booking_date' => now()->format('Y-m-d'),
        'travel_date' => now()->addDays(10)->format('Y-m-d'),
        'travelers' => [
            ['full_name' => 'John Doe', 'traveler_type' => TravelerType::Adult->value],
            ['full_name' => 'Jane Doe', 'traveler_type' => TravelerType::Adult->value]
        ]
    ];

    $response = $this->actingAs($this->manager)
        ->post(route('bookings.store'), $payload);

    $response->assertSessionHasErrors('travelers');
    $this->assertDatabaseCount('bookings', 0);
});

test('customer cannot access office booking routes', function () {
    $booking1 = Booking::factory()->create(['customer_id' => $this->customer->id]);

    $this->actingAs($this->customerUser)
        ->get(route('bookings.show', $booking1))
        ->assertForbidden();
});

test('manager can update booking status', function () {
    $booking = Booking::factory()->create([
        'customer_id' => $this->customer->id,
        'booking_status' => BookingStatus::Pending
    ]);

    $this->actingAs($this->manager)
        ->patch(route('bookings.status', $booking), [
            'booking_status' => BookingStatus::Confirmed->value
        ])
        ->assertRedirect();

    $this->assertEquals(BookingStatus::Confirmed, $booking->fresh()->booking_status);
});

test('customer cannot update booking status', function () {
    $booking = Booking::factory()->create([
        'customer_id' => $this->customer->id,
        'booking_status' => BookingStatus::Pending
    ]);

    $this->actingAs($this->customerUser)
        ->patch(route('bookings.status', $booking), [
            'booking_status' => BookingStatus::Confirmed->value
        ])
        ->assertForbidden();
});

test('staff can update booking details and travelers', function () {
    $booking = Booking::factory()->create([
        'customer_id' => $this->customer->id,
        'tour_package_id' => $this->package->id,
    ]);
    
    $traveler = BookingTraveler::factory()->create(['booking_id' => $booking->id]);

    $payload = [
        'discount_amount' => 200,
        'travelers' => [
            [
                'id' => $traveler->id,
                'full_name' => 'Updated Name',
                'traveler_type' => TravelerType::Adult->value,
            ],
            [
                'full_name' => 'New Traveler',
                'traveler_type' => TravelerType::Child->value,
            ]
        ]
    ];

    $this->actingAs($this->staff)
        ->put(route('bookings.update', $booking), $payload)
        ->assertRedirect();

    $booking->refresh();
    
    $this->assertEquals(200, $booking->discount_amount);
    $this->assertEquals(2000, $booking->base_amount); // 1000 * 2
    $this->assertEquals(1800, $booking->final_amount);
    $this->assertCount(2, $booking->travelers);
    $this->assertEquals('Updated Name', $booking->travelers->firstWhere('id', $traveler->id)->full_name);
});

