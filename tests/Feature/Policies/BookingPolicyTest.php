<?php

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| NT-005.3 Booking Policy Tests
|--------------------------------------------------------------------------
|
| Tests verifying BookingPolicy authorization:
|   - Role-based access for viewAny, view, create, update, cancel
|   - Finance can view bookings (payment context) but not modify
|   - Customer ownership (own bookings only)
|   - Cross-customer IDOR prevention for bookings
|   - Super Admin bypass
|
*/

beforeEach(function () {
    $this->seed(RoleSeeder::class);

    // Create destination and tour package (FK dependencies for bookings)
    DB::table('destinations')->insert([
        'id' => 1,
        'country' => 'Japan',
        'city_region' => 'Tokyo',
        'status' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    DB::table('tour_packages')->insert([
        'id' => 1,
        'destination_id' => 1,
        'package_name' => 'Tokyo Explorer',
        'price' => 250000.00,
        'status' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // Customer A with booking
    $this->customerUserA = User::factory()->customer()->create();
    $this->customerA = Customer::create([
        'user_id' => $this->customerUserA->id,
        'customer_id' => 'CUST-001',
        'full_name' => 'Customer A',
        'phone' => '0771234567',
        'email' => 'customera@example.com',
    ]);
    $this->bookingA = Booking::create([
        'booking_reference' => 'BK-001',
        'customer_id' => $this->customerA->id,
        'tour_package_id' => 1,
        'booking_date' => now()->toDateString(),
        'travel_date' => now()->addMonth()->toDateString(),
    ]);

    // Customer B with booking
    $this->customerUserB = User::factory()->customer()->create();
    $this->customerB = Customer::create([
        'user_id' => $this->customerUserB->id,
        'customer_id' => 'CUST-002',
        'full_name' => 'Customer B',
        'phone' => '0779876543',
        'email' => 'customerb@example.com',
    ]);
    $this->bookingB = Booking::create([
        'booking_reference' => 'BK-002',
        'customer_id' => $this->customerB->id,
        'tour_package_id' => 1,
        'booking_date' => now()->toDateString(),
        'travel_date' => now()->addMonth()->toDateString(),
    ]);
});

// ------------------------------------------------------------------
// Super Admin
// ------------------------------------------------------------------

test('super admin can viewAny bookings', function () {
    $user = User::factory()->superAdmin()->create();
    expect($user->can('viewAny', Booking::class))->toBeTrue();
});

test('super admin can view any booking', function () {
    $user = User::factory()->superAdmin()->create();
    expect($user->can('view', $this->bookingA))->toBeTrue();
});

test('super admin can create bookings', function () {
    $user = User::factory()->superAdmin()->create();
    expect($user->can('create', Booking::class))->toBeTrue();
});

test('super admin can cancel bookings', function () {
    $user = User::factory()->superAdmin()->create();
    expect($user->can('cancel', $this->bookingA))->toBeTrue();
});

// ------------------------------------------------------------------
// Manager
// ------------------------------------------------------------------

test('manager can viewAny bookings', function () {
    $user = User::factory()->manager()->create();
    expect($user->can('viewAny', Booking::class))->toBeTrue();
});

test('manager can view any booking', function () {
    $user = User::factory()->manager()->create();
    expect($user->can('view', $this->bookingA))->toBeTrue();
});

test('manager can create bookings', function () {
    $user = User::factory()->manager()->create();
    expect($user->can('create', Booking::class))->toBeTrue();
});

test('manager can update bookings', function () {
    $user = User::factory()->manager()->create();
    expect($user->can('update', $this->bookingA))->toBeTrue();
});

test('manager can cancel bookings', function () {
    $user = User::factory()->manager()->create();
    expect($user->can('cancel', $this->bookingA))->toBeTrue();
});

// ------------------------------------------------------------------
// Staff
// ------------------------------------------------------------------

test('staff can viewAny bookings', function () {
    $user = User::factory()->staff()->create();
    expect($user->can('viewAny', Booking::class))->toBeTrue();
});

test('staff can view any booking', function () {
    $user = User::factory()->staff()->create();
    expect($user->can('view', $this->bookingA))->toBeTrue();
});

test('staff can create bookings', function () {
    $user = User::factory()->staff()->create();
    expect($user->can('create', Booking::class))->toBeTrue();
});

test('staff can update bookings', function () {
    $user = User::factory()->staff()->create();
    expect($user->can('update', $this->bookingA))->toBeTrue();
});

test('staff cannot cancel bookings', function () {
    $user = User::factory()->staff()->create();
    expect($user->can('cancel', $this->bookingA))->toBeFalse();
});

// ------------------------------------------------------------------
// Finance — view only (for payment context)
// ------------------------------------------------------------------

test('finance cannot viewAny bookings list', function () {
    $user = User::factory()->finance()->create();
    expect($user->can('viewAny', Booking::class))->toBeFalse();
});

test('finance can view a specific booking', function () {
    $user = User::factory()->finance()->create();
    expect($user->can('view', $this->bookingA))->toBeTrue();
});

test('finance cannot create bookings', function () {
    $user = User::factory()->finance()->create();
    expect($user->can('create', Booking::class))->toBeFalse();
});

test('finance cannot update bookings', function () {
    $user = User::factory()->finance()->create();
    expect($user->can('update', $this->bookingA))->toBeFalse();
});

test('finance cannot cancel bookings', function () {
    $user = User::factory()->finance()->create();
    expect($user->can('cancel', $this->bookingA))->toBeFalse();
});

// ------------------------------------------------------------------
// Customer — own bookings only
// ------------------------------------------------------------------

test('customer can view their own booking', function () {
    expect($this->customerUserA->can('view', $this->bookingA))->toBeTrue();
});

test('customer cannot view another customer booking', function () {
    expect($this->customerUserA->can('view', $this->bookingB))->toBeFalse();
});

test('customer cannot viewAny bookings', function () {
    expect($this->customerUserA->can('viewAny', Booking::class))->toBeFalse();
});

test('customer cannot create bookings', function () {
    expect($this->customerUserA->can('create', Booking::class))->toBeFalse();
});

test('customer cannot update bookings', function () {
    expect($this->customerUserA->can('update', $this->bookingA))->toBeFalse();
});

test('customer cannot cancel bookings', function () {
    expect($this->customerUserA->can('cancel', $this->bookingA))->toBeFalse();
});
