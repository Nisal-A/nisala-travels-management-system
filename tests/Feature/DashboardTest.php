<?php

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

function createDashUser(string $role): User
{
    $method = match ($role) {
        'super_admin' => 'superAdmin',
        'manager' => 'manager',
        'staff' => 'staff',
        'finance' => 'finance',
        'customer' => 'customer',
    };

    return User::factory()->{$method}()->create();
}

test('super admin and manager receive total customers and employees stats', function () {
    $admin = createDashUser('super_admin');

    // Create some extra users
    createDashUser('customer');
    createDashUser('customer');
    createDashUser('staff');

    $this->actingAs($admin)
        ->get('/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->has('officeStats.totalCustomers')
            ->has('officeStats.totalEmployees')
            ->has('officeStats.activeBookings')
            ->has('officeStats.pendingDocuments')
            ->has('officeStats.paymentsThisMonth')
            ->has('recentBookings')
            ->has('recentCustomers')
            ->has('recentPayments')
            ->missing('customerStats')
        );
});

test('staff receives customer stats but not employee stats', function () {
    $staff = createDashUser('staff');

    $this->actingAs($staff)
        ->get('/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->has('officeStats.totalCustomers')
            ->missing('officeStats.totalEmployees')
            ->missing('officeStats.paymentsThisMonth')
            ->has('officeStats.activeBookings')
            ->has('recentBookings')
            ->has('recentCustomers')
            ->missing('recentPayments')
            ->missing('customerStats')
        );
});

test('finance receives payment stats but not customer stats', function () {
    $finance = createDashUser('finance');

    $this->actingAs($finance)
        ->get('/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->missing('officeStats.totalCustomers')
            ->missing('officeStats.totalEmployees')
            ->has('officeStats.paymentsThisMonth')
            ->missing('recentBookings')
            ->missing('recentCustomers')
            ->has('recentPayments')
            ->missing('customerStats')
        );
});

test('customer receives customer stats and not office stats', function () {
    $customer = createDashUser('customer');

    $this->actingAs($customer)
        ->get('/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->missing('officeStats')
            ->has('customerStats.myBookings')
            ->has('customerStats.myDocuments')
            ->has('customerStats.myPayments')
        );
});
