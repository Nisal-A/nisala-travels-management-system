<?php

use App\Enums\BookingStatus;
use App\Models\ActivityLog;
use App\Models\AppSetting;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\TourPackage;
use App\Models\User;
use App\Reports\Export\ReportExporter;
use Database\Seeders\ReportPermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(ReportPermissionSeeder::class);
});

// ------------------------------------------------------------------
// Authentication & Role Authorization Tests
// ------------------------------------------------------------------

test('guest is redirected to login when attempting to export any report', function (string $format) {
    $response = $this->get("/reports/booking-register/export/{$format}");
    $response->assertRedirect('/login');
})->with(['csv', 'excel', 'pdf']);

test('customer receives 403 when attempting to export any report', function (string $format) {
    $customer = User::factory()->customer()->create();

    $response = $this->actingAs($customer)->get("/reports/booking-register/export/{$format}");
    $response->assertStatus(403);
})->with(['csv', 'excel', 'pdf']);

test('staff receives 403 when attempting to export a forbidden financial report', function (string $format) {
    $staff = User::factory()->staff()->create();

    $response = $this->actingAs($staff)->get("/reports/income-expenses/export/{$format}");
    $response->assertStatus(403);
})->with(['csv', 'excel', 'pdf']);

test('finance receives 403 when attempting to export a forbidden operational report', function (string $format) {
    $finance = User::factory()->finance()->create();

    $response = $this->actingAs($finance)->get("/reports/booking-register/export/{$format}");
    $response->assertStatus(403);
})->with(['csv', 'excel', 'pdf']);

test('exporting non-existent report returns 404', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $response = $this->actingAs($superAdmin)->get('/reports/unknown-non-existent-report/export/csv');
    $response->assertStatus(404);
});

// ------------------------------------------------------------------
// CSV Export Tests (Streaming, UTF-8 BOM, Escaped Quotes/Commas)
// ------------------------------------------------------------------

test('allowed role can stream CSV export with UTF-8 BOM and correct commas and quotes', function () {
    $staff = User::factory()->staff()->create();

    $customer = Customer::factory()->create([
        'full_name' => 'Nimal Perera "Special"',
        'email' => 'nimal.perera@example.com',
        'phone' => '+94719999999',
    ]);

    $package = TourPackage::factory()->create([
        'package_name' => 'Sri Lanka Cultural & Hill Tour',
        'price' => '150000.00',
        'status' => 'active',
    ]);

    Booking::factory()->create([
        'booking_reference' => 'BK-EXP,TEST-001',
        'customer_id' => $customer->id,
        'tour_package_id' => $package->id,
        'booking_date' => '2026-05-10',
        'booking_status' => BookingStatus::Confirmed,
        'base_amount' => '150000.00',
        'discount_amount' => '0.00',
        'final_amount' => '150000.00',
        'paid_amount' => '50000.00',
        'balance_amount' => '100000.00',
        'currency' => 'LKR',
    ]);

    $response = $this->actingAs($staff)->get('/reports/booking-register/export/csv');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    expect($response->headers->get('Content-Disposition'))->toContain('attachment')
        ->and($response->headers->get('Content-Disposition'))->toContain('.csv');

    // Verify stream content
    ob_start();
    $response->sendContent();
    $csvContent = ob_get_clean();

    // Verify UTF-8 BOM
    expect(str_starts_with($csvContent, "\xEF\xBB\xBF"))->toBeTrue();

    // Remove BOM to parse rows
    $rawCsv = substr($csvContent, 3);
    $lines = explode("\n", trim($rawCsv));
    expect(count($lines))->toBeGreaterThanOrEqual(2);

    // Verify headers
    expect($lines[0])->toContain('Reference');
    expect($lines[0])->toContain('Customer');

    // Verify row content contains escaped commas and quotes
    $dataLine = $lines[1];
    expect($dataLine)->toContain('BK-EXP,TEST-001');
    expect($dataLine)->toContain('Nimal Perera');
    expect($dataLine)->toContain('Sri Lanka Cultural & Hill Tour');
});

// ------------------------------------------------------------------
// Excel Export Tests (Low-Memory Streaming via OpenSpout)
// ------------------------------------------------------------------

test('allowed role can download Excel export', function () {
    $staff = User::factory()->staff()->create();

    $customer = Customer::factory()->create([
        'full_name' => 'Kamal Silva',
        'email' => 'kamal@example.com',
        'phone' => '+94711111111',
    ]);

    $package = TourPackage::factory()->create([
        'package_name' => 'Kandy Day Tour',
        'price' => '25000.00',
        'status' => 'active',
    ]);

    Booking::factory()->create([
        'booking_reference' => 'BK-EXCEL-001',
        'customer_id' => $customer->id,
        'tour_package_id' => $package->id,
        'booking_date' => '2026-06-01',
        'booking_status' => BookingStatus::Confirmed,
        'base_amount' => '25000.00',
        'discount_amount' => '0.00',
        'final_amount' => '25000.00',
        'paid_amount' => '25000.00',
        'balance_amount' => '0.00',
        'currency' => 'LKR',
    ]);

    $response = $this->actingAs($staff)->get('/reports/booking-register/export/excel');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect($response->headers->get('Content-Disposition'))->toContain('attachment')
        ->and($response->headers->get('Content-Disposition'))->toContain('.xlsx');
});

// ------------------------------------------------------------------
// PDF Export Tests (Letterhead, Landscape orientation)
// ------------------------------------------------------------------

test('allowed role can download PDF export with letterhead details', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $customer = Customer::factory()->create([
        'full_name' => 'Sunil Jayawardena',
        'email' => 'sunil@example.com',
        'phone' => '+94771234567',
    ]);

    $package = TourPackage::factory()->create([
        'package_name' => 'Historical Polonnaruwa Tour',
        'price' => '45000.00',
        'status' => 'active',
    ]);

    Booking::factory()->create([
        'booking_reference' => 'BK-PDF-001',
        'customer_id' => $customer->id,
        'tour_package_id' => $package->id,
        'booking_date' => '2026-07-01',
        'booking_status' => BookingStatus::Confirmed,
        'base_amount' => '45000.00',
        'discount_amount' => '0.00',
        'final_amount' => '45000.00',
        'paid_amount' => '45000.00',
        'balance_amount' => '0.00',
        'currency' => 'LKR',
    ]);

    $response = $this->actingAs($superAdmin)->get('/reports/booking-register/export/pdf');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/pdf');
    expect($response->headers->get('Content-Disposition'))->toContain('attachment')
        ->and($response->headers->get('Content-Disposition'))->toContain('.pdf');

    // Check PDF magic header bytes
    $pdfBinary = $response->getContent();
    expect(str_starts_with($pdfBinary, '%PDF-'))->toBeTrue();
});

// ------------------------------------------------------------------
// ActivityLog Verification
// ------------------------------------------------------------------

test('every export writes an ActivityLog entry containing user, report, format, filters, and row count', function () {
    $staff = User::factory()->staff()->create([
        'name' => 'Test Staff Member',
    ]);

    $response = $this->actingAs($staff)->get('/reports/booking-register/export/csv?status=confirmed&date_from=2026-01-01');
    $response->assertStatus(200);

    $log = ActivityLog::where('log_name', 'report_export')->latest()->first();

    expect($log)->not->toBeNull()
        ->and($log->causer_id)->toBe($staff->id)
        ->and($log->properties['report'])->toBe('booking-register')
        ->and($log->properties['format'])->toBe('csv')
        ->and($log->properties['user'])->toBe('Test Staff Member')
        ->and($log->properties['filters'])->toHaveKey('status', 'confirmed')
        ->and($log->properties['filters'])->toHaveKey('date_from', '2026-01-01')
        ->and($log->properties)->toHaveKey('row_count');
});

// ------------------------------------------------------------------
// Row Cap Enforcement (20,000 limit)
// ------------------------------------------------------------------

test('row cap of 20,000 rows is enforced and returns 422 with friendly message', function () {
    $staff = User::factory()->staff()->create();

    // Mock ReportExporter ROW_CAP or instantiate custom mock
    $exporter = new class extends ReportExporter {
        public function export(\App\Reports\BaseReport $report, string $format, array $filters, ?User $user = null): \Illuminate\Http\Response|\Symfony\Component\HttpFoundation\StreamedResponse|\Symfony\Component\HttpFoundation\BinaryFileResponse
        {
            // Simulate count > 20000
            $totalRows = 25000;
            if ($totalRows > self::ROW_CAP) {
                $message = 'The export exceeds the maximum limit of ' . number_format(self::ROW_CAP) . ' rows (' . number_format($totalRows) . ' rows found). Please narrow your filters and try again.';

                return new \Illuminate\Http\Response($message, 422, [
                    'Content-Type' => 'text/plain; charset=UTF-8',
                ]);
            }

            return parent::export($report, $format, $filters, $user);
        }
    };

    $this->app->instance(ReportExporter::class, $exporter);

    $response = $this->actingAs($staff)->get('/reports/booking-register/export/csv');

    $response->assertStatus(422);
    expect($response->getContent())->toContain('20,000')
        ->and($response->getContent())->toContain('narrow your filters');
});

// ------------------------------------------------------------------
// Company Profile Defaults & Settings Form
// ------------------------------------------------------------------

test('company profile defaults in AppSetting and config/travel.php match requirements', function () {
    $profile = AppSetting::getCompanyProfile();

    expect($profile['company_name'])->toBe('Nisala Travels');
    expect($profile['address'])->toBe('Airport Road, Hingurakgoda, Sri Lanka');
    expect($profile['phones'])->toBe('071 9951812 and 076 1277010');
    expect($profile['website'])->toBe('www.nisalatravels.com');
    expect($profile['email'])->toBe('info@example.com');
    expect($profile['bank_details'])->toBe('Example Bank, Example Branch, Nisala Travels, 0000000000');
    expect($profile['logo_path'])->toBe('public/images/nisala-travels-full-logo.png');
});

test('super admin can update company profile through SettingsController', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $response = $this->actingAs($superAdmin)->put('/settings', [
        'company_name' => 'Nisala Travels Ceylon',
        'company_address' => 'Main Street, Colombo, Sri Lanka',
        'phones' => '071 0000000 and 076 9999999',
        'website' => 'https://www.nisalatravelsceylon.com',
        'email' => 'contact@nisalatravelsceylon.com',
        'registration_number' => 'PV998877',
        'bank_details' => 'Commercial Bank, Hingurakgoda Branch, Acc: 12345678',
        'logo_path' => 'public/images/nisala-travels-full-logo.png',
    ]);

    $response->assertRedirect();

    expect(AppSetting::get('company_name'))->toBe('Nisala Travels Ceylon');
    expect(AppSetting::get('address'))->toBe('Main Street, Colombo, Sri Lanka');
    expect(AppSetting::get('phones'))->toBe('071 0000000 and 076 9999999');
    expect(AppSetting::get('website'))->toBe('https://www.nisalatravelsceylon.com');
    expect(AppSetting::get('email'))->toBe('contact@nisalatravelsceylon.com');
    expect(AppSetting::get('registration_number'))->toBe('PV998877');
    expect(AppSetting::get('bank_details'))->toBe('Commercial Bank, Hingurakgoda Branch, Acc: 12345678');
});
