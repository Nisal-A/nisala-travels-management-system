<?php

use App\Enums\UserRole;
use App\Models\Customer;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| NT-005.3 Customer Policy Tests
|--------------------------------------------------------------------------
|
| Tests verifying CustomerPolicy authorization:
|   - Role-based access for viewAny, view, create, update, delete
|   - Customer ownership enforcement (own profile only)
|   - Cross-customer IDOR prevention
|   - Super Admin bypass
|
*/

beforeEach(function () {
    $this->seed(RoleSeeder::class);

    // Create two customer records with linked user accounts
    $this->customerUserA = User::factory()->customer()->create();
    $this->customerA = Customer::create([
        'user_id' => $this->customerUserA->id,
        'customer_id' => 'CUST-001',
        'full_name' => 'Customer A',
        'phone' => '0771234567',
        'email' => 'customera@example.com',
    ]);

    $this->customerUserB = User::factory()->customer()->create();
    $this->customerB = Customer::create([
        'user_id' => $this->customerUserB->id,
        'customer_id' => 'CUST-002',
        'full_name' => 'Customer B',
        'phone' => '0779876543',
        'email' => 'customerb@example.com',
    ]);
});

// ------------------------------------------------------------------
// Super Admin — full access
// ------------------------------------------------------------------

test('super admin can viewAny customers', function () {
    $user = User::factory()->superAdmin()->create();
    expect($user->can('viewAny', Customer::class))->toBeTrue();
});

test('super admin can view any customer', function () {
    $user = User::factory()->superAdmin()->create();
    expect($user->can('view', $this->customerA))->toBeTrue();
});

test('super admin can create customers', function () {
    $user = User::factory()->superAdmin()->create();
    expect($user->can('create', Customer::class))->toBeTrue();
});

test('super admin can update any customer', function () {
    $user = User::factory()->superAdmin()->create();
    expect($user->can('update', $this->customerA))->toBeTrue();
});

test('super admin can delete any customer', function () {
    $user = User::factory()->superAdmin()->create();
    expect($user->can('delete', $this->customerA))->toBeTrue();
});

// ------------------------------------------------------------------
// Manager — full operational access
// ------------------------------------------------------------------

test('manager can viewAny customers', function () {
    $user = User::factory()->manager()->create();
    expect($user->can('viewAny', Customer::class))->toBeTrue();
});

test('manager can view any customer', function () {
    $user = User::factory()->manager()->create();
    expect($user->can('view', $this->customerA))->toBeTrue();
});

test('manager can create customers', function () {
    $user = User::factory()->manager()->create();
    expect($user->can('create', Customer::class))->toBeTrue();
});

test('manager can update any customer', function () {
    $user = User::factory()->manager()->create();
    expect($user->can('update', $this->customerA))->toBeTrue();
});

test('manager can delete customers', function () {
    $user = User::factory()->manager()->create();
    expect($user->can('delete', $this->customerA))->toBeTrue();
});

// ------------------------------------------------------------------
// Staff — operational access, no delete
// ------------------------------------------------------------------

test('staff can viewAny customers', function () {
    $user = User::factory()->staff()->create();
    expect($user->can('viewAny', Customer::class))->toBeTrue();
});

test('staff can view any customer', function () {
    $user = User::factory()->staff()->create();
    expect($user->can('view', $this->customerA))->toBeTrue();
});

test('staff can create customers', function () {
    $user = User::factory()->staff()->create();
    expect($user->can('create', Customer::class))->toBeTrue();
});

test('staff can update customers', function () {
    $user = User::factory()->staff()->create();
    expect($user->can('update', $this->customerA))->toBeTrue();
});

test('staff cannot delete customers', function () {
    $user = User::factory()->staff()->create();
    expect($user->can('delete', $this->customerA))->toBeFalse();
});

// ------------------------------------------------------------------
// Finance — no customer access
// ------------------------------------------------------------------

test('finance cannot viewAny customers', function () {
    $user = User::factory()->finance()->create();
    expect($user->can('viewAny', Customer::class))->toBeFalse();
});

test('finance cannot view customers', function () {
    $user = User::factory()->finance()->create();
    expect($user->can('view', $this->customerA))->toBeFalse();
});

test('finance cannot create customers', function () {
    $user = User::factory()->finance()->create();
    expect($user->can('create', Customer::class))->toBeFalse();
});

// ------------------------------------------------------------------
// Customer — own profile only
// ------------------------------------------------------------------

test('customer can view their own profile', function () {
    expect($this->customerUserA->can('view', $this->customerA))->toBeTrue();
});

test('customer cannot view another customer profile', function () {
    expect($this->customerUserA->can('view', $this->customerB))->toBeFalse();
});

test('customer cannot viewAny customers', function () {
    expect($this->customerUserA->can('viewAny', Customer::class))->toBeFalse();
});

test('customer cannot create customers', function () {
    expect($this->customerUserA->can('create', Customer::class))->toBeFalse();
});

test('customer cannot update any customer', function () {
    expect($this->customerUserA->can('update', $this->customerA))->toBeFalse();
});

test('customer cannot delete any customer', function () {
    expect($this->customerUserA->can('delete', $this->customerA))->toBeFalse();
});
