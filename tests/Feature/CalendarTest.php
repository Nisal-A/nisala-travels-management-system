<?php

use App\Models\Booking;
use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Models\DocumentType;
use App\Models\TourPackage;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

function createCalendarUser(string $role): User
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
// Calendar Page Access Tests
// ──────────────────────────────────────────────────────────────────────────────

test('office users can access the calendar page', function ($role) {
    $user = createCalendarUser($role);

    $this->actingAs($user)
        ->get('/calendar')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Calendar/Index')
        );
})->with(['super_admin', 'manager', 'staff', 'finance']);

test('customer cannot access the calendar page', function () {
    $customer = createCalendarUser('customer');

    $this->actingAs($customer)
        ->get('/calendar')
        ->assertForbidden();
});

test('unauthenticated user is redirected from calendar', function () {
    $this->get('/calendar')
        ->assertRedirect('/login');
});

// ──────────────────────────────────────────────────────────────────────────────
// Calendar Events Endpoint Tests
// ──────────────────────────────────────────────────────────────────────────────

test('calendar events endpoint returns events within date range', function () {
    $admin = createCalendarUser('super_admin');
    $customer = Customer::factory()->create();
    $package = TourPackage::factory()->create();

    // Booking within range
    Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $package->id,
        'travel_date' => '2026-11-15',
        'return_date' => '2026-11-20',
        'balance_amount' => 0,
    ]);

    // Booking outside range
    Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $package->id,
        'travel_date' => '2026-12-15',
        'return_date' => '2026-12-20',
        'balance_amount' => 0,
    ]);

    $response = $this->actingAs($admin)
        ->getJson('/admin/calendar/events?start=2026-11-01&end=2026-11-30');

    $response->assertOk();
    $events = $response->json();

    // Should include departure and return for the Nov booking
    $depEvents = collect($events)->where('type', 'departures');
    $retEvents = collect($events)->where('type', 'returns');

    expect($depEvents)->toHaveCount(1);
    expect($retEvents)->toHaveCount(1);

    // Should not include Dec booking
    $decEvents = collect($events)->filter(fn($e) => str_contains($e['start'], '2026-12'));
    expect($decEvents)->toBeEmpty();
});

test('calendar events endpoint filters by type', function () {
    $admin = createCalendarUser('super_admin');
    $customer = Customer::factory()->create();
    $package = TourPackage::factory()->create();

    Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $package->id,
        'travel_date' => '2026-11-15',
        'return_date' => '2026-11-20',
        'balance_amount' => 5000,
    ]);

    // Request only departures
    $response = $this->actingAs($admin)
        ->getJson('/admin/calendar/events?start=2026-11-01&end=2026-11-30&types[]=departures');

    $response->assertOk();
    $events = $response->json();

    // Should only have departure events
    $types = collect($events)->pluck('type')->unique();
    expect($types->toArray())->toBe(['departures']);
});

test('calendar events include booking_id and status fields', function () {
    $admin = createCalendarUser('super_admin');
    $customer = Customer::factory()->create();
    $package = TourPackage::factory()->create();

    $booking = Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $package->id,
        'travel_date' => '2026-11-15',
        'booking_status' => 'confirmed',
    ]);

    $response = $this->actingAs($admin)
        ->getJson('/admin/calendar/events?start=2026-11-01&end=2026-11-30&types[]=departures');

    $response->assertOk();
    $events = $response->json();

    expect($events)->not->toBeEmpty();
    
    $firstEvent = $events[0];
    expect($firstEvent)->toHaveKeys(['id', 'title', 'start', 'type', 'booking_id', 'status', 'booking']);
    expect($firstEvent['booking_id'])->toBe($booking->id);
    expect($firstEvent['status'])->toBe('confirmed');
});

test('balance due events appear 30 days before travel date', function () {
    $admin = createCalendarUser('super_admin');
    $customer = Customer::factory()->create();
    $package = TourPackage::factory()->create();

    // Travel on Dec 15, so balance due Nov 15
    Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $package->id,
        'travel_date' => '2026-12-15',
        'balance_amount' => 10000,
    ]);

    $response = $this->actingAs($admin)
        ->getJson('/admin/calendar/events?start=2026-11-01&end=2026-11-30&types[]=balance');

    $response->assertOk();
    $events = $response->json();

    $balanceEvents = collect($events)->where('type', 'balance');
    expect($balanceEvents)->toHaveCount(1);
    expect($balanceEvents->first()['start'])->toBe('2026-11-15');
});

test('visa deadline events appear for documents with visa type', function () {
    $admin = createCalendarUser('super_admin');
    $visaType = DocumentType::factory()->create(['name' => 'Tourist Visa']);
    $customer = Customer::factory()->create();

    CustomerDocument::factory()->create([
        'customer_id' => $customer->id,
        'document_type_id' => $visaType->id,
        'expiry_date' => '2026-11-20',
    ]);

    $response = $this->actingAs($admin)
        ->getJson('/admin/calendar/events?start=2026-11-01&end=2026-11-30&types[]=visa');

    $response->assertOk();
    $events = $response->json();

    $visaEvents = collect($events)->where('type', 'visa');
    expect($visaEvents)->toHaveCount(1);
    expect($visaEvents->first()['start'])->toBe('2026-11-20');
});

test('events outside the date range are excluded', function () {
    $admin = createCalendarUser('super_admin');
    $customer = Customer::factory()->create();
    $package = TourPackage::factory()->create();

    // Oct booking — should NOT appear in Nov range
    Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $package->id,
        'travel_date' => '2026-10-10',
        'return_date' => '2026-10-15',
        'balance_amount' => 0,
    ]);

    $response = $this->actingAs($admin)
        ->getJson('/admin/calendar/events?start=2026-11-01&end=2026-11-30');

    $response->assertOk();
    $events = $response->json();

    // Should not contain any events
    $depEvents = collect($events)->where('type', 'departures');
    $retEvents = collect($events)->where('type', 'returns');
    
    expect($depEvents)->toBeEmpty();
    expect($retEvents)->toBeEmpty();
});

test('fully paid bookings do not produce balance due events', function () {
    $admin = createCalendarUser('super_admin');
    $customer = Customer::factory()->create();
    $package = TourPackage::factory()->create();

    // Travel on Dec 15 but fully paid
    Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $package->id,
        'travel_date' => '2026-12-15',
        'balance_amount' => 0,
    ]);

    $response = $this->actingAs($admin)
        ->getJson('/admin/calendar/events?start=2026-11-01&end=2026-11-30&types[]=balance');

    $response->assertOk();
    $events = $response->json();

    $balanceEvents = collect($events)->where('type', 'balance');
    expect($balanceEvents)->toBeEmpty();
});

test('event booking data includes customer, destination, travelers, and balance', function () {
    $admin = createCalendarUser('super_admin');
    $customer = Customer::factory()->create(['full_name' => 'John Doe']);
    $package = TourPackage::factory()->create();

    Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $package->id,
        'travel_date' => '2026-11-15',
        'number_of_travelers' => 3,
        'balance_amount' => 7500,
    ]);

    $response = $this->actingAs($admin)
        ->getJson('/admin/calendar/events?start=2026-11-01&end=2026-11-30&types[]=departures');

    $response->assertOk();
    $events = $response->json();

    expect($events)->not->toBeEmpty();
    $booking = $events[0]['booking'];
    
    expect($booking['customer'])->toBe('John Doe');
    expect($booking['travelers'])->toBe(3);
    expect($booking['balance'])->toEqual(7500);
});

// ──────────────────────────────────────────────────────────────────────────────
// Validation Tests
// ──────────────────────────────────────────────────────────────────────────────

test('calendar events endpoint validates date range', function () {
    $admin = createCalendarUser('super_admin');

    // Missing start date
    $this->actingAs($admin)
        ->getJson('/admin/calendar/events?end=2026-11-30')
        ->assertUnprocessable();

    // Missing end date
    $this->actingAs($admin)
        ->getJson('/admin/calendar/events?start=2026-11-01')
        ->assertUnprocessable();
});

test('calendar events endpoint validates type values', function () {
    $admin = createCalendarUser('super_admin');

    $this->actingAs($admin)
        ->getJson('/admin/calendar/events?start=2026-11-01&end=2026-11-30&types[]=invalid_type')
        ->assertUnprocessable();
});

// ──────────────────────────────────────────────────────────────────────────────
// Permission Tests
// ──────────────────────────────────────────────────────────────────────────────

test('customer cannot access calendar events endpoint', function () {
    $customer = createCalendarUser('customer');

    $this->actingAs($customer)
        ->getJson('/admin/calendar/events?start=2026-11-01&end=2026-11-30')
        ->assertForbidden();
});

test('all office roles can access calendar events', function ($role) {
    $user = createCalendarUser($role);

    $this->actingAs($user)
        ->getJson('/admin/calendar/events?start=2026-11-01&end=2026-11-30')
        ->assertOk();
})->with(['super_admin', 'manager', 'staff', 'finance']);
