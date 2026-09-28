<?php

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| NT-005.3 Payment Policy Tests
|--------------------------------------------------------------------------
|
| Tests verifying PaymentPolicy authorization:
|   - Role-based access for viewAny, view, create, update
|   - Finance staff full operational access
|   - Staff excluded from financial data
|   - Customer ownership (own payments only)
|   - Cross-customer IDOR prevention for payments
|   - Super Admin bypass
|
*/

beforeEach(function () {
    $this->seed(RoleSeeder::class);

    // Create destination and tour package (FK dependencies)
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

    // Customer A with booking and payment
    $this->customerUserA = User::factory()->customer()->create();
    $this->customerA = Customer::create([
        'user_id' => $this->customerUserA->id,
        'customer_id' => 'CUST-001',
        'full_name' => 'Customer A',
        'phone' => '0771234567',
        'email' => 'customera@example.com',
    ]);
    $bookingA = Booking::create([
        'booking_reference' => 'BK-001',
        'customer_id' => $this->customerA->id,
        'tour_package_id' => 1,
        'booking_date' => now()->toDateString(),
        'travel_date' => now()->addMonth()->toDateString(),
    ]);
    $this->paymentA = Payment::create([
        'booking_id' => $bookingA->id,
        'customer_id' => $this->customerA->id,
        'amount' => 50000.00,
        'payment_method' => 'bank_transfer',
        'payment_date' => now()->toDateString(),
    ]);

    // Customer B with booking and payment
    $this->customerUserB = User::factory()->customer()->create();
    $this->customerB = Customer::create([
        'user_id' => $this->customerUserB->id,
        'customer_id' => 'CUST-002',
        'full_name' => 'Customer B',
        'phone' => '0779876543',
        'email' => 'customerb@example.com',
    ]);
    $bookingB = Booking::create([
        'booking_reference' => 'BK-002',
        'customer_id' => $this->customerB->id,
        'tour_package_id' => 1,
        'booking_date' => now()->toDateString(),
        'travel_date' => now()->addMonth()->toDateString(),
    ]);
    $this->paymentB = Payment::create([
        'booking_id' => $bookingB->id,
        'customer_id' => $this->customerB->id,
        'amount' => 75000.00,
        'payment_method' => 'cash',
        'payment_date' => now()->toDateString(),
    ]);
});

// ------------------------------------------------------------------
// Super Admin
// ------------------------------------------------------------------

test('super admin can viewAny payments', function () {
    $user = User::factory()->superAdmin()->create();
    expect($user->can('viewAny', Payment::class))->toBeTrue();
});

test('super admin can view any payment', function () {
    $user = User::factory()->superAdmin()->create();
    expect($user->can('view', $this->paymentA))->toBeTrue();
});

test('super admin can create payments', function () {
    $user = User::factory()->superAdmin()->create();
    expect($user->can('create', Payment::class))->toBeTrue();
});

test('super admin can update any payment', function () {
    $user = User::factory()->superAdmin()->create();
    expect($user->can('update', $this->paymentA))->toBeTrue();
});

// ------------------------------------------------------------------
// Manager
// ------------------------------------------------------------------

test('manager can viewAny payments', function () {
    $user = User::factory()->manager()->create();
    expect($user->can('viewAny', Payment::class))->toBeTrue();
});

test('manager can view any payment', function () {
    $user = User::factory()->manager()->create();
    expect($user->can('view', $this->paymentA))->toBeTrue();
});

test('manager can create payments', function () {
    $user = User::factory()->manager()->create();
    expect($user->can('create', Payment::class))->toBeTrue();
});

test('manager can update payments', function () {
    $user = User::factory()->manager()->create();
    expect($user->can('update', $this->paymentA))->toBeTrue();
});

// ------------------------------------------------------------------
// Finance — full payment access
// ------------------------------------------------------------------

test('finance can viewAny payments', function () {
    $user = User::factory()->finance()->create();
    expect($user->can('viewAny', Payment::class))->toBeTrue();
});

test('finance can view any payment', function () {
    $user = User::factory()->finance()->create();
    expect($user->can('view', $this->paymentA))->toBeTrue();
});

test('finance can create payments', function () {
    $user = User::factory()->finance()->create();
    expect($user->can('create', Payment::class))->toBeTrue();
});

test('finance can update payments', function () {
    $user = User::factory()->finance()->create();
    expect($user->can('update', $this->paymentA))->toBeTrue();
});

// ------------------------------------------------------------------
// Staff — no financial access
// ------------------------------------------------------------------

test('staff cannot viewAny payments', function () {
    $user = User::factory()->staff()->create();
    expect($user->can('viewAny', Payment::class))->toBeFalse();
});

test('staff cannot view payments', function () {
    $user = User::factory()->staff()->create();
    expect($user->can('view', $this->paymentA))->toBeFalse();
});

test('staff cannot create payments', function () {
    $user = User::factory()->staff()->create();
    expect($user->can('create', Payment::class))->toBeFalse();
});

test('staff cannot update payments', function () {
    $user = User::factory()->staff()->create();
    expect($user->can('update', $this->paymentA))->toBeFalse();
});

// ------------------------------------------------------------------
// Customer — own payments only
// ------------------------------------------------------------------

test('customer can view their own payment', function () {
    expect($this->customerUserA->can('view', $this->paymentA))->toBeTrue();
});

test('customer cannot view another customer payment', function () {
    expect($this->customerUserA->can('view', $this->paymentB))->toBeFalse();
});

test('customer cannot viewAny payments', function () {
    expect($this->customerUserA->can('viewAny', Payment::class))->toBeFalse();
});

test('customer cannot create payments', function () {
    expect($this->customerUserA->can('create', Payment::class))->toBeFalse();
});

test('customer cannot update payments', function () {
    expect($this->customerUserA->can('update', $this->paymentA))->toBeFalse();
});
