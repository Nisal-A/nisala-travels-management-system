<?php

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Enums\RefundStatus;
use App\Enums\SupplierType;
use App\Enums\UserRole;
use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Destination;
use App\Models\PackageCostLine;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\Supplier;
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
// 1. Authorization & Role Access Tests (RPT-11: Super Admin, Manager, Finance)
// ------------------------------------------------------------------

test('guest is redirected to login when accessing tour profitability report routes', function (string $url) {
    $this->get($url)->assertRedirect('/login');
})->with([
    '/reports/tour-profitability',
    '/reports/tour-profitability/data',
    '/reports/tour-profitability/export/csv',
]);

test('customer receives 403 when accessing tour profitability report routes', function (string $url) {
    $customer = User::factory()->customer()->create();

    $this->actingAs($customer)->get($url)->assertStatus(403);
})->with([
    '/reports/tour-profitability',
    '/reports/tour-profitability/data',
    '/reports/tour-profitability/export/csv',
]);

test('staff receives 403 when accessing tour profitability report routes', function (string $url) {
    $staff = User::factory()->staff()->create();

    $this->actingAs($staff)->get($url)->assertStatus(403);
})->with([
    '/reports/tour-profitability',
    '/reports/tour-profitability/data',
    '/reports/tour-profitability/export/csv',
]);

test('super admin can access tour profitability report page and data endpoint', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $this->actingAs($superAdmin)->get('/reports/tour-profitability')->assertStatus(200);
    $this->actingAs($superAdmin)->getJson('/reports/tour-profitability/data')->assertStatus(200);
});

test('manager can access tour profitability report page and data endpoint', function () {
    $manager = User::factory()->manager()->create();

    $this->actingAs($manager)->get('/reports/tour-profitability')->assertStatus(200);
    $this->actingAs($manager)->getJson('/reports/tour-profitability/data')->assertStatus(200);
});

test('finance can access tour profitability report page and data endpoint', function () {
    $finance = User::factory()->finance()->create();

    $this->actingAs($finance)->get('/reports/tour-profitability')->assertStatus(200);
    $this->actingAs($finance)->getJson('/reports/tour-profitability/data')->assertStatus(200);
});

// ------------------------------------------------------------------
// 2. Acceptance Scenario: Package with 2 bookings and 3 cost lines
// ------------------------------------------------------------------

test('acceptance scenario: a package with two bookings and three cost lines shows expected profit and margin', function () {
    $finance = User::factory()->finance()->create();
    $customer = Customer::factory()->create();
    $supplier = Supplier::factory()->create();

    $package = TourPackage::factory()->create([
        'package_name' => 'Signature Heritage Journey',
        'start_date' => '2026-11-10',
        'end_date' => '2026-11-17',
        'status' => 'active',
        'tier' => 'standard',
    ]);

    // Booking 1: 100,000 LKR, 2 travelers
    Booking::create([
        'booking_reference' => 'BK-ACC-001',
        'customer_id' => $customer->id,
        'tour_package_id' => $package->id,
        'booking_status' => BookingStatus::Confirmed,
        'booking_date' => '2026-10-01',
        'travel_date' => '2026-11-10',
        'return_date' => '2026-11-17',
        'number_of_travelers' => 2,
        'final_amount' => '100000.00',
        'exchange_rate_to_lkr' => '1.000000',
        'currency' => 'LKR',
    ]);

    // Booking 2: 200,000 LKR, 2 travelers
    Booking::create([
        'booking_reference' => 'BK-ACC-002',
        'customer_id' => $customer->id,
        'tour_package_id' => $package->id,
        'booking_status' => BookingStatus::Confirmed,
        'booking_date' => '2026-10-02',
        'travel_date' => '2026-11-10',
        'return_date' => '2026-11-17',
        'number_of_travelers' => 2,
        'final_amount' => '200000.00',
        'exchange_rate_to_lkr' => '1.000000',
        'currency' => 'LKR',
    ]);

    // Cost Line 1: Hotel (50,000 LKR)
    PackageCostLine::create([
        'tour_package_id' => $package->id,
        'supplier_id' => $supplier->id,
        'category' => SupplierType::Hotel,
        'description' => '5 Nights Luxury Resort',
        'amount' => '50000.00',
        'currency' => 'LKR',
        'exchange_rate_to_lkr' => '1.000000',
        'amount_lkr' => '50000.00',
        'incurred_on' => '2026-10-15',
    ]);

    // Cost Line 2: Transport (30,000 LKR)
    PackageCostLine::create([
        'tour_package_id' => $package->id,
        'supplier_id' => $supplier->id,
        'category' => SupplierType::Transport,
        'description' => 'Chauffeured Coach',
        'amount' => '30000.00',
        'currency' => 'LKR',
        'exchange_rate_to_lkr' => '1.000000',
        'amount_lkr' => '30000.00',
        'incurred_on' => '2026-10-16',
    ]);

    // Cost Line 3: Guide (20,000 LKR)
    PackageCostLine::create([
        'tour_package_id' => $package->id,
        'supplier_id' => $supplier->id,
        'category' => SupplierType::Guide,
        'description' => 'Tour Guide',
        'amount' => '20000.00',
        'currency' => 'LKR',
        'exchange_rate_to_lkr' => '1.000000',
        'amount_lkr' => '20000.00',
        'incurred_on' => '2026-10-17',
    ]);

    $response = $this->actingAs($finance)->getJson('/reports/tour-profitability/data');

    $response->assertStatus(200);
    $data = $response->json('data');
    expect($data)->toHaveCount(1);

    $row = $data[0];

    // Booked revenue: 100,000 + 200,000 = 300,000.00
    expect($row['booked_revenue'])->toBe('300000.00');

    // Total cost: 50,000 + 30,000 + 20,000 = 100,000.00
    expect($row['total_cost'])->toBe('100000.00');

    // Profit: 300,000 - 100,000 = 200,000.00
    expect($row['profit'])->toBe('200000.00');

    // Margin %: (200,000 / 300,000) * 100 = 66.67%
    expect($row['margin_percent'])->toBe('66.67%');

    // Travelers: 2 + 2 = 4
    expect($row['travelers'])->toBe(4);

    // Profit per traveler: 200,000 / 4 = 50,000.00
    expect($row['profit_per_traveler'])->toBe('50000.00');

    // Summary tiles
    $summary = $response->json('summary');
    $revTile = collect($summary)->firstWhere('key', 'total_revenue');
    $costTile = collect($summary)->firstWhere('key', 'total_cost');
    $profitTile = collect($summary)->firstWhere('key', 'total_profit');
    $marginTile = collect($summary)->firstWhere('key', 'average_margin');
    $missingTile = collect($summary)->firstWhere('key', 'packages_missing_costs');

    expect($revTile['value'])->toBe('300000.00')
        ->and($costTile['value'])->toBe('100000.00')
        ->and($profitTile['value'])->toBe('200000.00')
        ->and($marginTile['value'])->toBe('66.67')
        ->and($missingTile['value'])->toBe(0);
});

// ------------------------------------------------------------------
// 3. Exact Math with Mixed Currencies & Rounding per Booking
// ------------------------------------------------------------------

test('exact math with mixed currencies, conversion rates, and per-booking rounding', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $customer = Customer::factory()->create();
    $supplier = Supplier::factory()->create();

    $package = TourPackage::factory()->create([
        'package_name' => 'Island Explorer',
        'start_date' => '2026-12-01',
        'end_date' => '2026-12-10',
    ]);

    // Booking 1: USD 500.55 at rate 300.123456
    // 500.55 * 300.123456 = 150226.7958992 -> rounded to 150226.80 LKR
    $booking1 = Booking::create([
        'booking_reference' => 'BK-MC-001',
        'customer_id' => $customer->id,
        'tour_package_id' => $package->id,
        'booking_status' => BookingStatus::Confirmed,
        'booking_date' => '2026-10-01',
        'travel_date' => '2026-12-01',
        'return_date' => '2026-12-10',
        'number_of_travelers' => 2,
        'final_amount' => '500.55',
        'currency' => 'USD',
        'exchange_rate_to_lkr' => '300.123456',
    ]);

    // Booking 2: EUR 200.00 at rate 325.500000
    // 200.00 * 325.500000 = 65100.00 LKR
    $booking2 = Booking::create([
        'booking_reference' => 'BK-MC-002',
        'customer_id' => $customer->id,
        'tour_package_id' => $package->id,
        'booking_status' => BookingStatus::Confirmed,
        'booking_date' => '2026-10-02',
        'travel_date' => '2026-12-01',
        'return_date' => '2026-12-10',
        'number_of_travelers' => 1,
        'final_amount' => '200.00',
        'currency' => 'EUR',
        'exchange_rate_to_lkr' => '325.500000',
    ]);

    // Total Booked Revenue = 150226.80 + 65100.00 = 215326.80 LKR

    // Payments:
    // Payment 1 for Booking 1: USD 300.00 at rate 300.000000 -> amount_lkr = 90000.00
    Payment::create([
        'customer_id' => $customer->id,
        'booking_id' => $booking1->id,
        'payment_date' => '2026-10-05',
        'amount' => '300.00',
        'currency' => 'USD',
        'exchange_rate_to_lkr' => '300.000000',
        'amount_lkr' => '90000.00',
        'payment_method' => \App\Enums\PaymentMethod::BankTransfer,
        'status' => PaymentStatus::Completed,
    ]);

    // Payment 2 for Booking 2: EUR 100.00 at rate 325.500000 -> amount_lkr = 32550.00
    Payment::create([
        'customer_id' => $customer->id,
        'booking_id' => $booking2->id,
        'payment_date' => '2026-10-06',
        'amount' => '100.00',
        'currency' => 'EUR',
        'exchange_rate_to_lkr' => '325.500000',
        'amount_lkr' => '32550.00',
        'payment_method' => \App\Enums\PaymentMethod::BankTransfer,
        'status' => PaymentStatus::Completed,
    ]);

    // Paid Refund for Booking 1: USD 50.00 at rate 300.000000 -> amount_lkr = 15000.00
    Refund::create([
        'booking_id' => $booking1->id,
        'customer_id' => $customer->id,
        'requested_by' => $superAdmin->id,
        'amount' => '50.00',
        'currency' => 'USD',
        'exchange_rate_to_lkr' => '300.000000',
        'amount_lkr' => '15000.00',
        'status' => RefundStatus::Paid,
        'reason' => 'Partial excursion cancellation',
        'paid_on' => '2026-10-10',
    ]);

    // Total Collected = (90,000 + 32,550) - 15,000 = 107,550.00 LKR

    // Cost line 1: USD 250.00 at rate 300.000000 -> amount_lkr = 75000.00 (Hotel)
    PackageCostLine::create([
        'tour_package_id' => $package->id,
        'supplier_id' => $supplier->id,
        'category' => SupplierType::Hotel,
        'description' => 'Hotel Resort',
        'amount' => '250.00',
        'currency' => 'USD',
        'exchange_rate_to_lkr' => '300.000000',
        'amount_lkr' => '75000.00',
        'incurred_on' => '2026-10-15',
    ]);

    // Cost line 2: LKR 25,000.00 -> amount_lkr = 25000.00 (Transport)
    PackageCostLine::create([
        'tour_package_id' => $package->id,
        'supplier_id' => $supplier->id,
        'category' => SupplierType::Transport,
        'description' => 'Airport Transfers',
        'amount' => '25000.00',
        'currency' => 'LKR',
        'exchange_rate_to_lkr' => '1.000000',
        'amount_lkr' => '25000.00',
        'incurred_on' => '2026-10-16',
    ]);

    // Total Cost = 75,000.00 + 25,000.00 = 100,000.00 LKR
    // Profit = 215,326.80 - 100,000.00 = 115,326.80 LKR
    // Margin % = (115,326.80 / 215,326.80) * 100 = 53.56%
    // Travelers = 2 + 1 = 3
    // Profit / Traveler = 115,326.80 / 3 = 38,442.27 LKR

    $response = $this->actingAs($superAdmin)->getJson('/reports/tour-profitability/data');
    $response->assertStatus(200);

    $row = $response->json('data.0');
    expect($row['booked_revenue'])->toBe('215326.80')
        ->and($row['collected'])->toBe('107550.00')
        ->and($row['total_cost'])->toBe('100000.00')
        ->and($row['profit'])->toBe('115326.80')
        ->and($row['margin_percent'])->toBe('53.56%')
        ->and($row['profit_per_traveler'])->toBe('38442.27')
        ->and($row['cost_hotel'])->toBe('75000.00')
        ->and($row['cost_transport'])->toBe('25000.00');
});

// ------------------------------------------------------------------
// 4. Missing-Cost Handling & Exclusion from Profit Total
// ------------------------------------------------------------------

test('packages with no cost lines show Costs not entered and are excluded from profit total', function () {
    $manager = User::factory()->manager()->create();
    $customer = Customer::factory()->create();
    $supplier = Supplier::factory()->create();

    // Package 1: Has cost lines
    $pkgWithCosts = TourPackage::factory()->create([
        'package_name' => 'Package With Costs',
        'start_date' => '2026-11-01',
    ]);
    Booking::create([
        'booking_reference' => 'BK-P1-001',
        'customer_id' => $customer->id,
        'tour_package_id' => $pkgWithCosts->id,
        'booking_status' => BookingStatus::Confirmed,
        'booking_date' => '2026-10-01',
        'travel_date' => '2026-11-01',
        'number_of_travelers' => 1,
        'final_amount' => '100000.00',
        'currency' => 'LKR',
        'exchange_rate_to_lkr' => '1.000000',
    ]);
    PackageCostLine::create([
        'tour_package_id' => $pkgWithCosts->id,
        'supplier_id' => $supplier->id,
        'category' => SupplierType::Hotel,
        'description' => 'Hotel Accommodations',
        'amount' => '40000.00',
        'currency' => 'LKR',
        'exchange_rate_to_lkr' => '1.000000',
        'amount_lkr' => '40000.00',
        'incurred_on' => '2026-10-15',
    ]);

    // Package 2: Has NO cost lines
    $pkgWithoutCosts = TourPackage::factory()->create([
        'package_name' => 'Package Without Costs',
        'start_date' => '2026-11-05',
    ]);
    Booking::create([
        'booking_reference' => 'BK-P2-001',
        'customer_id' => $customer->id,
        'tour_package_id' => $pkgWithoutCosts->id,
        'booking_status' => BookingStatus::Confirmed,
        'booking_date' => '2026-10-01',
        'travel_date' => '2026-11-05',
        'number_of_travelers' => 2,
        'final_amount' => '150000.00',
        'currency' => 'LKR',
        'exchange_rate_to_lkr' => '1.000000',
    ]);

    $response = $this->actingAs($manager)->getJson('/reports/tour-profitability/data');
    $response->assertStatus(200);

    $rows = collect($response->json('data'));
    $row1 = $rows->firstWhere('package_name', 'Package With Costs');
    $row2 = $rows->firstWhere('package_name', 'Package Without Costs');

    // Package 1 shows profit
    expect($row1['profit'])->toBe('60000.00')
        ->and($row1['margin_percent'])->toBe('60.00%')
        ->and($row1['profit_per_traveler'])->toBe('60000.00');

    // Package 2 shows "Costs not entered"
    expect($row2['profit'])->toBe('Costs not entered')
        ->and($row2['margin_percent'])->toBe('Costs not entered')
        ->and($row2['profit_per_traveler'])->toBe('Costs not entered')
        ->and($row2['cost_breakdown'])->toBe('Costs not entered');

    // Summary metrics:
    // Total Revenue = 100,000 + 150,000 = 250,000.00
    // Total Cost = 40,000.00 (from Package 1)
    // Total Profit = 60,000.00 (Package 2 is EXCLUDED from profit total!)
    // Average Margin = (60,000 / 100,000) * 100 = 60.00%
    // Missing costs count = 1
    $summary = $response->json('summary');
    $revTile = collect($summary)->firstWhere('key', 'total_revenue');
    $costTile = collect($summary)->firstWhere('key', 'total_cost');
    $profitTile = collect($summary)->firstWhere('key', 'total_profit');
    $marginTile = collect($summary)->firstWhere('key', 'average_margin');
    $missingTile = collect($summary)->firstWhere('key', 'packages_missing_costs');

    expect($revTile['value'])->toBe('250000.00')
        ->and($costTile['value'])->toBe('40000.00')
        ->and($profitTile['value'])->toBe('60000.00')
        ->and($marginTile['value'])->toBe('60.00')
        ->and($missingTile['value'])->toBe(1);
});

// ------------------------------------------------------------------
// 5. Cancelled Bookings & Soft-Deleted/Failed Payments Excluded
// ------------------------------------------------------------------

test('cancelled bookings and failed or soft-deleted payments are completely excluded from totals', function () {
    $finance = User::factory()->finance()->create();
    $customer = Customer::factory()->create();
    $supplier = Supplier::factory()->create();

    $package = TourPackage::factory()->create([
        'package_name' => 'Safari Expeditions',
        'start_date' => '2026-11-20',
    ]);

    // Active confirmed booking: 100,000 LKR, 2 travelers
    $confirmedBooking = Booking::create([
        'booking_reference' => 'BK-ACT-001',
        'customer_id' => $customer->id,
        'tour_package_id' => $package->id,
        'booking_status' => BookingStatus::Confirmed,
        'booking_date' => '2026-10-01',
        'travel_date' => '2026-11-20',
        'number_of_travelers' => 2,
        'final_amount' => '100000.00',
        'currency' => 'LKR',
        'exchange_rate_to_lkr' => '1.000000',
    ]);

    // Cancelled booking: 80,000 LKR, 3 travelers (MUST BE EXCLUDED)
    $cancelledBooking = Booking::create([
        'booking_reference' => 'BK-CANC-001',
        'customer_id' => $customer->id,
        'tour_package_id' => $package->id,
        'booking_status' => BookingStatus::Cancelled,
        'booking_date' => '2026-10-01',
        'travel_date' => '2026-11-20',
        'number_of_travelers' => 3,
        'final_amount' => '80000.00',
        'currency' => 'LKR',
        'exchange_rate_to_lkr' => '1.000000',
    ]);

    // Valid payment on confirmed booking: 50,000 LKR
    Payment::create([
        'customer_id' => $customer->id,
        'booking_id' => $confirmedBooking->id,
        'payment_date' => '2026-10-05',
        'amount' => '50000.00',
        'currency' => 'LKR',
        'exchange_rate_to_lkr' => '1.000000',
        'amount_lkr' => '50000.00',
        'payment_method' => \App\Enums\PaymentMethod::BankTransfer,
        'status' => PaymentStatus::Completed,
    ]);

    // Failed payment on confirmed booking: 20,000 LKR (MUST BE EXCLUDED)
    Payment::create([
        'customer_id' => $customer->id,
        'booking_id' => $confirmedBooking->id,
        'payment_date' => '2026-10-06',
        'amount' => '20000.00',
        'currency' => 'LKR',
        'exchange_rate_to_lkr' => '1.000000',
        'amount_lkr' => '20000.00',
        'payment_method' => \App\Enums\PaymentMethod::CreditCard,
        'status' => PaymentStatus::Failed,
    ]);

    // Soft-deleted payment on confirmed booking: 15,000 LKR (MUST BE EXCLUDED)
    $softDeletedPayment = Payment::create([
        'customer_id' => $customer->id,
        'booking_id' => $confirmedBooking->id,
        'payment_date' => '2026-10-07',
        'amount' => '15000.00',
        'currency' => 'LKR',
        'exchange_rate_to_lkr' => '1.000000',
        'amount_lkr' => '15000.00',
        'payment_method' => \App\Enums\PaymentMethod::BankTransfer,
        'status' => PaymentStatus::Completed,
    ]);
    $softDeletedPayment->delete();

    // Payment on CANCELLED booking: 40,000 LKR (MUST BE EXCLUDED)
    Payment::create([
        'customer_id' => $customer->id,
        'booking_id' => $cancelledBooking->id,
        'payment_date' => '2026-10-08',
        'amount' => '40000.00',
        'currency' => 'LKR',
        'exchange_rate_to_lkr' => '1.000000',
        'amount_lkr' => '40000.00',
        'payment_method' => \App\Enums\PaymentMethod::BankTransfer,
        'status' => PaymentStatus::Completed,
    ]);

    // Cost line: 30,000 LKR
    PackageCostLine::create([
        'tour_package_id' => $package->id,
        'supplier_id' => $supplier->id,
        'category' => SupplierType::Other,
        'description' => 'Other Services',
        'amount' => '30000.00',
        'currency' => 'LKR',
        'exchange_rate_to_lkr' => '1.000000',
        'amount_lkr' => '30000.00',
        'incurred_on' => '2026-10-15',
    ]);

    $response = $this->actingAs($finance)->getJson('/reports/tour-profitability/data');
    $response->assertStatus(200);

    $row = $response->json('data.0');

    // Only confirmed booking counted: 100,000.00 (not 180,000.00)
    expect($row['booked_revenue'])->toBe('100000.00');

    // Only valid payment counted: 50,000.00 (not failed, soft-deleted, or cancelled booking payment)
    expect($row['collected'])->toBe('50000.00');

    // Only confirmed booking travelers counted: 2 (not 5)
    expect($row['travelers'])->toBe(2);

    // Profit: 100,000 - 30,000 = 70,000.00
    expect($row['profit'])->toBe('70000.00')
        ->and($row['profit_per_traveler'])->toBe('35000.00')
        ->and($row['margin_percent'])->toBe('70.00%');
});

// ------------------------------------------------------------------
// 6. Filtering Tests (Date Range, Destination, Tier, Status, Only With Costs)
// ------------------------------------------------------------------

test('tour profitability filters work correctly for date range, destination, tier, status, and only with costs', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $supplier = Supplier::factory()->create();

    $dest1 = Destination::factory()->create(['country' => 'Sri Lanka', 'city_region' => 'Ella']);
    $dest2 = Destination::factory()->create(['country' => 'Maldives', 'city_region' => 'Male']);

    // Pkg 1: Ella, standard, active, 2026-11-01, has costs
    $pkg1 = TourPackage::factory()->create([
        'package_name' => 'Ella Hills Tour',
        'destination_id' => $dest1->id,
        'tier' => 'standard',
        'status' => 'active',
        'start_date' => '2026-11-01',
    ]);
    PackageCostLine::create([
        'tour_package_id' => $pkg1->id,
        'supplier_id' => $supplier->id,
        'category' => SupplierType::Hotel,
        'description' => 'Hotel Ella',
        'amount' => '20000.00',
        'currency' => 'LKR',
        'amount_lkr' => '20000.00',
        'incurred_on' => '2026-10-15',
    ]);

    // Pkg 2: Male, luxury, draft, 2026-11-15, no costs
    $pkg2 = TourPackage::factory()->create([
        'package_name' => 'Maldives Escape',
        'destination_id' => $dest2->id,
        'tier' => 'luxury',
        'status' => 'draft',
        'start_date' => '2026-11-15',
    ]);

    // Pkg 3: Ella, budget, active, 2026-12-10, has costs
    $pkg3 = TourPackage::factory()->create([
        'package_name' => 'Ella Backpacking',
        'destination_id' => $dest1->id,
        'tier' => 'budget',
        'status' => 'active',
        'start_date' => '2026-12-10',
    ]);
    PackageCostLine::create([
        'tour_package_id' => $pkg3->id,
        'supplier_id' => $supplier->id,
        'category' => SupplierType::Transport,
        'description' => 'Transport Ella',
        'amount' => '15000.00',
        'currency' => 'LKR',
        'amount_lkr' => '15000.00',
        'incurred_on' => '2026-10-15',
    ]);

    // 1. Filter by destination (Ella)
    $resDest = $this->actingAs($superAdmin)->getJson("/reports/tour-profitability/data?destination_id={$dest1->id}");
    expect($resDest->json('total'))->toBe(2);

    // 2. Filter by tier (luxury)
    $resTier = $this->actingAs($superAdmin)->getJson('/reports/tour-profitability/data?tier=luxury');
    expect($resTier->json('total'))->toBe(1)
        ->and($resTier->json('data.0.package_name'))->toBe('Maldives Escape');

    // 3. Filter by status (active)
    $resStatus = $this->actingAs($superAdmin)->getJson('/reports/tour-profitability/data?status=active');
    expect($resStatus->json('total'))->toBe(2);

    // 4. Filter by date range (November only)
    $resDate = $this->actingAs($superAdmin)->getJson('/reports/tour-profitability/data?date_from=2026-11-01&date_to=2026-11-30');
    expect($resDate->json('total'))->toBe(2);

    // 5. Filter only with costs
    $resWithCosts = $this->actingAs($superAdmin)->getJson('/reports/tour-profitability/data?only_with_costs=1');
    expect($resWithCosts->json('total'))->toBe(2);

    // 6. Filter missing costs
    $resMissingCosts = $this->actingAs($superAdmin)->getJson('/reports/tour-profitability/data?only_with_costs=0');
    expect($resMissingCosts->json('total'))->toBe(1)
        ->and($resMissingCosts->json('data.0.package_name'))->toBe('Maldives Escape');
});

// ------------------------------------------------------------------
// 7. Export Tests (CSV, Excel, PDF)
// ------------------------------------------------------------------

test('allowed role can stream CSV export for tour profitability report', function () {
    $finance = User::factory()->finance()->create();

    $package = TourPackage::factory()->create([
        'package_name' => 'Highland Wonders',
        'start_date' => '2026-11-10',
    ]);

    $response = $this->actingAs($finance)->get('/reports/tour-profitability/export/csv');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    expect($response->headers->get('Content-Disposition'))->toContain('attachment')
        ->and($response->headers->get('Content-Disposition'))->toContain('tour-profitability-report-');

    ob_start();
    $response->sendContent();
    $csvContent = ob_get_clean();

    expect($csvContent)->toContain('Tour Package')
        ->and($csvContent)->toContain('Booked Revenue')
        ->and($csvContent)->toContain('Highland Wonders');

    // Verify ActivityLog was created
    $log = ActivityLog::where('log_name', 'report_export')->latest()->first();
    expect($log)->not->toBeNull()
        ->and($log->properties['report'])->toBe('tour-profitability')
        ->and($log->properties['format'])->toBe('csv');
});

test('allowed role can download Excel export for tour profitability report', function () {
    $manager = User::factory()->manager()->create();

    TourPackage::factory()->create([
        'package_name' => 'Excel Tour Export',
        'start_date' => '2026-11-10',
    ]);

    $response = $this->actingAs($manager)->get('/reports/tour-profitability/export/excel');

    $response->assertStatus(200);
    expect($response->headers->get('Content-Disposition'))->toContain('tour-profitability-report-')
        ->and($response->headers->get('Content-Disposition'))->toContain('.xlsx');
});

test('allowed role can download PDF export for tour profitability report', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    TourPackage::factory()->create([
        'package_name' => 'PDF Tour Export',
        'start_date' => '2026-11-10',
    ]);

    $response = $this->actingAs($superAdmin)->get('/reports/tour-profitability/export/pdf');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/pdf');
    expect($response->headers->get('Content-Disposition'))->toContain('tour-profitability-report-')
        ->and($response->headers->get('Content-Disposition'))->toContain('.pdf');
});
