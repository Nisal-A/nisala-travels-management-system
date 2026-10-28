<?php

use App\Enums\BookingStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Inquiry;
use App\Models\Payment;
use App\Models\PaymentReceipt;
use App\Models\TourPackage;
use App\Models\User;
use App\Services\NumberGenerator;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Artisan;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->financeUser = User::factory()->finance()->create();
    $this->managerUser = User::factory()->manager()->create();
    $this->customerUser = User::factory()->customer()->create();

    $this->customer = Customer::factory()->create([
        'user_id' => $this->customerUser->id,
        'full_name' => 'Alice Bobman',
        'email' => 'alice@example.com',
    ]);

    $this->tourPackage = TourPackage::factory()->create([
        'package_name' => 'Splendors of Ella',
    ]);

    $this->booking = Booking::factory()->create([
        'customer_id' => $this->customer->id,
        'tour_package_id' => $this->tourPackage->id,
        'booking_reference' => 'BKG-2026-0001',
        'booking_status' => BookingStatus::Confirmed,
        'base_amount' => 5000,
        'discount_amount' => 0,
        'final_amount' => 5000,
        'paid_amount' => 0,
        'balance_amount' => 5000,
        'currency' => 'LKR',
    ]);
});

test('sequential numbers have no duplicates across 50 sequential calls', function () {
    $generator = app(NumberGenerator::class);
    $year = 2026;

    $numbers = [];
    for ($i = 0; $i < 50; $i++) {
        $numbers[] = $generator->next('receipt', $year);
    }

    expect(count($numbers))->toBe(50)
        ->and(count(array_unique($numbers)))->toBe(50)
        ->and($numbers[0])->toBe(1)
        ->and($numbers[49])->toBe(50);
});

test('receipt number format matches RCP-YYYY-NNNNNN, refund matches RFD-YYYY-NNNNN, supplier matches SUP-NNNN', function () {
    $generator = app(NumberGenerator::class);

    $receipt = $generator->receipt(2026);
    expect($receipt)->toMatch('/^RCP-2026-\d{6}$/');

    $refund = $generator->refund(2026);
    expect($refund)->toMatch('/^RFD-2026-\d{5}$/');

    $supplier = $generator->supplier();
    expect($supplier)->toMatch('/^SUP-\d{4}$/');
});

test('recording a payment creates a PaymentReceipt row with RCP-YYYY-NNNNNN inside transaction', function () {
    $year = now()->format('Y');

    $response = $this->actingAs($this->financeUser)
        ->post(route('payments.store'), [
            'booking_id' => $this->booking->id,
            'amount' => 2000,
            'payment_method' => PaymentMethod::BankTransfer->value,
            'payment_date' => now()->format('Y-m-d'),
            'reference_number' => 'BANK-REF-999',
            'notes' => 'Advance payment',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $payment = Payment::first();
    expect($payment)->not->toBeNull();

    $receipt = $payment->receipt;
    expect($receipt)->not->toBeNull()
        ->and($receipt->receipt_number)->toMatch('/^RCP-'.$year.'-\d{6}$/')
        ->and($receipt->generated_by)->toBe($this->financeUser->id)
        ->and($payment->booking_id)->toBe($this->booking->id);

    $this->booking->refresh();
    expect((float) $this->booking->paid_amount)->toBe(2000.0)
        ->and((float) $this->booking->balance_amount)->toBe(3000.0);
});

test('portal payment receipt and payment resource use receipt number falling back to RCP-id and never reference_number', function () {
    // Payment WITH a receipt row and a reference_number
    $paymentWithReceipt = Payment::factory()->create([
        'customer_id' => $this->customer->id,
        'booking_id' => $this->booking->id,
        'reference_number' => 'REF-IGNORE-ME',
        'status' => PaymentStatus::Completed,
    ]);

    PaymentReceipt::create([
        'payment_id' => $paymentWithReceipt->id,
        'receipt_number' => 'RCP-2026-000042',
        'generated_by' => $this->financeUser->id,
    ]);

    // Payment WITHOUT a receipt row and with a reference_number
    $paymentWithoutReceipt = Payment::factory()->create([
        'customer_id' => $this->customer->id,
        'booking_id' => $this->booking->id,
        'reference_number' => 'REF-DO-NOT-USE',
        'status' => PaymentStatus::Completed,
    ]);

    // Check portal index resource
    $indexResponse = $this->actingAs($this->customerUser)->get(route('portal.payments.index'));
    $indexResponse->assertStatus(200);

    $indexResponse->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Portal/Payments')
        ->has('payments.data', 2)
        ->where('payments.data.0.receipt_number', function ($val) use ($paymentWithReceipt, $paymentWithoutReceipt) {
            return $val === 'RCP-2026-000042' || $val === 'RCP-'.$paymentWithoutReceipt->id;
        })
    );

    // Check portal receipt download for payment WITH receipt
    $downloadWithReceipt = $this->actingAs($this->customerUser)->get(route('portal.payments.receipt', $paymentWithReceipt));
    $downloadWithReceipt->assertStatus(200);
    $disposition = $downloadWithReceipt->headers->get('content-disposition');
    expect($disposition)->toContain('Receipt_RCP-2026-000042.pdf')
        ->and($disposition)->not->toContain('REF-IGNORE-ME');

    // Check portal receipt download for payment WITHOUT receipt (fallback)
    $downloadWithoutReceipt = $this->actingAs($this->customerUser)->get(route('portal.payments.receipt', $paymentWithoutReceipt));
    $downloadWithoutReceipt->assertStatus(200);
    $dispositionFallback = $downloadWithoutReceipt->headers->get('content-disposition');
    expect($dispositionFallback)->toContain('Receipt_RCP-'.$paymentWithoutReceipt->id.'.pdf')
        ->and($dispositionFallback)->not->toContain('REF-DO-NOT-USE');
});

test('receipts:backfill command generates receipt rows for completed payments ordered by payment_date then id', function () {
    $p1 = Payment::factory()->create([
        'customer_id' => $this->customer->id,
        'booking_id' => $this->booking->id,
        'payment_date' => '2026-01-15',
        'status' => PaymentStatus::Completed,
    ]);

    $p2 = Payment::factory()->create([
        'customer_id' => $this->customer->id,
        'booking_id' => $this->booking->id,
        'payment_date' => '2026-02-20',
        'status' => PaymentStatus::Completed,
    ]);

    $p3 = Payment::factory()->create([
        'customer_id' => $this->customer->id,
        'booking_id' => $this->booking->id,
        'payment_date' => '2026-01-15', // Same date as p1, higher id
        'status' => PaymentStatus::Completed,
    ]);

    // Pending payment should be skipped
    $pPending = Payment::factory()->create([
        'customer_id' => $this->customer->id,
        'booking_id' => $this->booking->id,
        'payment_date' => '2026-01-10',
        'status' => PaymentStatus::Pending,
    ]);

    Artisan::call('receipts:backfill');

    expect($p1->fresh()->receipt)->not->toBeNull()
        ->and($p2->fresh()->receipt)->not->toBeNull()
        ->and($p3->fresh()->receipt)->not->toBeNull()
        ->and($pPending->fresh()->receipt)->toBeNull();

    // Order was: p1, p3, p2
    $r1 = $p1->fresh()->receipt->receipt_number;
    $r3 = $p3->fresh()->receipt->receipt_number;
    $r2 = $p2->fresh()->receipt->receipt_number;

    // p1 should have sequence < p3 < p2
    expect(strcmp($r1, $r3))->toBeLessThan(0)
        ->and(strcmp($r3, $r2))->toBeLessThan(0);
});

test('Inquiry::generateReference() uses INQ- prefix', function () {
    $ref = Inquiry::generateReference();
    expect($ref)->toMatch('/^INQ-[A-Z0-9]{8}$/');
});

test('Payment and Booking search do not error and find records properly', function () {
    $payment = Payment::factory()->create([
        'customer_id' => $this->customer->id,
        'booking_id' => $this->booking->id,
        'status' => PaymentStatus::Completed,
    ]);

    PaymentReceipt::create([
        'payment_id' => $payment->id,
        'receipt_number' => 'RCP-2026-777888',
        'generated_by' => $this->financeUser->id,
    ]);

    // Test Payment::filterAndSort searching receipt relation
    $searchReceipt = Payment::filterAndSort(['search' => '777888'])->get();
    expect($searchReceipt)->toHaveCount(1)
        ->and($searchReceipt->first()->id)->toBe($payment->id);

    // Test Payment::filterAndSort searching customer full_name
    $searchCust = Payment::filterAndSort(['search' => 'Alice Bobman'])->get();
    expect($searchCust)->toHaveCount(1);

    // Test Booking::filterAndSort searching tour package package_name
    $searchTour = Booking::filterAndSort(['search' => 'Splendors of Ella'])->get();
    expect($searchTour)->toHaveCount(1)
        ->and($searchTour->first()->id)->toBe($this->booking->id);

    // Test GlobalSearchController does not error and searches through receipt relation
    $globalSearchResponse = $this->actingAs($this->managerUser)
        ->get(route('admin.search', ['q' => '777888']));

    $globalSearchResponse->assertStatus(200);
    $data = $globalSearchResponse->json('data');
    expect(collect($data)->pluck('title'))->toContain('RCP-2026-777888');

    // Test GlobalSearch with general text
    $globalSearchGeneral = $this->actingAs($this->managerUser)
        ->get(route('admin.search', ['q' => 'Ella']));

    $globalSearchGeneral->assertStatus(200);
});
