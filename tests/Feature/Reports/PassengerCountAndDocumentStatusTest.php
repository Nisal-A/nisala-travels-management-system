<?php

use App\Enums\BookingStatus;
use App\Enums\TravelerType;
use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\BookingTraveler;
use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Models\Destination;
use App\Models\DocumentType;
use App\Models\TourPackage;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\ReportPermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(ReportPermissionSeeder::class);
});

// ------------------------------------------------------------------
// 1. Guest & Customer Access Tests
// ------------------------------------------------------------------

test('guest is redirected to login when accessing passenger count or document status', function (string $url) {
    $response = $this->get($url);
    $response->assertRedirect('/login');
})->with([
    '/reports/passenger-count',
    '/reports/passenger-count/data',
    '/reports/document-status',
    '/reports/document-status/data',
]);

test('customer receives 403 when accessing passenger count or document status', function (string $url) {
    $customer = User::factory()->customer()->create();

    $response = $this->actingAs($customer)->get($url);
    $response->assertStatus(403);
})->with([
    '/reports/passenger-count',
    '/reports/passenger-count/data',
    '/reports/document-status',
    '/reports/document-status/data',
]);

test('finance receives 403 when accessing operational reports passenger-count and document-status', function (string $url) {
    $finance = User::factory()->finance()->create();

    $response = $this->actingAs($finance)->get($url);
    $response->assertStatus(403);
})->with([
    '/reports/passenger-count',
    '/reports/passenger-count/data',
    '/reports/document-status',
    '/reports/document-status/data',
]);

test('super admin, manager, and staff can access both operational reports and their data endpoints', function (string $roleMethod, string $url) {
    $user = User::factory()->{$roleMethod}()->create();

    $response = $this->actingAs($user)->get($url);
    $response->assertStatus(200);
})->with([
    ['superAdmin', '/reports/passenger-count'],
    ['superAdmin', '/reports/passenger-count/data'],
    ['superAdmin', '/reports/document-status'],
    ['superAdmin', '/reports/document-status/data'],
    ['manager', '/reports/passenger-count'],
    ['manager', '/reports/passenger-count/data'],
    ['manager', '/reports/document-status'],
    ['manager', '/reports/document-status/data'],
    ['staff', '/reports/passenger-count'],
    ['staff', '/reports/passenger-count/data'],
    ['staff', '/reports/document-status'],
    ['staff', '/reports/document-status/data'],
]);

test('staff, manager, and super admin can export passenger count and document status in CSV, Excel, and PDF', function (string $roleMethod, string $reportKey, string $format) {
    $user = User::factory()->{$roleMethod}()->create();

    $response = $this->actingAs($user)->get("/reports/{$reportKey}/export/{$format}");
    $response->assertStatus(200);
})->with([
    ['staff', 'passenger-count', 'csv'],
    ['staff', 'passenger-count', 'excel'],
    ['staff', 'passenger-count', 'pdf'],
    ['staff', 'document-status', 'csv'],
    ['staff', 'document-status', 'excel'],
    ['staff', 'document-status', 'pdf'],
    ['manager', 'passenger-count', 'csv'],
    ['manager', 'document-status', 'excel'],
    ['superAdmin', 'passenger-count', 'pdf'],
    ['superAdmin', 'document-status', 'pdf'],
]);

// ------------------------------------------------------------------
// 2. Passenger Count Report Tests (reports.passenger-count)
// ------------------------------------------------------------------

test('passenger count returns specified columns', function () {
    $user = User::factory()->staff()->create();
    $report = app(\App\Reports\ReportRegistry::class)->get('passenger-count');

    $keys = array_column($report->columns(), 'key');

    expect($keys)->toContain('group_label', 'adults', 'children', 'infants', 'total', 'bookings_count');
});

test('passenger count groups travelers correctly by package', function () {
    $user = User::factory()->staff()->create();
    $customer = Customer::factory()->create();
    $destination = Destination::factory()->create();

    $pkg1 = TourPackage::factory()->create(['package_name' => 'Safari Adventure', 'destination_id' => $destination->id]);
    $pkg2 = TourPackage::factory()->create(['package_name' => 'Island Paradise', 'destination_id' => $destination->id]);

    $b1 = Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $pkg1->id,
        'booking_status' => BookingStatus::Confirmed,
        'number_of_travelers' => 3,
    ]);
    BookingTraveler::factory()->create(['booking_id' => $b1->id, 'traveler_type' => TravelerType::Adult]);
    BookingTraveler::factory()->create(['booking_id' => $b1->id, 'traveler_type' => TravelerType::Adult]);
    BookingTraveler::factory()->create(['booking_id' => $b1->id, 'traveler_type' => TravelerType::Child]);

    $b2 = Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $pkg2->id,
        'booking_status' => BookingStatus::Confirmed,
        'number_of_travelers' => 2,
    ]);
    BookingTraveler::factory()->create(['booking_id' => $b2->id, 'traveler_type' => TravelerType::Adult]);
    BookingTraveler::factory()->create(['booking_id' => $b2->id, 'traveler_type' => TravelerType::Infant]);

    $response = $this->actingAs($user)->getJson('/reports/passenger-count/data?group_by=package');
    $response->assertStatus(200);

    $data = collect($response->json('data'));
    $safari = $data->firstWhere('group_label', 'Safari Adventure');
    $island = $data->firstWhere('group_label', 'Island Paradise');

    expect($safari)->not->toBeNull();
    expect($safari['adults'])->toBe(2);
    expect($safari['children'])->toBe(1);
    expect($safari['infants'])->toBe(0);
    expect($safari['total'])->toBe(3);
    expect($safari['bookings_count'])->toBe(1);

    expect($island)->not->toBeNull();
    expect($island['adults'])->toBe(1);
    expect($island['children'])->toBe(0);
    expect($island['infants'])->toBe(1);
    expect($island['total'])->toBe(2);
    expect($island['bookings_count'])->toBe(1);
});

test('passenger count groups travelers correctly by travel date, destination, and month', function (string $groupByField) {
    $user = User::factory()->staff()->create();
    $customer = Customer::factory()->create();
    $dest = Destination::factory()->create(['country' => 'Thailand', 'city_region' => 'Bangkok']);
    $pkg = TourPackage::factory()->create(['destination_id' => $dest->id]);

    $booking = Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $pkg->id,
        'travel_date' => '2026-11-15',
        'booking_status' => BookingStatus::Confirmed,
        'number_of_travelers' => 2,
    ]);
    BookingTraveler::factory()->create(['booking_id' => $booking->id, 'traveler_type' => TravelerType::Adult]);
    BookingTraveler::factory()->create(['booking_id' => $booking->id, 'traveler_type' => TravelerType::Child]);

    $response = $this->actingAs($user)->getJson("/reports/passenger-count/data?group_by={$groupByField}");
    $response->assertStatus(200);

    $rows = $response->json('data');
    expect(count($rows))->toBeGreaterThanOrEqual(1);

    $row = $rows[0];
    expect($row['adults'])->toBe(1);
    expect($row['children'])->toBe(1);
    expect($row['total'])->toBe(2);
    expect($row['bookings_count'])->toBe(1);

    if ($groupByField === 'travel_date') {
        expect($row['group_label'])->toBe('2026-11-15');
    } elseif ($groupByField === 'destination') {
        expect($row['group_label'])->toContain('Bangkok');
    } elseif ($groupByField === 'month') {
        expect($row['group_label'])->toBe('2026-11');
    }
})->with([
    'travel_date',
    'destination',
    'month',
]);

test('passenger count flags rows where traveler records differ from sum of bookings.number_of_travelers', function () {
    $user = User::factory()->staff()->create();
    $customer = Customer::factory()->create();
    $pkg = TourPackage::factory()->create(['package_name' => 'Mismatched Tour']);

    // Booking expects 4 travelers, but only 2 records entered
    $booking = Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $pkg->id,
        'number_of_travelers' => 4,
        'booking_status' => BookingStatus::Confirmed,
    ]);
    BookingTraveler::factory()->create(['booking_id' => $booking->id, 'traveler_type' => TravelerType::Adult]);
    BookingTraveler::factory()->create(['booking_id' => $booking->id, 'traveler_type' => TravelerType::Adult]);

    $response = $this->actingAs($user)->getJson('/reports/passenger-count/data?group_by=package');
    $response->assertStatus(200);

    $row = collect($response->json('data'))->firstWhere('group_label', 'Mismatched Tour');
    expect($row)->not->toBeNull();
    expect($row['total'])->toBe(2);
    expect($row['expected_travelers'])->toBe(4);
    expect($row['has_discrepancy'])->toBeTrue();
    expect($row['reconciliation'])->toContain('Mismatch');
});

test('passenger count reconciles matched rows where traveler records equal sum of bookings.number_of_travelers', function () {
    $user = User::factory()->staff()->create();
    $customer = Customer::factory()->create();
    $pkg = TourPackage::factory()->create(['package_name' => 'Matched Tour']);

    // Booking expects 2 travelers, exactly 2 records entered
    $booking = Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $pkg->id,
        'number_of_travelers' => 2,
        'booking_status' => BookingStatus::Confirmed,
    ]);
    BookingTraveler::factory()->create(['booking_id' => $booking->id, 'traveler_type' => TravelerType::Adult]);
    BookingTraveler::factory()->create(['booking_id' => $booking->id, 'traveler_type' => TravelerType::Child]);

    $response = $this->actingAs($user)->getJson('/reports/passenger-count/data?group_by=package');
    $response->assertStatus(200);

    $row = collect($response->json('data'))->firstWhere('group_label', 'Matched Tour');
    expect($row)->not->toBeNull();
    expect($row['total'])->toBe(2);
    expect($row['expected_travelers'])->toBe(2);
    expect($row['has_discrepancy'])->toBeFalse();
    expect($row['reconciliation'])->toBe('Matched');
});

test('passenger count excludes cancelled and soft-deleted bookings', function () {
    $user = User::factory()->staff()->create();
    $customer = Customer::factory()->create();
    $pkg = TourPackage::factory()->create(['package_name' => 'Active Tour']);

    // Valid confirmed booking
    $b1 = Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $pkg->id,
        'booking_status' => BookingStatus::Confirmed,
        'number_of_travelers' => 2,
    ]);
    BookingTraveler::factory()->create(['booking_id' => $b1->id, 'traveler_type' => TravelerType::Adult]);
    BookingTraveler::factory()->create(['booking_id' => $b1->id, 'traveler_type' => TravelerType::Adult]);

    // Cancelled booking
    $b2 = Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $pkg->id,
        'booking_status' => BookingStatus::Cancelled,
        'number_of_travelers' => 5,
    ]);
    BookingTraveler::factory()->create(['booking_id' => $b2->id, 'traveler_type' => TravelerType::Adult]);

    // Soft-deleted booking
    $b3 = Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $pkg->id,
        'booking_status' => BookingStatus::Confirmed,
        'number_of_travelers' => 3,
    ]);
    BookingTraveler::factory()->create(['booking_id' => $b3->id, 'traveler_type' => TravelerType::Child]);
    $b3->delete();

    $response = $this->actingAs($user)->getJson('/reports/passenger-count/data?group_by=package');
    $response->assertStatus(200);

    $row = collect($response->json('data'))->firstWhere('group_label', 'Active Tour');
    expect($row)->not->toBeNull();
    expect($row['total'])->toBe(2);
    expect($row['bookings_count'])->toBe(1);
});

test('passenger count summary calculates accurate aggregates across groups', function () {
    $user = User::factory()->staff()->create();
    $customer = Customer::factory()->create();
    $pkg = TourPackage::factory()->create(['package_name' => 'Summary Tour']);

    $b1 = Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $pkg->id,
        'booking_status' => BookingStatus::Confirmed,
        'number_of_travelers' => 3,
    ]);
    BookingTraveler::factory()->create(['booking_id' => $b1->id, 'traveler_type' => TravelerType::Adult]);
    BookingTraveler::factory()->create(['booking_id' => $b1->id, 'traveler_type' => TravelerType::Child]);
    BookingTraveler::factory()->create(['booking_id' => $b1->id, 'traveler_type' => TravelerType::Infant]);

    $response = $this->actingAs($user)->getJson('/reports/passenger-count/data?group_by=package');
    $response->assertStatus(200);

    $summary = collect($response->json('summary'))->keyBy('key');
    expect($summary['total_passengers']['value'])->toBe(3);
    expect($summary['adults_count']['value'])->toBe(1);
    expect($summary['children_count']['value'])->toBe(1);
    expect($summary['infants_count']['value'])->toBe(1);
    expect($summary['total_bookings']['value'])->toBe(1);
});

// ------------------------------------------------------------------
// 3. Document Status Report Tests (reports.document-status)
// ------------------------------------------------------------------

test('document status classifies each status accurately matching fixtures', function (string $targetStatus, \Closure $setupFixture) {
    $user = User::factory()->staff()->create();
    $fixtureData = $setupFixture();

    $response = $this->actingAs($user)->getJson('/reports/document-status/data');
    $response->assertStatus(200);

    $data = collect($response->json('data'));
    $match = $data->firstWhere('customer_id', $fixtureData['customer']->customer_id);

    expect($match)->not->toBeNull();
    expect($match['status'])->toBe($targetStatus);

    if (isset($fixtureData['expected_rejection'])) {
        expect($match['rejection_reason'])->toBe($fixtureData['expected_rejection']);
    }
})->with([
    'Missing' => [
        'Missing',
        function () {
            // Customer with future non-cancelled booking and active required document type, but no document uploaded
            $customer = Customer::factory()->create(['customer_id' => 'CUST-MISSING-1']);
            $docType = DocumentType::factory()->create([
                'name' => 'Passport Required',
                'is_active' => true,
                'is_required' => true,
                'tracks_expiry' => true,
            ]);
            Booking::factory()->create([
                'customer_id' => $customer->id,
                'booking_status' => BookingStatus::Confirmed,
                'travel_date' => now()->addDays(45)->toDateString(),
            ]);

            return ['customer' => $customer];
        },
    ],
    'Pending' => [
        'Pending',
        function () {
            // Customer with active document under pending verification
            $customer = Customer::factory()->create(['customer_id' => 'CUST-PENDING-1']);
            $docType = DocumentType::factory()->create([
                'name' => 'National ID',
                'is_active' => true,
                'tracks_expiry' => false,
            ]);
            $booking = Booking::factory()->create([
                'customer_id' => $customer->id,
                'booking_status' => BookingStatus::Confirmed,
                'travel_date' => now()->addDays(30)->toDateString(),
            ]);
            CustomerDocument::factory()->create([
                'customer_id' => $customer->id,
                'booking_id' => $booking->id,
                'document_type_id' => $docType->id,
                'document_status' => 'active',
                'verification_status' => 'Pending',
                'expiry_date' => null,
            ]);

            return ['customer' => $customer];
        },
    ],
    'Verified' => [
        'Verified',
        function () {
            // Verified document expiring far in the future
            $customer = Customer::factory()->create(['customer_id' => 'CUST-VERIFIED-1']);
            $docType = DocumentType::factory()->create([
                'name' => 'Passport Good',
                'is_active' => true,
                'tracks_expiry' => true,
            ]);
            $booking = Booking::factory()->create([
                'customer_id' => $customer->id,
                'booking_status' => BookingStatus::Confirmed,
                'travel_date' => now()->addDays(30)->toDateString(),
            ]);
            // Expiry 2 years away (well beyond travel date + 6 months)
            CustomerDocument::factory()->create([
                'customer_id' => $customer->id,
                'booking_id' => $booking->id,
                'document_type_id' => $docType->id,
                'document_status' => 'active',
                'verification_status' => 'Verified',
                'expiry_date' => now()->addYears(2)->toDateString(),
            ]);

            return ['customer' => $customer];
        },
    ],
    'Rejected' => [
        'Rejected',
        function () {
            // Rejected document with reason
            $customer = Customer::factory()->create(['customer_id' => 'CUST-REJECTED-1']);
            $docType = DocumentType::factory()->create([
                'name' => 'Visa Copy',
                'is_active' => true,
            ]);
            $booking = Booking::factory()->create([
                'customer_id' => $customer->id,
                'booking_status' => BookingStatus::Confirmed,
                'travel_date' => now()->addDays(30)->toDateString(),
            ]);
            CustomerDocument::factory()->create([
                'customer_id' => $customer->id,
                'booking_id' => $booking->id,
                'document_type_id' => $docType->id,
                'document_status' => 'active',
                'verification_status' => 'Rejected',
                'rejection_reason' => 'Image is blurry and unreadable.',
            ]);

            return [
                'customer' => $customer,
                'expected_rejection' => 'Image is blurry and unreadable.',
            ];
        },
    ],
    'Expired' => [
        'Expired',
        function () {
            // Document whose expiry date has already passed
            $customer = Customer::factory()->create(['customer_id' => 'CUST-EXPIRED-1']);
            $docType = DocumentType::factory()->create([
                'name' => 'Passport Expired',
                'is_active' => true,
                'tracks_expiry' => true,
            ]);
            $booking = Booking::factory()->create([
                'customer_id' => $customer->id,
                'booking_status' => BookingStatus::Confirmed,
                'travel_date' => now()->addDays(60)->toDateString(),
            ]);
            CustomerDocument::factory()->create([
                'customer_id' => $customer->id,
                'booking_id' => $booking->id,
                'document_type_id' => $docType->id,
                'document_status' => 'active',
                'verification_status' => 'Verified',
                'expiry_date' => now()->subDays(5)->toDateString(),
            ]);

            return ['customer' => $customer];
        },
    ],
    'Expiring soon' => [
        'Expiring soon',
        function () {
            // Document expiring within 6 months of booking's travel date
            $customer = Customer::factory()->create(['customer_id' => 'CUST-EXP-SOON-1']);
            $docType = DocumentType::factory()->create([
                'name' => 'Passport Warning',
                'is_active' => true,
                'tracks_expiry' => true,
            ]);
            $travelDate = now()->addMonths(2);
            $booking = Booking::factory()->create([
                'customer_id' => $customer->id,
                'booking_status' => BookingStatus::Confirmed,
                'travel_date' => $travelDate->toDateString(),
            ]);
            // Expires 3 months after travel date (which is < 6 months buffer!)
            CustomerDocument::factory()->create([
                'customer_id' => $customer->id,
                'booking_id' => $booking->id,
                'document_type_id' => $docType->id,
                'document_status' => 'active',
                'verification_status' => 'Verified',
                'expiry_date' => $travelDate->copy()->addMonths(3)->toDateString(),
            ]);

            return ['customer' => $customer];
        },
    ],
]);

test('replaced documents and soft deleted documents are ignored by document status report', function () {
    $user = User::factory()->staff()->create();
    $customer = Customer::factory()->create(['customer_id' => 'CUST-REPLACE-1']);
    $docType = DocumentType::factory()->create(['name' => 'Passport Test', 'is_active' => true]);

    $booking = Booking::factory()->create([
        'customer_id' => $customer->id,
        'booking_status' => BookingStatus::Confirmed,
        'travel_date' => now()->addMonths(3)->toDateString(),
    ]);

    // Replaced document (replaced_by_id is set)
    $replacementDoc = CustomerDocument::factory()->create([
        'customer_id' => $customer->id,
        'booking_id' => $booking->id,
        'document_type_id' => $docType->id,
        'document_status' => 'active',
        'verification_status' => 'Verified',
        'original_filename' => 'valid_passport.pdf',
    ]);

    $oldDoc = CustomerDocument::factory()->create([
        'customer_id' => $customer->id,
        'booking_id' => $booking->id,
        'document_type_id' => $docType->id,
        'document_status' => 'replaced',
        'replaced_by_id' => $replacementDoc->id,
        'original_filename' => 'old_passport.pdf',
    ]);

    // Soft-deleted document
    $deletedDoc = CustomerDocument::factory()->create([
        'customer_id' => $customer->id,
        'booking_id' => $booking->id,
        'document_type_id' => $docType->id,
        'document_status' => 'active',
        'original_filename' => 'deleted_passport.pdf',
    ]);
    $deletedDoc->delete();

    $response = $this->actingAs($user)->getJson('/reports/document-status/data');
    $response->assertStatus(200);

    $customerRows = collect($response->json('data'))->where('customer_id', 'CUST-REPLACE-1')->values();

    // Only the replacement document should be present; the old and deleted ones must be ignored
    expect($customerRows->count())->toBe(1);
    expect($customerRows[0]['status'])->toBe('Verified');
});

test('6-month rule boundary dates correctly classify documents expiring near travel date', function () {
    $user = User::factory()->staff()->create();
    $customer1 = Customer::factory()->create(['customer_id' => 'CUST-INSIDE-6M']);
    $customer2 = Customer::factory()->create(['customer_id' => 'CUST-OUTSIDE-6M']);

    $docType = DocumentType::factory()->create([
        'name' => 'Passport Boundary',
        'is_active' => true,
        'tracks_expiry' => true,
    ]);

    $travelDate = now()->addMonths(2)->startOfDay();

    // Booking 1: travel date
    $b1 = Booking::factory()->create([
        'customer_id' => $customer1->id,
        'booking_status' => BookingStatus::Confirmed,
        'travel_date' => $travelDate->toDateString(),
    ]);
    // Customer 1 document expires exactly 5 months after travel date (inside 6-month threshold)
    CustomerDocument::factory()->create([
        'customer_id' => $customer1->id,
        'booking_id' => $b1->id,
        'document_type_id' => $docType->id,
        'document_status' => 'active',
        'verification_status' => 'Verified',
        'expiry_date' => $travelDate->copy()->addMonths(5)->toDateString(),
    ]);

    // Booking 2: travel date
    $b2 = Booking::factory()->create([
        'customer_id' => $customer2->id,
        'booking_status' => BookingStatus::Confirmed,
        'travel_date' => $travelDate->toDateString(),
    ]);
    // Customer 2 document expires 8 months after travel date (outside 6-month threshold)
    CustomerDocument::factory()->create([
        'customer_id' => $customer2->id,
        'booking_id' => $b2->id,
        'document_type_id' => $docType->id,
        'document_status' => 'active',
        'verification_status' => 'Verified',
        'expiry_date' => $travelDate->copy()->addMonths(8)->toDateString(),
    ]);

    $response = $this->actingAs($user)->getJson('/reports/document-status/data');
    $response->assertStatus(200);

    $insideRow = collect($response->json('data'))->firstWhere('customer_id', 'CUST-INSIDE-6M');
    $outsideRow = collect($response->json('data'))->firstWhere('customer_id', 'CUST-OUTSIDE-6M');

    expect($insideRow['status'])->toBe('Expiring soon');
    expect($insideRow['is_flagged'])->toBeTrue();

    expect($outsideRow['status'])->toBe('Verified');
    expect($outsideRow['is_flagged'])->toBeFalse();
});

test('document status filters work correctly by status, document_type, and date_range', function () {
    $user = User::factory()->staff()->create();
    $customer = Customer::factory()->create(['customer_id' => 'CUST-FILTER-1']);
    $docType1 = DocumentType::factory()->create(['name' => 'Doc Type A', 'is_active' => true]);
    $docType2 = DocumentType::factory()->create(['name' => 'Doc Type B', 'is_active' => true]);

    $booking = Booking::factory()->create([
        'customer_id' => $customer->id,
        'booking_status' => BookingStatus::Confirmed,
        'travel_date' => '2026-11-20',
    ]);

    CustomerDocument::factory()->create([
        'customer_id' => $customer->id,
        'booking_id' => $booking->id,
        'document_type_id' => $docType1->id,
        'document_status' => 'active',
        'verification_status' => 'Verified',
        'expiry_date' => now()->addYears(2)->toDateString(),
    ]);

    CustomerDocument::factory()->create([
        'customer_id' => $customer->id,
        'booking_id' => $booking->id,
        'document_type_id' => $docType2->id,
        'document_status' => 'active',
        'verification_status' => 'Rejected',
        'rejection_reason' => 'Invalid format',
    ]);

    // Filter by status=Verified
    $resVerified = $this->actingAs($user)->getJson('/reports/document-status/data?status=Verified');
    $resVerified->assertStatus(200);
    $verifiedRows = collect($resVerified->json('data'))->where('customer_id', 'CUST-FILTER-1');
    expect($verifiedRows->count())->toBe(1);
    expect($verifiedRows->first()['status'])->toBe('Verified');

    // Filter by document_type_id
    $resType = $this->actingAs($user)->getJson("/reports/document-status/data?document_type_id={$docType2->id}");
    $resType->assertStatus(200);
    $typeRows = collect($resType->json('data'))->where('customer_id', 'CUST-FILTER-1');
    expect($typeRows->count())->toBe(1);
    expect($typeRows->first()['document_type'])->toBe('Doc Type B');
});

test('passenger count report executes a constant number of queries regardless of booking count (No N+1)', function () {
    $user = User::factory()->staff()->create();
    $customer = Customer::factory()->create();
    $pkg = TourPackage::factory()->create();

    // Warm-up query to cache permissions and auth
    $this->actingAs($user)->getJson('/reports/passenger-count/data');

    // Baseline: 1 booking with travelers
    $b1 = Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $pkg->id,
        'booking_status' => BookingStatus::Confirmed,
        'number_of_travelers' => 2,
    ]);
    BookingTraveler::factory()->create(['booking_id' => $b1->id, 'traveler_type' => TravelerType::Adult]);

    DB::flushQueryLog();
    DB::enableQueryLog();
    $this->actingAs($user)->getJson('/reports/passenger-count/data');
    $queriesForOne = count(DB::getQueryLog());
    DB::disableQueryLog();

    // Add 10 more bookings with travelers
    for ($i = 0; $i < 10; $i++) {
        $b = Booking::factory()->create([
            'customer_id' => $customer->id,
            'tour_package_id' => $pkg->id,
            'booking_status' => BookingStatus::Confirmed,
            'number_of_travelers' => 2,
        ]);
        BookingTraveler::factory()->create(['booking_id' => $b->id, 'traveler_type' => TravelerType::Adult]);
    }

    DB::flushQueryLog();
    DB::enableQueryLog();
    $this->actingAs($user)->getJson('/reports/passenger-count/data');
    $queriesForMany = count(DB::getQueryLog());
    DB::disableQueryLog();

    // Query count must be identical (no N+1)
    expect($queriesForMany)->toBe($queriesForOne);
});

test('document status report executes a constant number of queries regardless of document count (No N+1)', function () {
    $user = User::factory()->staff()->create();
    $customer = Customer::factory()->create();
    $docType = DocumentType::factory()->create(['is_active' => true]);

    // Warm-up query to cache permissions and auth
    $this->actingAs($user)->getJson('/reports/document-status/data');

    // Baseline: 1 document
    $b1 = Booking::factory()->create([
        'customer_id' => $customer->id,
        'booking_status' => BookingStatus::Confirmed,
        'travel_date' => now()->addDays(30)->toDateString(),
    ]);
    CustomerDocument::factory()->create([
        'customer_id' => $customer->id,
        'booking_id' => $b1->id,
        'document_type_id' => $docType->id,
        'document_status' => 'active',
        'verification_status' => 'Verified',
        'expiry_date' => now()->addYears(1)->toDateString(),
    ]);

    DB::flushQueryLog();
    DB::enableQueryLog();
    $this->actingAs($user)->getJson('/reports/document-status/data');
    $queriesForOne = count(DB::getQueryLog());
    DB::disableQueryLog();

    // Add 10 more documents
    for ($i = 0; $i < 10; $i++) {
        $c = Customer::factory()->create();
        $b = Booking::factory()->create([
            'customer_id' => $c->id,
            'booking_status' => BookingStatus::Confirmed,
            'travel_date' => now()->addDays(30)->toDateString(),
        ]);
        CustomerDocument::factory()->create([
            'customer_id' => $c->id,
            'booking_id' => $b->id,
            'document_type_id' => $docType->id,
            'document_status' => 'active',
            'verification_status' => 'Verified',
            'expiry_date' => now()->addYears(1)->toDateString(),
        ]);
    }

    DB::flushQueryLog();
    DB::enableQueryLog();
    $this->actingAs($user)->getJson('/reports/document-status/data');
    $queriesForMany = count(DB::getQueryLog());
    DB::disableQueryLog();

    // Query count must be identical (no N+1)
    expect($queriesForMany)->toBe($queriesForOne);
});
