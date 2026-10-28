<?php

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Destination;
use App\Models\Employee;
use App\Models\TourPackage;
use App\Models\User;
use Database\Seeders\ReportPermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(ReportPermissionSeeder::class);
});

// ============================================================================
// 1. ROLE ACCESS TESTS (200 for allowed, 403 for others, 302 for guest)
// ============================================================================

test('guest is redirected to login when accessing booking register or upcoming tours', function (string $url) {
    $response = $this->get($url);
    $response->assertRedirect('/login');
})->with([
    '/reports/booking-register',
    '/reports/booking-register/data',
    '/reports/upcoming-tours',
    '/reports/upcoming-tours/data',
]);

test('customer receives 403 when accessing booking register or upcoming tours', function (string $url) {
    $customer = User::factory()->customer()->create();

    $this->actingAs($customer)->get($url)->assertStatus(403);
})->with([
    '/reports/booking-register',
    '/reports/booking-register/data',
    '/reports/upcoming-tours',
    '/reports/upcoming-tours/data',
]);

test('finance receives 403 when accessing operational reports', function (string $url) {
    $finance = User::factory()->finance()->create();

    $this->actingAs($finance)->get($url)->assertStatus(403);
})->with([
    '/reports/booking-register',
    '/reports/booking-register/data',
    '/reports/upcoming-tours',
    '/reports/upcoming-tours/data',
]);

test('super admin, manager, and staff can access both operational reports and their data endpoints', function (string $roleMethod, string $reportKey) {
    $user = User::factory()->{$roleMethod}()->create();

    $pageRes = $this->actingAs($user)->get("/reports/{$reportKey}");
    $pageRes->assertStatus(200);
    $pageRes->assertInertia(fn (Assert $page) => $page
        ->component('Reports/Show')
        ->where('report.key', $reportKey)
    );

    $dataRes = $this->actingAs($user)->getJson("/reports/{$reportKey}/data");
    $dataRes->assertStatus(200);
    $dataRes->assertJsonStructure([
        'data',
        'current_page',
        'last_page',
        'per_page',
        'total',
        'summary',
    ]);
})->with([
    ['superAdmin', 'booking-register'],
    ['superAdmin', 'upcoming-tours'],
    ['manager', 'booking-register'],
    ['manager', 'upcoming-tours'],
    ['staff', 'booking-register'],
    ['staff', 'upcoming-tours'],
]);

// ============================================================================
// 2. EXPORT IN ALL THREE FORMATS (CSV, Excel, PDF)
// ============================================================================

test('staff, manager, and super admin can export both reports in CSV, Excel, and PDF', function (string $roleMethod, string $reportKey, string $format, string $expectedContentType) {
    $user = User::factory()->{$roleMethod}()->create();

    $response = $this->actingAs($user)->get("/reports/{$reportKey}/export/{$format}");

    $response->assertStatus(200);
    $response->assertHeader('content-type', $expectedContentType);
})->with([
    // Staff exports
    ['staff', 'booking-register', 'csv', 'text/csv; charset=UTF-8'],
    ['staff', 'booking-register', 'excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ['staff', 'booking-register', 'pdf', 'application/pdf'],
    ['staff', 'upcoming-tours', 'csv', 'text/csv; charset=UTF-8'],
    ['staff', 'upcoming-tours', 'excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ['staff', 'upcoming-tours', 'pdf', 'application/pdf'],

    // Manager exports
    ['manager', 'booking-register', 'csv', 'text/csv; charset=UTF-8'],
    ['manager', 'upcoming-tours', 'pdf', 'application/pdf'],

    // Super Admin exports
    ['superAdmin', 'booking-register', 'excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ['superAdmin', 'upcoming-tours', 'csv', 'text/csv; charset=UTF-8'],
]);

// ============================================================================
// 3. BOOKING REGISTER: COLUMNS & ROW TRANSFORMATION
// ============================================================================

test('booking register returns all 12 specified columns including customer full_name and customer_id', function () {
    $user = User::factory()->superAdmin()->create();
    $customer = Customer::factory()->create([
        'full_name' => 'Johnathan Traveler',
        'customer_id' => 'CUST-12345',
    ]);
    $tourPackage = TourPackage::factory()->create(['package_name' => 'Sigiriya Explorer']);

    Booking::create([
        'booking_reference' => 'BK-TEST-001',
        'customer_id' => $customer->id,
        'tour_package_id' => $tourPackage->id,
        'booking_date' => '2026-10-15',
        'travel_date' => '2026-11-20',
        'return_date' => '2026-11-25',
        'number_of_travelers' => 3,
        'currency' => 'LKR',
        'base_amount' => '45000.00',
        'final_amount' => '45000.00',
        'paid_amount' => '30000.00',
        'balance_amount' => '15000.00',
        'booking_status' => BookingStatus::Confirmed,
        'payment_status' => 'partial',
    ]);

    $response = $this->actingAs($user)->getJson('/reports/booking-register/data');
    $response->assertStatus(200);

    $row = $response->json('data.0');
    expect($row)->not->toBeNull();
    expect($row['booking_reference'])->toBe('BK-TEST-001');
    expect($row['booking_date'])->toBe('2026-10-15');
    expect($row['customer'])->toContain('Johnathan Traveler');
    expect($row['customer'])->toContain('CUST-12345');
    expect($row['package_name'])->toBe('Sigiriya Explorer');
    expect($row['travel_date'])->toBe('2026-11-20');
    expect($row['number_of_travelers'])->toBe(3);
    expect($row['currency'])->toBe('LKR');
    expect($row['final_amount'])->toBe('45000.00');
    expect($row['paid_amount'])->toBe('30000.00');
    expect($row['balance_amount'])->toBe('15000.00');
    expect($row['booking_status'])->toBe('Confirmed');
    expect($row['payment_status'])->toBe('Partial');
});

// ============================================================================
// 4. BOOKING REGISTER: FILTERS
// ============================================================================

test('booking register correctly filters by booking date range, travel date range, status, package, destination, employee, and currency', function () {
    $user = User::factory()->superAdmin()->create();
    $employeeUser = User::factory()->staff()->create(['name' => 'Agent Smith']);
    $employee = Employee::create([
        'user_id' => $employeeUser->id,
        'employee_id' => 'EMP-001',
        'phone' => '+94771234567',
    ]);

    $destA = Destination::factory()->create(['country' => 'Sri Lanka', 'city_region' => 'Kandy']);
    $destB = Destination::factory()->create(['country' => 'Maldives', 'city_region' => 'Male']);

    $pkgA = TourPackage::factory()->create(['destination_id' => $destA->id, 'package_name' => 'Kandy Temple Tour']);
    $pkgB = TourPackage::factory()->create(['destination_id' => $destB->id, 'package_name' => 'Maldives Atoll Cruise']);

    $cust = Customer::factory()->create();

    // Booking 1: Target booking matching all test filters
    $b1 = Booking::create([
        'booking_reference' => 'BK-MATCH-001',
        'customer_id' => $cust->id,
        'tour_package_id' => $pkgA->id,
        'assigned_to' => $employee->id,
        'booking_date' => '2026-10-10',
        'travel_date' => '2026-11-15',
        'return_date' => '2026-11-20',
        'number_of_travelers' => 2,
        'currency' => 'USD',
        'base_amount' => '1200.00',
        'final_amount' => '1200.00',
        'paid_amount' => '1200.00',
        'balance_amount' => '0.00',
        'booking_status' => BookingStatus::Confirmed,
        'payment_status' => 'paid',
    ]);

    // Booking 2: Different destination and currency
    $b2 = Booking::create([
        'booking_reference' => 'BK-OTHER-002',
        'customer_id' => $cust->id,
        'tour_package_id' => $pkgB->id,
        'assigned_to' => null,
        'booking_date' => '2026-09-01',
        'travel_date' => '2026-12-01',
        'return_date' => '2026-12-07',
        'number_of_travelers' => 4,
        'currency' => 'LKR',
        'base_amount' => '300000.00',
        'final_amount' => '300000.00',
        'paid_amount' => '100000.00',
        'balance_amount' => '200000.00',
        'booking_status' => BookingStatus::Pending,
        'payment_status' => 'partial',
    ]);

    // Filter by currency USD
    $resCurrency = $this->actingAs($user)->getJson('/reports/booking-register/data?currency=USD');
    expect($resCurrency->json('total'))->toBe(1);
    expect($resCurrency->json('data.0.booking_reference'))->toBe('BK-MATCH-001');

    // Filter by destination
    $resDest = $this->actingAs($user)->getJson("/reports/booking-register/data?destination_id={$destA->id}");
    expect($resDest->json('total'))->toBe(1);
    expect($resDest->json('data.0.booking_reference'))->toBe('BK-MATCH-001');

    // Filter by assigned employee
    $resEmp = $this->actingAs($user)->getJson("/reports/booking-register/data?assigned_to={$employee->id}");
    expect($resEmp->json('total'))->toBe(1);
    expect($resEmp->json('data.0.booking_reference'))->toBe('BK-MATCH-001');

    // Filter by booking date range
    $resDate = $this->actingAs($user)->getJson('/reports/booking-register/data?booking_date_from=2026-10-01&booking_date_to=2026-10-31');
    expect($resDate->json('total'))->toBe(1);
    expect($resDate->json('data.0.booking_reference'))->toBe('BK-MATCH-001');

    // Filter by travel date range
    $resTravelDate = $this->actingAs($user)->getJson('/reports/booking-register/data?travel_date_from=2026-11-01&travel_date_to=2026-11-30');
    expect($resTravelDate->json('total'))->toBe(1);
    expect($resTravelDate->json('data.0.booking_reference'))->toBe('BK-MATCH-001');

    // Filter by status confirmed
    $resStatus = $this->actingAs($user)->getJson('/reports/booking-register/data?booking_status=confirmed');
    expect($resStatus->json('total'))->toBe(1);
    expect($resStatus->json('data.0.booking_reference'))->toBe('BK-MATCH-001');
});

// ============================================================================
// 5. BOOKING REGISTER: TOTALS PER CURRENCY & SERVER-SIDE MATH
// ============================================================================

test('booking register summary calculates totals per currency with exact bcmath precision and status counts matching manual dataset', function () {
    $user = User::factory()->superAdmin()->create();
    $cust = Customer::factory()->create();
    $pkg = TourPackage::factory()->create();

    // 2 LKR bookings
    Booking::create([
        'booking_reference' => 'BK-LKR-01',
        'customer_id' => $cust->id,
        'tour_package_id' => $pkg->id,
        'booking_date' => '2026-10-01',
        'travel_date' => '2026-11-01',
        'currency' => 'LKR',
        'base_amount' => '10000.50',
        'final_amount' => '10000.50',
        'paid_amount' => '6000.25',
        'balance_amount' => '4000.25',
        'booking_status' => BookingStatus::Confirmed,
    ]);

    Booking::create([
        'booking_reference' => 'BK-LKR-02',
        'customer_id' => $cust->id,
        'tour_package_id' => $pkg->id,
        'booking_date' => '2026-10-02',
        'travel_date' => '2026-11-02',
        'currency' => 'LKR',
        'base_amount' => '20000.25',
        'final_amount' => '20000.25',
        'paid_amount' => '15000.00',
        'balance_amount' => '5000.25',
        'booking_status' => BookingStatus::Confirmed,
    ]);

    // 2 USD bookings
    Booking::create([
        'booking_reference' => 'BK-USD-01',
        'customer_id' => $cust->id,
        'tour_package_id' => $pkg->id,
        'booking_date' => '2026-10-03',
        'travel_date' => '2026-11-03',
        'currency' => 'USD',
        'base_amount' => '1500.75',
        'final_amount' => '1500.75',
        'paid_amount' => '1000.50',
        'balance_amount' => '500.25',
        'booking_status' => BookingStatus::Pending,
    ]);

    Booking::create([
        'booking_reference' => 'BK-USD-02',
        'customer_id' => $cust->id,
        'tour_package_id' => $pkg->id,
        'booking_date' => '2026-10-04',
        'travel_date' => '2026-11-04',
        'currency' => 'USD',
        'base_amount' => '2500.25',
        'final_amount' => '2500.25',
        'paid_amount' => '2500.25',
        'balance_amount' => '0.00',
        'booking_status' => BookingStatus::Completed,
    ]);

    $response = $this->actingAs($user)->getJson('/reports/booking-register/data');
    $response->assertStatus(200);

    $summary = collect($response->json('summary'));

    // Total Bookings: 4
    expect($summary->firstWhere('key', 'total_bookings')['value'])->toBe(4);

    // Status counts: Confirmed = 2, Pending = 1, Completed = 1, Cancelled = 0
    expect($summary->firstWhere('key', 'confirmed_count')['value'])->toBe(2);
    expect($summary->firstWhere('key', 'pending_count')['value'])->toBe(1);
    expect($summary->firstWhere('key', 'completed_count')['value'])->toBe(1);
    expect($summary->firstWhere('key', 'cancelled_count')['value'])->toBe(0);

    // LKR totals:
    // final: 10000.50 + 20000.25 = 30000.75
    // paid: 6000.25 + 15000.00 = 21000.25
    // balance: 4000.25 + 5000.25 = 9000.50
    expect($summary->firstWhere('key', 'total_final_LKR')['value'])->toBe('30000.75');
    expect($summary->firstWhere('key', 'total_paid_LKR')['value'])->toBe('21000.25');
    expect($summary->firstWhere('key', 'total_balance_LKR')['value'])->toBe('9000.50');

    // USD totals:
    // final: 1500.75 + 2500.25 = 4001.00
    // paid: 1000.50 + 2500.25 = 3500.75
    // balance: 500.25 + 0.00 = 500.25
    expect($summary->firstWhere('key', 'total_final_USD')['value'])->toBe('4001.00');
    expect($summary->firstWhere('key', 'total_paid_USD')['value'])->toBe('3500.75');
    expect($summary->firstWhere('key', 'total_balance_USD')['value'])->toBe('500.25');
});

// ============================================================================
// 6. SOFT DELETED BOOKINGS EXCLUDED
// ============================================================================

test('soft-deleted bookings are excluded from booking register table and totals', function () {
    $user = User::factory()->superAdmin()->create();
    $cust = Customer::factory()->create();
    $pkg = TourPackage::factory()->create();

    $active = Booking::create([
        'booking_reference' => 'BK-KEEP-01',
        'customer_id' => $cust->id,
        'tour_package_id' => $pkg->id,
        'booking_date' => '2026-10-01',
        'travel_date' => '2026-11-01',
        'currency' => 'LKR',
        'base_amount' => '10000.00',
        'final_amount' => '10000.00',
        'paid_amount' => '10000.00',
        'balance_amount' => '0.00',
        'booking_status' => BookingStatus::Confirmed,
    ]);

    $deleted = Booking::create([
        'booking_reference' => 'BK-DELETED-02',
        'customer_id' => $cust->id,
        'tour_package_id' => $pkg->id,
        'booking_date' => '2026-10-01',
        'travel_date' => '2026-11-01',
        'currency' => 'LKR',
        'base_amount' => '50000.00',
        'final_amount' => '50000.00',
        'paid_amount' => '50000.00',
        'balance_amount' => '0.00',
        'booking_status' => BookingStatus::Confirmed,
    ]);
    $deleted->delete(); // Soft delete

    $response = $this->actingAs($user)->getJson('/reports/booking-register/data');
    $response->assertStatus(200);

    expect($response->json('total'))->toBe(1);
    expect($response->json('data.0.booking_reference'))->toBe('BK-KEEP-01');

    $summary = collect($response->json('summary'));
    expect($summary->firstWhere('key', 'total_bookings')['value'])->toBe(1);
    expect($summary->firstWhere('key', 'total_final_LKR')['value'])->toBe('10000.00');
});

// ============================================================================
// 7. UPCOMING TOURS: DATE DEFAULT, FILTERS & COLUMNS
// ============================================================================

test('upcoming tours defaults to active packages starting from today forward 90 days', function () {
    $user = User::factory()->superAdmin()->create();
    $today = Carbon::today();

    // 1. Within 90 days active (Should appear)
    $validPkg = TourPackage::factory()->create([
        'package_name' => 'Valid Upcoming Tour',
        'start_date' => $today->copy()->addDays(20)->format('Y-m-d'),
        'end_date' => $today->copy()->addDays(27)->format('Y-m-d'),
        'status' => 'active',
    ]);

    // 2. Past tour (Should NOT appear)
    $pastPkg = TourPackage::factory()->create([
        'package_name' => 'Past Tour',
        'start_date' => $today->copy()->subDays(5)->format('Y-m-d'),
        'end_date' => $today->copy()->addDays(2)->format('Y-m-d'),
        'status' => 'active',
    ]);

    // 3. Far future tour beyond 90 days (Should NOT appear by default)
    $farPkg = TourPackage::factory()->create([
        'package_name' => 'Far Future Tour',
        'start_date' => $today->copy()->addDays(120)->format('Y-m-d'),
        'end_date' => $today->copy()->addDays(127)->format('Y-m-d'),
        'status' => 'active',
    ]);

    // 4. Inactive tour within 90 days (Should NOT appear by default)
    $inactivePkg = TourPackage::factory()->create([
        'package_name' => 'Draft Inactive Tour',
        'start_date' => $today->copy()->addDays(10)->format('Y-m-d'),
        'end_date' => $today->copy()->addDays(17)->format('Y-m-d'),
        'status' => 'inactive',
    ]);

    $response = $this->actingAs($user)->getJson('/reports/upcoming-tours/data');
    $response->assertStatus(200);

    expect($response->json('total'))->toBe(1);
    expect($response->json('data.0.package_name'))->toBe('Valid Upcoming Tour');
});

// ============================================================================
// 8. UPCOMING TOURS: BOOKED TRAVELERS, SEATS LEFT & CANCELLED EXCLUSIONS
// ============================================================================

test('upcoming tours calculates booked travelers and seats left excluding cancelled and soft-deleted bookings', function () {
    $user = User::factory()->superAdmin()->create();
    $today = Carbon::today();
    $cust = Customer::factory()->create();

    $package = TourPackage::factory()->create([
        'package_name' => 'Scenic Ella Tour',
        'start_date' => $today->copy()->addDays(30)->format('Y-m-d'),
        'end_date' => $today->copy()->addDays(35)->format('Y-m-d'),
        'capacity' => 25,
        'status' => 'active',
    ]);

    // Booking 1: Confirmed with 4 travelers
    Booking::create([
        'booking_reference' => 'BK-ELLA-01',
        'customer_id' => $cust->id,
        'tour_package_id' => $package->id,
        'booking_date' => '2026-10-01',
        'travel_date' => '2026-11-01',
        'currency' => 'LKR',
        'number_of_travelers' => 4,
        'booking_status' => BookingStatus::Confirmed,
        'base_amount' => '1000.00',
        'final_amount' => '1000.00',
        'paid_amount' => '1000.00',
        'balance_amount' => '0.00',
    ]);

    // Booking 2: Pending with 3 travelers
    Booking::create([
        'booking_reference' => 'BK-ELLA-02',
        'customer_id' => $cust->id,
        'tour_package_id' => $package->id,
        'booking_date' => '2026-10-02',
        'travel_date' => '2026-11-02',
        'currency' => 'LKR',
        'number_of_travelers' => 3,
        'booking_status' => BookingStatus::Pending,
        'base_amount' => '750.00',
        'final_amount' => '750.00',
        'paid_amount' => '200.00',
        'balance_amount' => '550.00',
    ]);

    // Booking 3: Cancelled with 5 travelers (MUST BE EXCLUDED)
    Booking::create([
        'booking_reference' => 'BK-ELLA-03',
        'customer_id' => $cust->id,
        'tour_package_id' => $package->id,
        'booking_date' => '2026-10-03',
        'travel_date' => '2026-11-03',
        'currency' => 'LKR',
        'number_of_travelers' => 5,
        'booking_status' => BookingStatus::Cancelled,
        'base_amount' => '1250.00',
        'final_amount' => '1250.00',
        'paid_amount' => '0.00',
        'balance_amount' => '1250.00',
    ]);

    // Booking 4: Confirmed with 6 travelers but soft-deleted (MUST BE EXCLUDED)
    $deletedBooking = Booking::create([
        'booking_reference' => 'BK-ELLA-04',
        'customer_id' => $cust->id,
        'tour_package_id' => $package->id,
        'booking_date' => '2026-10-04',
        'travel_date' => '2026-11-04',
        'currency' => 'LKR',
        'number_of_travelers' => 6,
        'booking_status' => BookingStatus::Confirmed,
        'base_amount' => '1500.00',
        'final_amount' => '1500.00',
        'paid_amount' => '1500.00',
        'balance_amount' => '0.00',
    ]);
    $deletedBooking->delete();

    $response = $this->actingAs($user)->getJson('/reports/upcoming-tours/data');
    $response->assertStatus(200);

    $row = $response->json('data.0');
    expect($row['capacity'])->toBe(25);
    // Booked travelers: 4 (confirmed) + 3 (pending) = 7 (cancelled 5 and soft-deleted 6 excluded)
    expect($row['booked_travelers'])->toBe(7);
    // Seats left: 25 - 7 = 18
    expect($row['seats_left'])->toBe(18);
    expect($row['confirmed_count'])->toBe(1);
    expect($row['pending_count'])->toBe(1);
});

// ============================================================================
// 9. UPCOMING TOURS: HIGHLIGHTING (LOW SEATS THRESHOLD & 7-DAY ALERT)
// ============================================================================

test('upcoming tours highlights packages with <= 20% seats left and tours starting within 7 days', function () {
    $user = User::factory()->superAdmin()->create();
    $today = Carbon::today();
    $cust = Customer::factory()->create();

    // Package 1: Departure in 3 days (within 7 days) -> triggers "Starting Soon"
    $pkgDepartingSoon = TourPackage::factory()->create([
        'package_name' => 'Express Jaffna Tour',
        'start_date' => $today->copy()->addDays(3)->format('Y-m-d'),
        'end_date' => $today->copy()->addDays(6)->format('Y-m-d'),
        'capacity' => 20,
        'status' => 'active',
    ]);

    // Package 2: Capacity 10, booked 9 -> 1 seat left (10% <= 20% threshold) -> triggers "Limited Seats"
    $pkgLowSeats = TourPackage::factory()->create([
        'package_name' => 'Private Wilpattu Safari',
        'start_date' => $today->copy()->addDays(40)->format('Y-m-d'),
        'end_date' => $today->copy()->addDays(43)->format('Y-m-d'),
        'capacity' => 10,
        'status' => 'active',
    ]);
    Booking::create([
        'booking_reference' => 'BK-SAFARI-01',
        'customer_id' => $cust->id,
        'tour_package_id' => $pkgLowSeats->id,
        'booking_date' => '2026-10-01',
        'travel_date' => '2026-11-01',
        'currency' => 'LKR',
        'number_of_travelers' => 9,
        'booking_status' => BookingStatus::Confirmed,
        'base_amount' => '5000.00',
        'final_amount' => '5000.00',
        'paid_amount' => '5000.00',
        'balance_amount' => '0.00',
    ]);

    // Package 3: Normal tour starting in 30 days with plenty of seats (15/20 left)
    $pkgNormal = TourPackage::factory()->create([
        'package_name' => 'Galle Fort Heritage',
        'start_date' => $today->copy()->addDays(30)->format('Y-m-d'),
        'end_date' => $today->copy()->addDays(33)->format('Y-m-d'),
        'capacity' => 20,
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->getJson('/reports/upcoming-tours/data');
    $response->assertStatus(200);

    $rows = collect($response->json('data'));

    $rowDeparting = $rows->firstWhere('package_name', 'Express Jaffna Tour');
    expect($rowDeparting['is_starting_soon'])->toBeTrue();
    expect($rowDeparting['highlight'])->toContain('Starting Soon');

    $rowLowSeats = $rows->firstWhere('package_name', 'Private Wilpattu Safari');
    expect($rowLowSeats['is_limited_seats'])->toBeTrue();
    expect($rowLowSeats['highlight'])->toContain('Limited Seats');

    $rowNormal = $rows->firstWhere('package_name', 'Galle Fort Heritage');
    expect($rowNormal['is_starting_soon'])->toBeFalse();
    expect($rowNormal['is_limited_seats'])->toBeFalse();
    expect($rowNormal['highlight'])->toBe('Available');
});

// ============================================================================
// 10. ZERO N+1 QUERY ASSERTIONS
// ============================================================================

test('upcoming tours report executes a constant number of queries regardless of package count (No N+1)', function () {
    $user = User::factory()->superAdmin()->create();
    $today = Carbon::today();
    $cust = Customer::factory()->create();

    // Warm-up auth and permission resolution
    $this->actingAs($user)->getJson('/reports/upcoming-tours/data');

    // 1 Package query count
    $pkg1 = TourPackage::factory()->create([
        'start_date' => $today->copy()->addDays(10)->format('Y-m-d'),
        'status' => 'active',
    ]);
    Booking::create([
        'booking_reference' => 'BK-N1-01',
        'customer_id' => $cust->id,
        'tour_package_id' => $pkg1->id,
        'booking_date' => '2026-10-01',
        'travel_date' => '2026-11-01',
        'currency' => 'LKR',
        'number_of_travelers' => 2,
        'booking_status' => BookingStatus::Confirmed,
        'base_amount' => '100.00',
        'final_amount' => '100.00',
        'paid_amount' => '100.00',
        'balance_amount' => '0.00',
    ]);

    DB::flushQueryLog();
    DB::enableQueryLog();
    $this->actingAs($user)->getJson('/reports/upcoming-tours/data');
    $queriesForOne = count(DB::getQueryLog());
    DB::disableQueryLog();

    // Add 9 more packages with bookings
    for ($i = 2; $i <= 10; $i++) {
        $pkg = TourPackage::factory()->create([
            'start_date' => $today->copy()->addDays(10 + $i)->format('Y-m-d'),
            'status' => 'active',
        ]);
        Booking::create([
            'booking_reference' => "BK-N1-{$i}",
            'customer_id' => $cust->id,
            'tour_package_id' => $pkg->id,
            'booking_date' => '2026-10-01',
            'travel_date' => '2026-11-01',
            'currency' => 'LKR',
            'number_of_travelers' => 2,
            'booking_status' => BookingStatus::Confirmed,
            'base_amount' => '100.00',
            'final_amount' => '100.00',
            'paid_amount' => '100.00',
            'balance_amount' => '0.00',
        ]);
    }

    DB::flushQueryLog();
    DB::enableQueryLog();
    $this->actingAs($user)->getJson('/reports/upcoming-tours/data');
    $queriesForTen = count(DB::getQueryLog());
    DB::disableQueryLog();

    // Query count MUST NOT scale linearly with rows
    expect($queriesForTen)->toBe($queriesForOne);
});

test('booking register report executes a constant number of queries regardless of row count (No N+1)', function () {
    $user = User::factory()->superAdmin()->create();
    $cust = Customer::factory()->create();
    $pkg = TourPackage::factory()->create();

    // Warm-up auth and permission resolution
    $this->actingAs($user)->getJson('/reports/booking-register/data');

    // 1 booking query count
    Booking::create([
        'booking_reference' => 'BK-CONST-01',
        'customer_id' => $cust->id,
        'tour_package_id' => $pkg->id,
        'booking_date' => '2026-10-01',
        'travel_date' => '2026-11-01',
        'currency' => 'LKR',
        'base_amount' => '100.00',
        'final_amount' => '100.00',
        'paid_amount' => '100.00',
        'balance_amount' => '0.00',
        'booking_status' => BookingStatus::Confirmed,
    ]);

    DB::flushQueryLog();
    DB::enableQueryLog();
    $this->actingAs($user)->getJson('/reports/booking-register/data');
    $queriesForOne = count(DB::getQueryLog());
    DB::disableQueryLog();

    // Add 9 more bookings
    for ($i = 2; $i <= 10; $i++) {
        Booking::create([
            'booking_reference' => "BK-CONST-{$i}",
            'customer_id' => $cust->id,
            'tour_package_id' => $pkg->id,
            'booking_date' => '2026-10-01',
            'travel_date' => '2026-11-01',
            'currency' => 'LKR',
            'base_amount' => '100.00',
            'final_amount' => '100.00',
            'paid_amount' => '100.00',
            'balance_amount' => '0.00',
            'booking_status' => BookingStatus::Confirmed,
        ]);
    }

    DB::flushQueryLog();
    DB::enableQueryLog();
    $this->actingAs($user)->getJson('/reports/booking-register/data');
    $queriesForTen = count(DB::getQueryLog());
    DB::disableQueryLog();

    // Query count MUST NOT increase with row count
    expect($queriesForTen)->toBe($queriesForOne);
});
