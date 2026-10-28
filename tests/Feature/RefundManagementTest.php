<?php

use App\Enums\Currency;
use App\Enums\PaymentMethod;
use App\Enums\RefundStatus;
use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\ExchangeRate;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\User;
use App\Notifications\RefundStatusNotification;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->superAdmin = User::factory()->superAdmin()->create();
    $this->manager = User::factory()->manager()->create();
    $this->finance = User::factory()->finance()->create();
    $this->staff = User::factory()->staff()->create();
    $this->customer = Customer::factory()->create();

    $this->booking = Booking::factory()->create([
        'customer_id' => $this->customer->id,
        'base_amount' => 10000.00,
        'final_amount' => 10000.00,
        'paid_amount' => 6000.00,
        'balance_amount' => 4000.00,
        'currency' => 'LKR',
    ]);
});

test('refund gets RFD-YYYY-NNNNN number generated', function () {
    $response = $this->actingAs($this->finance)
        ->post(route('refunds.store'), [
            'booking_id' => $this->booking->id,
            'amount' => '1500.00',
            'reason' => 'Guest cancelled optional excursion',
        ]);

    $response->assertSessionHasNoErrors();

    $refund = Refund::first();
    expect($refund)->not->toBeNull();
    expect($refund->refund_number)->toMatch('/^RFD-\d{4}-\d{5}$/');
    expect($refund->status)->toBe(RefundStatus::Requested);
});

test('staff and customer get 403 on refunds routes', function ($user) {
    $refund = Refund::factory()->create([
        'booking_id' => $this->booking->id,
        'customer_id' => $this->customer->id,
        'requested_by' => $this->finance->id,
    ]);

    // Index
    $this->actingAs($user)
        ->get(route('refunds.index'))
        ->assertStatus(403);

    // Create page
    $this->actingAs($user)
        ->get(route('refunds.create'))
        ->assertStatus(403);

    // Store request
    $this->actingAs($user)
        ->post(route('refunds.store'), [
            'booking_id' => $this->booking->id,
            'amount' => '500.00',
            'reason' => 'Unauthorized attempting refund',
        ])
        ->assertStatus(403);

    // Show
    $this->actingAs($user)
        ->get(route('refunds.show', $refund))
        ->assertStatus(403);

    // Approve
    $this->actingAs($user)
        ->patch(route('refunds.approve', $refund))
        ->assertStatus(403);
})->with([
    fn () => $this->staff,
    fn () => $this->customerUser ?? User::factory()->customer()->create(),
]);

test('allowed roles (super_admin, manager, finance) can access refund index, create, and show', function ($user) {
    $refund = Refund::factory()->create([
        'booking_id' => $this->booking->id,
        'customer_id' => $this->customer->id,
        'requested_by' => $this->superAdmin->id,
    ]);

    $this->actingAs($user)
        ->get(route('refunds.index'))
        ->assertStatus(200);

    $this->actingAs($user)
        ->get(route('refunds.create'))
        ->assertStatus(200);

    $this->actingAs($user)
        ->get(route('refunds.show', $refund))
        ->assertStatus(200);
})->with([
    fn () => $this->superAdmin,
    fn () => $this->manager,
    fn () => $this->finance,
]);

test('acceptance: a Manager can approve a Finance refund request and refund gets RFD-YYYY-NNNNN', function () {
    Notification::fake();

    // 1. Finance requests refund
    $response = $this->actingAs($this->finance)
        ->post(route('refunds.store'), [
            'booking_id' => $this->booking->id,
            'amount' => '2000.00',
            'cancellation_charge' => '200.00',
            'reason' => 'Customer requested date change with cancellation of day tour',
            'notes' => 'Approved by tour operator verbally',
        ]);

    $response->assertSessionHasNoErrors();

    $refund = Refund::first();
    expect($refund->refund_number)->toMatch('/^RFD-\d{4}-\d{5}$/');
    expect($refund->status)->toBe(RefundStatus::Requested);
    expect($refund->requested_by)->toBe($this->finance->id);

    // Notification sent to approvers
    Notification::assertSentTo([$this->manager, $this->superAdmin], RefundStatusNotification::class);

    // Activity log written for requested transition
    $log = ActivityLog::where('subject_type', Refund::class)
        ->where('subject_id', $refund->id)
        ->first();
    expect($log)->not->toBeNull();
    expect($log->description)->toContain($refund->refund_number);

    // 2. Manager approves the refund request
    $approveResponse = $this->actingAs($this->manager)
        ->patch(route('refunds.approve', $refund));

    $approveResponse->assertSessionHasNoErrors();

    $refund->refresh();
    expect($refund->status)->toBe(RefundStatus::Approved);
    expect($refund->approved_by)->toBe($this->manager->id);
    expect($refund->approved_at)->not->toBeNull();

    // Verify bookings.paid_amount and balance_amount are NOT altered!
    $this->booking->refresh();
    expect((string) $this->booking->paid_amount)->toBe('6000.00');
    expect((string) $this->booking->balance_amount)->toBe('4000.00');

    // 3. Finance marks approved refund as paid
    $payResponse = $this->actingAs($this->finance)
        ->patch(route('refunds.mark-paid', $refund), [
            'paid_on' => now()->toDateString(),
            'payment_method' => PaymentMethod::BankTransfer->value,
            'notes' => 'Disbursed via Commercial Bank transfer #TRF998877',
        ]);

    $payResponse->assertSessionHasNoErrors();

    $refund->refresh();
    expect($refund->status)->toBe(RefundStatus::Paid);
    expect($refund->payment_method)->toBe(PaymentMethod::BankTransfer->value);
    expect($refund->paid_on)->not->toBeNull();

    // Verify bookings.paid_amount and balance_amount still NOT altered!
    $this->booking->refresh();
    expect((string) $this->booking->paid_amount)->toBe('6000.00');
    expect((string) $this->booking->balance_amount)->toBe('4000.00');
});

test('self-approval blocked: manager or super admin cannot approve their own refund request', function () {
    // 1. Manager requests a refund
    $this->actingAs($this->manager)
        ->post(route('refunds.store'), [
            'booking_id' => $this->booking->id,
            'amount' => '1000.00',
            'reason' => 'Emergency cancellation',
        ]);

    $refund = Refund::first();
    expect($refund->requested_by)->toBe($this->manager->id);

    // Attempt to self-approve as manager -> 403 Forbidden!
    $this->actingAs($this->manager)
        ->patch(route('refunds.approve', $refund))
        ->assertStatus(403);

    // Attempt to self-reject as manager -> 403 Forbidden!
    $this->actingAs($this->manager)
        ->patch(route('refunds.reject', $refund))
        ->assertStatus(403);

    // Another manager or super admin CAN approve it
    $otherManager = User::factory()->manager()->create();
    $this->actingAs($otherManager)
        ->patch(route('refunds.approve', $refund))
        ->assertSessionHasNoErrors();

    expect($refund->fresh()->status)->toBe(RefundStatus::Approved);
});

test('self-approval blocked: super admin cannot approve their own refund request', function () {
    $this->actingAs($this->superAdmin)
        ->post(route('refunds.store'), [
            'booking_id' => $this->booking->id,
            'amount' => '500.00',
            'reason' => 'Owner concession',
        ]);

    $refund = Refund::first();

    // Super admin self-approve -> 403 Forbidden!
    $this->actingAs($this->superAdmin)
        ->patch(route('refunds.approve', $refund))
        ->assertStatus(403);
});

test('finance cannot approve or reject refunds', function () {
    $refund = Refund::factory()->create([
        'booking_id' => $this->booking->id,
        'customer_id' => $this->customer->id,
        'requested_by' => $this->superAdmin->id,
        'status' => RefundStatus::Requested,
    ]);

    // Finance tries to approve -> 403
    $this->actingAs($this->finance)
        ->patch(route('refunds.approve', $refund))
        ->assertStatus(403);

    // Finance tries to reject -> 403
    $this->actingAs($this->finance)
        ->patch(route('refunds.reject', $refund))
        ->assertStatus(403);

    expect($refund->fresh()->status)->toBe(RefundStatus::Requested);
});

test('over-refund blocked: cannot refund more than paid amount minus approved or paid refunds', function () {
    // Booking has paid_amount = 6000.00
    // 1. Requesting 6000.01 is blocked
    $this->actingAs($this->finance)
        ->post(route('refunds.store'), [
            'booking_id' => $this->booking->id,
            'amount' => '6000.01',
            'reason' => 'Exceeding total paid',
        ])
        ->assertSessionHasErrors('amount');

    // 2. Request 4000.00 -> valid
    $this->actingAs($this->finance)
        ->post(route('refunds.store'), [
            'booking_id' => $this->booking->id,
            'amount' => '4000.00',
            'reason' => 'Partial refund 1',
        ])
        ->assertSessionHasNoErrors();

    $firstRefund = Refund::latest('id')->first();
    // Approve it
    $this->actingAs($this->manager)
        ->patch(route('refunds.approve', $firstRefund))
        ->assertSessionHasNoErrors();

    // Now remaining refundable paid amount is 6000 - 4000 = 2000.
    // 3. Attempting to request 2500 is blocked!
    $this->actingAs($this->finance)
        ->post(route('refunds.store'), [
            'booking_id' => $this->booking->id,
            'amount' => '2500.00',
            'reason' => 'Attempting over-refund',
        ])
        ->assertSessionHasErrors('amount');

    // 4. Requesting exactly 2000.00 is allowed
    $this->actingAs($this->finance)
        ->post(route('refunds.store'), [
            'booking_id' => $this->booking->id,
            'amount' => '2000.00',
            'reason' => 'Remaining refundable balance',
        ])
        ->assertSessionHasNoErrors();
});

test('snapshot rates stored for foreign currency refunds and freeze against future rate changes', function () {
    ExchangeRate::create([
        'currency' => Currency::USD,
        'rate_to_lkr' => '300.000000',
        'source' => 'manual',
        'fetched_at' => now()->subDay(),
    ]);

    $usdBooking = Booking::factory()->create([
        'customer_id' => $this->customer->id,
        'currency' => 'USD',
        'paid_amount' => '1000.00',
        'final_amount' => '1000.00',
        'balance_amount' => '0.00',
    ]);

    $this->actingAs($this->finance)
        ->post(route('refunds.store'), [
            'booking_id' => $usdBooking->id,
            'amount' => '100.00',
            'reason' => 'USD partial refund',
        ])
        ->assertSessionHasNoErrors();

    $refund = Refund::where('booking_id', $usdBooking->id)->first();
    expect((string) $refund->exchange_rate_to_lkr)->toBe('300.000000');
    // 100.00 * 300 = 30000.00 LKR
    expect((string) $refund->amount_lkr)->toBe('30000.00');

    // Rate changes to 360
    ExchangeRate::create([
        'currency' => Currency::USD,
        'rate_to_lkr' => '360.000000',
        'source' => 'manual',
        'fetched_at' => now(),
    ]);

    // Frozen snapshot
    $freshRefund = $refund->fresh();
    expect((string) $freshRefund->exchange_rate_to_lkr)->toBe('300.000000');
    expect((string) $freshRefund->amount_lkr)->toBe('30000.00');
});

test('manager can reject a refund request with reason', function () {
    $refund = Refund::factory()->create([
        'booking_id' => $this->booking->id,
        'customer_id' => $this->customer->id,
        'requested_by' => $this->finance->id,
        'status' => RefundStatus::Requested,
    ]);

    $this->actingAs($this->manager)
        ->patch(route('refunds.reject', $refund), [
            'rejection_reason' => 'Non-refundable booking tier under terms clause 4.2',
        ])
        ->assertSessionHasNoErrors();

    $refund->refresh();
    expect($refund->status)->toBe(RefundStatus::Rejected);
    expect($refund->approved_by)->toBe($this->manager->id);
    expect($refund->notes)->toContain('Non-refundable booking tier');
});
