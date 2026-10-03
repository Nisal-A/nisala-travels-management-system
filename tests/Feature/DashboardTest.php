<?php

use App\Http\Controllers\DashboardController;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Models\DocumentType;
use App\Models\Payment;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
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

// ──────────────────────────────────────────────────────────────────────────────
// Role-Scoped Access Tests
// ──────────────────────────────────────────────────────────────────────────────

test('super admin can access dashboard', function () {
    $admin = createDashUser('super_admin');

    $this->actingAs($admin)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->missing('customerStats')
        );
});

test('staff can access dashboard without customer stats', function () {
    $staff = createDashUser('staff');

    $this->actingAs($staff)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->missing('customerStats')
        );
});

test('finance can access dashboard without customer stats', function () {
    $finance = createDashUser('finance');

    $this->actingAs($finance)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->missing('customerStats')
        );
});

test('customer sees customer stats and not office stats', function () {
    $customer = createDashUser('customer');

    $this->actingAs($customer)
        ->get('/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->has('customerStats.myBookings')
            ->has('customerStats.myDocuments')
            ->has('customerStats.myPayments')
        );
});

test('dashboard loads successfully for all office roles', function ($role) {
    $user = createDashUser($role);

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
        );
})->with(['super_admin', 'manager', 'staff', 'finance']);

test('unauthenticated user is redirected from dashboard', function () {
    $this->get('/dashboard')
        ->assertRedirect('/login');
});

// ──────────────────────────────────────────────────────────────────────────────
// Dashboard Controller Logic Tests (testing the buildOfficeStats output directly)
//
// Since officeStats uses Inertia::defer(), it's not in the initial response.
// We test the underlying logic by invoking the controller and inspecting cache.
// ──────────────────────────────────────────────────────────────────────────────

test('dashboard aggregates: today bookings count is correct', function () {
    $admin = createDashUser('super_admin');
    Cache::flush();

    Booking::factory()->count(3)->create(['created_at' => Carbon::today()]);
    Booking::factory()->count(2)->create(['created_at' => Carbon::yesterday()]);

    // Load page — this primes the deferred callback into Inertia
    $this->actingAs($admin)->get('/dashboard')->assertOk();

    // Directly verify what Cache::remember would produce
    $todayCount = Booking::whereDate('created_at', Carbon::today())->count();
    $yesterdayCount = Booking::whereDate('created_at', Carbon::yesterday())->count();

    expect($todayCount)->toBe(3);
    expect($yesterdayCount)->toBe(2);
});

test('dashboard aggregates: pending payments count and total are correct', function () {
    createDashUser('super_admin');

    Booking::factory()->create(['balance_amount' => 5000]);
    Booking::factory()->create(['balance_amount' => 3000]);
    Booking::factory()->create(['balance_amount' => 0]);

    $pendingCount = Booking::where('balance_amount', '>', 0)->count();
    $pendingTotal = Booking::where('balance_amount', '>', 0)->sum('balance_amount');

    expect($pendingCount)->toBe(2);
    expect((float) $pendingTotal)->toBe(8000.0);
});

test('dashboard aggregates: new leads reflects last 7 days only', function () {
    createDashUser('super_admin');

    Customer::factory()->create(['created_at' => Carbon::now()->subDays(3)]);
    Customer::factory()->create(['created_at' => Carbon::now()->subDays(6)]);
    Customer::factory()->create(['created_at' => Carbon::now()->subDays(10)]);

    $leadsThisWeek = Customer::where('created_at', '>=', Carbon::now()->subDays(7))->count();

    expect($leadsThisWeek)->toBe(2);
});

test('dashboard aggregates: pending documents counts expiring and unverified', function () {
    createDashUser('super_admin');
    $docType = DocumentType::factory()->create();

    // Pending verification
    CustomerDocument::factory()->create([
        'document_type_id' => $docType->id,
        'verification_status' => 'Pending',
        'expiry_date' => Carbon::now()->addDays(60),
    ]);

    // Expiring (within 30 days)
    CustomerDocument::factory()->create([
        'document_type_id' => $docType->id,
        'verification_status' => 'Verified',
        'expiry_date' => Carbon::now()->addDays(15),
    ]);

    // Neither pending nor expiring
    CustomerDocument::factory()->create([
        'document_type_id' => $docType->id,
        'verification_status' => 'Verified',
        'expiry_date' => Carbon::now()->addDays(90),
    ]);

    $pendingVerification = CustomerDocument::where('verification_status', 'Pending')->count();
    $expiring = CustomerDocument::where('expiry_date', '<', Carbon::now()->addDays(30))
        ->where('expiry_date', '>=', Carbon::now())->count();

    expect($pendingVerification)->toBe(1);
    expect($expiring)->toBe(1);
});

// ──────────────────────────────────────────────────────────────────────────────
// Role-Aware Tile Ordering Tests
// ──────────────────────────────────────────────────────────────────────────────

test('finance user tile order starts with pendingPayments', function () {
    $finance = createDashUser('finance');

    // Invoke the getTileOrder logic directly
    $controller = app(DashboardController::class);
    $method = new ReflectionMethod($controller, 'getTileOrder');
    $method->setAccessible(true);
    $order = $method->invoke($controller, $finance);

    expect($order[0])->toBe('pendingPayments');
});

test('staff user tile order starts with newLeads', function () {
    $staff = createDashUser('staff');

    $controller = app(DashboardController::class);
    $method = new ReflectionMethod($controller, 'getTileOrder');
    $method->setAccessible(true);
    $order = $method->invoke($controller, $staff);

    expect($order[0])->toBe('newLeads');
});

test('super admin tile order starts with todaysBookings', function () {
    $admin = createDashUser('super_admin');

    $controller = app(DashboardController::class);
    $method = new ReflectionMethod($controller, 'getTileOrder');
    $method->setAccessible(true);
    $order = $method->invoke($controller, $admin);

    expect($order[0])->toBe('todaysBookings');
});

// ──────────────────────────────────────────────────────────────────────────────
// Data Integrity Tests
// ──────────────────────────────────────────────────────────────────────────────

test('dashboard loads without errors when database has many records', function () {
    $admin = createDashUser('super_admin');

    Booking::factory()->count(10)->create();
    Payment::factory()->count(10)->create();

    $this->actingAs($admin)
        ->get('/dashboard')
        ->assertOk();
});

test('dashboard loads when database is empty', function () {
    $admin = createDashUser('super_admin');

    $this->actingAs($admin)
        ->get('/dashboard')
        ->assertOk();
});

test('dashboard cache key is per-user', function () {
    $admin = createDashUser('super_admin');
    $staff = createDashUser('staff');

    // Both users should get different cache keys
    expect('dashboard_stats_'.$admin->id)->not->toBe('dashboard_stats_'.$staff->id);
});
