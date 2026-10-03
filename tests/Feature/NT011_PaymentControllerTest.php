<?php

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\User;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->manager = User::factory()->manager()->create();
    $this->finance = User::factory()->finance()->create();
    $this->staff = User::factory()->staff()->create();
    $this->customer = Customer::factory()->create();

    $this->booking = Booking::factory()->create([
        'customer_id' => $this->customer->id,
        'base_amount' => 5000,
        'discount_amount' => 0,
        'final_amount' => 5000,
        'paid_amount' => 0,
        'balance_amount' => 5000,
        'currency' => 'LKR',
    ]);
});

test('finance can view payments list', function () {
    Payment::factory()->count(3)->create();

    $this->actingAs($this->finance)
        ->get(route('payments.index'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page->component('Payments/Index'));
});

test('finance can record a payment and booking amounts are updated transactionally', function () {
    $this->actingAs($this->finance)
        ->post(route('payments.store'), [
            'booking_id' => $this->booking->id,
            'amount' => 2000,
            'payment_method' => PaymentMethod::BankTransfer->value,
            'payment_date' => now()->format('Y-m-d'),
            'reference_number' => 'REF123',
            'notes' => 'First installment',
        ])
        ->assertSessionHasNoErrors();

    $payment = Payment::first();
    expect($payment->amount)->toEqual(2000)
        ->and($payment->booking_id)->toEqual($this->booking->id)
        ->and($payment->status)->toEqual(PaymentStatus::Completed);

    $this->booking->refresh();
    expect($this->booking->paid_amount)->toEqual(2000)
        ->and($this->booking->balance_amount)->toEqual(3000);
});

test('cannot record a payment exceeding the balance', function () {
    $this->actingAs($this->finance)
        ->post(route('payments.store'), [
            'booking_id' => $this->booking->id,
            'amount' => 6000, // Balance is 5000
            'payment_method' => PaymentMethod::Cash->value,
            'payment_date' => now()->format('Y-m-d'),
        ])
        ->assertSessionHasErrors('amount');

    expect(Payment::count())->toBe(0);
});

test('finance can void a payment and booking amounts are reversed', function () {
    $payment = Payment::factory()->create([
        'booking_id' => $this->booking->id,
        'customer_id' => $this->customer->id,
        'amount' => 2000,
        'status' => PaymentStatus::Completed,
    ]);

    $this->booking->update([
        'paid_amount' => 2000,
        'balance_amount' => 3000,
    ]);

    $this->actingAs($this->finance)
        ->delete(route('payments.destroy', $payment))
        ->assertSessionHasNoErrors();

    $payment->refresh();
    expect($payment->status)->toEqual(PaymentStatus::Failed)
        ->and($payment->trashed())->toBeTrue();

    $this->booking->refresh();
    expect($this->booking->paid_amount)->toEqual(0)
        ->and($this->booking->balance_amount)->toEqual(5000);
});

test('cannot void an already voided payment', function () {
    $payment = Payment::factory()->create([
        'booking_id' => $this->booking->id,
        'amount' => 2000,
        'status' => PaymentStatus::Failed,
    ]);

    // Attempting to delete when already failed
    $this->actingAs($this->finance)
        ->delete(route('payments.destroy', $payment))
        ->assertSessionHasErrors('error');
});

test('staff without finance role cannot record payments', function () {
    $this->actingAs($this->staff)
        ->post(route('payments.store'), [
            'booking_id' => $this->booking->id,
            'amount' => 1000,
            'payment_method' => PaymentMethod::Cash->value,
            'payment_date' => now()->format('Y-m-d'),
        ])
        ->assertStatus(403);
});
