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
});

test('a payment can be created and cast correctly', function () {
    $booking = Booking::factory()->create();
    $customer = $booking->customer;
    $user = User::factory()->staff()->create();

    $payment = Payment::factory()->create([
        'booking_id' => $booking->id,
        'customer_id' => $customer->id,
        'amount' => 1500.50,
        'payment_method' => PaymentMethod::BankTransfer,
        'status' => PaymentStatus::Verified,
        'recorded_by' => $user->id,
    ]);

    expect($payment->amount)->toEqual(1500.50)
        ->and($payment->payment_method)->toBe(PaymentMethod::BankTransfer)
        ->and($payment->status)->toBe(PaymentStatus::Verified);
});

test('a payment belongs to a booking and customer', function () {
    $payment = Payment::factory()->create();

    expect($payment->booking)->toBeInstanceOf(Booking::class)
        ->and($payment->customer)->toBeInstanceOf(Customer::class)
        ->and($payment->recordedBy)->toBeInstanceOf(User::class);
});
