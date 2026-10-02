<?php

use App\Enums\BookingStatus;
use App\Enums\TravelerType;
use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\BookingDraft;
use App\Models\BookingNote;
use App\Models\BookingTraveler;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\PaymentSchedule;
use App\Models\TourPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(\Database\Seeders\RoleSeeder::class);

    $this->superAdmin = User::factory()->superAdmin()->create();
    $this->manager = User::factory()->manager()->create();
    $this->staff = User::factory()->staff()->create();
    $this->customerUser = User::factory()->customer()->create();

    $this->customer = Customer::factory()->create(['user_id' => $this->customerUser->id]);
    $this->package = TourPackage::factory()->create(['price' => 1500, 'currency' => 'LKR', 'capacity' => 20]);
});

test('server recalculates pricing correctly and ignores client totals', function () {
    $payload = [
        'customer_id' => $this->customer->id,
        'tour_package_id' => $this->package->id,
        'booking_date' => now()->format('Y-m-d'),
        'travel_date' => now()->addDays(15)->format('Y-m-d'),
        'return_date' => now()->addDays(20)->format('Y-m-d'),
        'discount_amount' => 500, // Manager can apply discount
        'tax_amount' => 200,
        'extras' => [
            ['name' => 'Travel Insurance', 'price' => 300],
            ['name' => 'Airport Transfer', 'price' => 100],
        ],
        // Client attempts to send forged or wrong totals
        'base_amount' => 999999,
        'final_amount' => 1,
        'travelers' => [
            ['full_name' => 'Passenger One', 'traveler_type' => 'adult'],
            ['full_name' => 'Passenger Two', 'traveler_type' => 'adult'],
        ],
        'record_payment' => true,
        'payment_amount' => 1000,
        'payment_method' => 'cash',
        'payment_reference' => 'RCP-TEST-001',
    ];

    $response = $this->actingAs($this->manager)
        ->post(route('bookings.store'), $payload);

    $response->assertRedirect();

    $booking = Booking::first();
    expect($booking)->not->toBeNull();

    // 2 travelers * 1500 package price = 3000 base
    expect((float)$booking->base_amount)->toBe(3000.0);
    // Extras: 300 + 100 = 400
    expect((float)$booking->extras_amount)->toBe(400.0);
    // Tax: 200
    expect((float)$booking->tax_amount)->toBe(200.0);
    // Discount: 500
    expect((float)$booking->discount_amount)->toBe(500.0);
    // Final Amount = (3000 + 400 + 200) - 500 = 3100
    expect((float)$booking->final_amount)->toBe(3100.0);

    // Initial Payment = 1000
    expect((float)$booking->paid_amount)->toBe(1000.0);
    // Balance = 3100 - 1000 = 2100
    expect((float)$booking->balance_amount)->toBe(2100.0);
    expect($booking->payment_status)->toBe('Partial');

    // Check Travelers created
    expect(BookingTraveler::where('booking_id', $booking->id)->count())->toBe(2);

    // Check Payment created
    expect(Payment::where('booking_id', $booking->id)->count())->toBe(1);
    $payment = Payment::where('booking_id', $booking->id)->first();
    expect((float)$payment->amount)->toBe(1000.0);

    // Check Payment Schedule created
    expect(PaymentSchedule::where('booking_id', $booking->id)->count())->toBeGreaterThanOrEqual(1);
});

test('draft save, retrieval, discard, and deletion on booking creation', function () {
    $draftPayload = [
        'customer_id' => (string)$this->customer->id,
        'tour_package_id' => (string)$this->package->id,
        'travel_date' => now()->addDays(20)->format('Y-m-d'),
        'travelers' => [
            ['full_name' => 'Draft Traveler', 'traveler_type' => 'adult']
        ]
    ];

    // 1. Save draft
    $response = $this->actingAs($this->staff)
        ->postJson(route('bookings.draft.save'), [
            'payload' => $draftPayload,
            'step' => 3,
        ]);

    $response->assertOk()
        ->assertJson(['success' => true]);

    $this->assertDatabaseHas('booking_drafts', [
        'user_id' => $this->staff->id,
        'step' => 3,
    ]);

    // 2. Retrieve draft
    $getResponse = $this->actingAs($this->staff)
        ->getJson(route('bookings.draft.get'));

    $getResponse->assertOk()
        ->assertJsonPath('draft.step', 3)
        ->assertJsonPath('draft.payload.travelers.0.full_name', 'Draft Traveler');

    // 3. Completing the booking deletes the draft
    $createPayload = [
        'customer_id' => $this->customer->id,
        'tour_package_id' => $this->package->id,
        'booking_date' => now()->format('Y-m-d'),
        'travel_date' => now()->addDays(20)->format('Y-m-d'),
        'travelers' => [
            ['full_name' => 'Draft Traveler', 'traveler_type' => 'adult']
        ]
    ];

    $this->actingAs($this->staff)
        ->post(route('bookings.store'), $createPayload)
        ->assertRedirect();

    $this->assertDatabaseMissing('booking_drafts', [
        'user_id' => $this->staff->id,
    ]);

    // 4. Test explicit delete draft endpoint
    BookingDraft::create([
        'user_id' => $this->staff->id,
        'step' => 2,
        'payload' => ['some' => 'data'],
    ]);

    $this->actingAs($this->staff)
        ->deleteJson(route('bookings.draft.delete'))
        ->assertOk();

    $this->assertDatabaseMissing('booking_drafts', [
        'user_id' => $this->staff->id,
    ]);
});

test('discounts require permission: staff without permission is rejected', function () {
    $payload = [
        'customer_id' => $this->customer->id,
        'tour_package_id' => $this->package->id,
        'booking_date' => now()->format('Y-m-d'),
        'travel_date' => now()->addDays(10)->format('Y-m-d'),
        'discount_amount' => 250, // Discount requested by staff
        'travelers' => [
            ['full_name' => 'Alice Traveler', 'traveler_type' => 'adult']
        ]
    ];

    // Staff cannot authorize discount
    $response = $this->actingAs($this->staff)
        ->post(route('bookings.store'), $payload);

    $response->assertSessionHasErrors('discount_amount');
    $this->assertDatabaseCount('bookings', 0);

    // Manager CAN authorize discount
    $managerResponse = $this->actingAs($this->manager)
        ->post(route('bookings.store'), $payload);

    $managerResponse->assertRedirect();
    $this->assertDatabaseHas('bookings', [
        'discount_amount' => 250,
    ]);
});

test('permission checks for status transitions and writes to notes timeline', function () {
    $booking = Booking::factory()->create([
        'customer_id' => $this->customer->id,
        'tour_package_id' => $this->package->id,
        'booking_status' => BookingStatus::Pending,
    ]);

    // 1. Staff can advance status from pending to confirmed
    $this->actingAs($this->staff)
        ->patch(route('bookings.status', $booking), [
            'booking_status' => BookingStatus::Confirmed->value,
            'note' => 'Deposit verified by bank statement',
        ])
        ->assertRedirect();

    $booking->refresh();
    expect($booking->booking_status)->toBe(BookingStatus::Confirmed);

    // Notes timeline entry must be recorded
    $this->assertDatabaseHas('booking_notes', [
        'booking_id' => $booking->id,
        'type' => 'status_change',
    ]);
    $note = BookingNote::where('booking_id', $booking->id)->latest()->first();
    expect($note->content)->toContain('Deposit verified by bank statement');

    // 2. Customer cannot change status
    $this->actingAs($this->customerUser)
        ->patch(route('bookings.status', $booking), [
            'booking_status' => BookingStatus::Completed->value,
        ])
        ->assertForbidden();

    // 3. Staff cannot cancel booking (only manager/super_admin)
    $this->actingAs($this->staff)
        ->patch(route('bookings.status', $booking), [
            'booking_status' => BookingStatus::Cancelled->value,
        ])
        ->assertForbidden();

    // 4. Manager can cancel booking
    $this->actingAs($this->manager)
        ->patch(route('bookings.status', $booking), [
            'booking_status' => BookingStatus::Cancelled->value,
            'note' => 'Customer requested cancellation',
        ])
        ->assertRedirect();

    $booking->refresh();
    expect($booking->booking_status)->toBe(BookingStatus::Cancelled);

    $cancelNote = BookingNote::where('booking_id', $booking->id)->latest()->first();
    expect($cancelNote->content)->toContain('Customer requested cancellation');
});

test('transaction rolls back cleanly on failure during booking creation', function () {
    // We send payload with an invalid traveler type or capacity failure to force rollback
    $this->package->update(['capacity' => 1]);

    $payload = [
        'customer_id' => $this->customer->id,
        'tour_package_id' => $this->package->id,
        'booking_date' => now()->format('Y-m-d'),
        'travel_date' => now()->addDays(10)->format('Y-m-d'),
        'travelers' => [
            ['full_name' => 'Traveler 1', 'traveler_type' => 'adult'],
            ['full_name' => 'Traveler 2', 'traveler_type' => 'adult'], // Exceeds capacity 1
        ],
        'record_payment' => true,
        'payment_amount' => 500,
    ];

    $response = $this->actingAs($this->manager)
        ->post(route('bookings.store'), $payload);

    $response->assertSessionHasErrors('travelers');

    // Verify complete rollback: zero bookings, zero travelers, zero payments
    $this->assertDatabaseCount('bookings', 0);
    $this->assertDatabaseCount('booking_travelers', 0);
    $this->assertDatabaseCount('payments', 0);
    $this->assertDatabaseCount('payment_schedules', 0);
});
