<?php

use App\Enums\BookingStatus;
use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\TourPackage;
use App\Models\User;
use Database\Seeders\ReportPermissionSeeder;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(ReportPermissionSeeder::class);
});

// ------------------------------------------------------------------
// Guest & Customer Access Tests
// ------------------------------------------------------------------

test('guest is redirected to login when accessing report routes', function (string $url) {
    $response = $this->get($url);
    $response->assertRedirect('/login');
})->with([
    '/reports',
    '/reports/booking-register',
    '/reports/booking-register/data',
]);

test('customer receives 403 when accessing any report routes', function (string $url) {
    $customer = User::factory()->customer()->create();

    $response = $this->actingAs($customer)->get($url);
    $response->assertStatus(403);
})->with([
    '/reports',
    '/reports/booking-register',
    '/reports/booking-register/data',
]);

// ------------------------------------------------------------------
// Hub Page Role Visibility Tests
// ------------------------------------------------------------------

test('super admin sees both financial and operational reports on the hub', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $response = $this->actingAs($superAdmin)->get('/reports');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Reports/Index')
        ->has('reports', 2)
        ->has('grouped.financial', 1)
        ->has('grouped.operational', 1)
        ->where('grouped.operational.0.key', 'booking-register')
        ->where('grouped.financial.0.key', 'income-expenses')
    );
});

test('staff sees only operational reports on the hub', function () {
    $staff = User::factory()->staff()->create();

    $response = $this->actingAs($staff)->get('/reports');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Reports/Index')
        ->has('reports', 1)
        ->has('grouped.operational', 1)
        ->has('grouped.financial', 0)
        ->where('grouped.operational.0.key', 'booking-register')
    );
});

test('finance sees only financial reports on the hub', function () {
    $finance = User::factory()->finance()->create();

    $response = $this->actingAs($finance)->get('/reports');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Reports/Index')
        ->has('reports', 1)
        ->has('grouped.financial', 1)
        ->has('grouped.operational', 0)
        ->where('grouped.financial.0.key', 'income-expenses')
    );
});

// ------------------------------------------------------------------
// Direct URL Permission Enforcement (403 vs 200)
// ------------------------------------------------------------------

test('reports navigation entry is visible to super_admin, manager, staff, and finance but not customer', function (string $roleMethod, bool $shouldSee) {
    $user = User::factory()->{$roleMethod}()->create();

    $response = $this->actingAs($user)->get('/dashboard');
    $response->assertStatus(200);

    $response->assertInertia(function (Assert $page) use ($shouldSee) {
        $nav = $page->toArray()['props']['navigation'] ?? [];
        $managementNav = $nav['management'] ?? [];
        $hasReports = collect($managementNav)->contains('route', 'reports.index');

        expect($hasReports)->toBe($shouldSee);
    });
})->with([
    ['superAdmin', true],
    ['manager', true],
    ['staff', true],
    ['finance', true],
    ['customer', false],
]);

test('staff receives 403 on financial report page and data endpoint', function () {
    $staff = User::factory()->staff()->create();

    $this->actingAs($staff)->get('/reports/income-expenses')->assertStatus(403);
    $this->actingAs($staff)->get('/reports/income-expenses/data')->assertStatus(403);
});

test('finance receives 403 on operational report page and data endpoint', function () {
    $finance = User::factory()->finance()->create();

    $this->actingAs($finance)->get('/reports/booking-register')->assertStatus(403);
    $this->actingAs($finance)->get('/reports/booking-register/data')->assertStatus(403);
});

test('staff can access operational report page and data endpoint', function () {
    $staff = User::factory()->staff()->create();

    $this->actingAs($staff)->get('/reports/booking-register')->assertStatus(200);
    $this->actingAs($staff)->get('/reports/booking-register/data')->assertStatus(200);
});

test('finance can access financial report page and data endpoint', function () {
    $finance = User::factory()->finance()->create();

    $this->actingAs($finance)->get('/reports/income-expenses')->assertStatus(200);
    $this->actingAs($finance)->get('/reports/income-expenses/data')->assertStatus(200);
});

test('accessing non existent report returns 404', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $this->actingAs($superAdmin)->get('/reports/non-existent-report')->assertStatus(404);
    $this->actingAs($superAdmin)->get('/reports/non-existent-report/data')->assertStatus(404);
});

// ------------------------------------------------------------------
// Booking Register Report Query & Strict Money Calculations Tests
// ------------------------------------------------------------------

test('booking register report query returns expected data structure and filters by status', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $customer = Customer::factory()->create(['full_name' => 'Alice Wonder']);
    $tourPackage = TourPackage::factory()->create(['package_name' => 'Serene Retreat']);

    $booking1 = Booking::create([
        'booking_reference' => 'BK-2026-000001',
        'customer_id' => $customer->id,
        'tour_package_id' => $tourPackage->id,
        'booking_status' => BookingStatus::Confirmed,
        'booking_date' => '2026-10-15',
        'travel_date' => '2026-11-01',
        'return_date' => '2026-11-07',
        'base_amount' => '100000.00',
        'final_amount' => '100000.00',
        'paid_amount' => '40000.00',
        'balance_amount' => '60000.00',
    ]);

    $booking2 = Booking::create([
        'booking_reference' => 'BK-2026-000002',
        'customer_id' => $customer->id,
        'tour_package_id' => $tourPackage->id,
        'booking_status' => BookingStatus::Pending,
        'booking_date' => '2026-10-16',
        'travel_date' => '2026-11-05',
        'return_date' => '2026-11-12',
        'base_amount' => '80000.00',
        'final_amount' => '80000.00',
        'paid_amount' => '0.00',
        'balance_amount' => '80000.00',
    ]);

    // Test with status filter
    $response = $this->actingAs($superAdmin)->getJson('/reports/booking-register/data?status=confirmed');

    $response->assertStatus(200);
    $json = $response->json();

    expect($json['total'])->toBe(1);
    expect($json['data'][0]['booking_reference'])->toBe('BK-2026-000001');
    expect($json['data'][0]['customer_name'])->toBe('Alice Wonder');
    expect($json['data'][0]['final_amount'])->toBe('100000.00');
    expect($json['data'][0]['balance_amount'])->toBe('60000.00');
});

test('booking register report excludes soft deleted bookings from query and summary totals', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $customer = Customer::factory()->create();
    $tourPackage = TourPackage::factory()->create();

    // Active booking
    Booking::create([
        'booking_reference' => 'BK-ACTIVE-001',
        'customer_id' => $customer->id,
        'tour_package_id' => $tourPackage->id,
        'booking_status' => BookingStatus::Confirmed,
        'booking_date' => '2026-10-10',
        'travel_date' => '2026-11-01',
        'return_date' => '2026-11-07',
        'base_amount' => '50000.00',
        'final_amount' => '50000.00',
        'paid_amount' => '20000.00',
        'balance_amount' => '30000.00',
    ]);

    // Soft-deleted booking
    $deletedBooking = Booking::create([
        'booking_reference' => 'BK-DELETED-002',
        'customer_id' => $customer->id,
        'tour_package_id' => $tourPackage->id,
        'booking_status' => BookingStatus::Confirmed,
        'booking_date' => '2026-10-10',
        'travel_date' => '2026-11-01',
        'return_date' => '2026-11-07',
        'base_amount' => '999999.00',
        'final_amount' => '999999.00',
        'paid_amount' => '999999.00',
        'balance_amount' => '0.00',
    ]);
    $deletedBooking->delete();

    $response = $this->actingAs($superAdmin)->getJson('/reports/booking-register/data');

    $response->assertStatus(200);
    $json = $response->json();

    expect($json['total'])->toBe(1);
    expect($json['data'][0]['booking_reference'])->toBe('BK-ACTIVE-001');

    // Summary checks
    $revenueTile = collect($json['summary'])->firstWhere('key', 'total_revenue');
    $balanceTile = collect($json['summary'])->firstWhere('key', 'total_balance_due');

    // Soft deleted booking must never be counted
    expect($revenueTile['value'])->toBe('50000.00');
    expect($balanceTile['value'])->toBe('30000.00');
});

test('booking register report summary preserves exact decimal precision via server-side math', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $customer = Customer::factory()->create();
    $tourPackage = TourPackage::factory()->create();

    // Two bookings with decimal cents that often suffer float precision issues
    Booking::create([
        'booking_reference' => 'BK-PRECISION-001',
        'customer_id' => $customer->id,
        'tour_package_id' => $tourPackage->id,
        'booking_status' => BookingStatus::Confirmed,
        'booking_date' => '2026-10-01',
        'travel_date' => '2026-11-01',
        'return_date' => '2026-11-07',
        'base_amount' => '12345.67',
        'final_amount' => '12345.67',
        'paid_amount' => '10000.00',
        'balance_amount' => '2345.67',
    ]);

    Booking::create([
        'booking_reference' => 'BK-PRECISION-002',
        'customer_id' => $customer->id,
        'tour_package_id' => $tourPackage->id,
        'booking_status' => BookingStatus::Confirmed,
        'booking_date' => '2026-10-02',
        'travel_date' => '2026-11-02',
        'return_date' => '2026-11-08',
        'base_amount' => '87654.33',
        'final_amount' => '87654.33',
        'paid_amount' => '80000.00',
        'balance_amount' => '7654.33',
    ]);

    $response = $this->actingAs($superAdmin)->getJson('/reports/booking-register/data');

    $response->assertStatus(200);
    $json = $response->json();

    $revenueTile = collect($json['summary'])->firstWhere('key', 'total_revenue');
    $balanceTile = collect($json['summary'])->firstWhere('key', 'total_balance_due');

    // 12345.67 + 87654.33 = 100000.00 exact
    // 2345.67 + 7654.33 = 10000.00 exact
    expect($revenueTile['value'])->toBe('100000.00');
    expect($balanceTile['value'])->toBe('10000.00');
});
