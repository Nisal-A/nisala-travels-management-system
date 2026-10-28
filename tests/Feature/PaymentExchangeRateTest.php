<?php

use App\Enums\BookingStatus;
use App\Enums\Currency;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\ExchangeRate;
use App\Models\Payment;
use App\Models\TourPackage;
use App\Models\User;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->financeUser = User::factory()->finance()->create();

    $this->customer = Customer::factory()->create();
    $this->tourPackage = TourPackage::factory()->create([
        'currency' => 'USD',
    ]);
});

test('payment creation snapshots exchange rate and freezes amount_lkr against future rate changes', function () {
    // 1. Initial exchange rate: 1 USD = 300.000000 LKR
    ExchangeRate::create([
        'currency' => Currency::USD,
        'rate_to_lkr' => '300.000000',
        'source' => 'manual',
        'fetched_at' => now()->subDay(),
    ]);

    $booking = Booking::factory()->create([
        'customer_id' => $this->customer->id,
        'tour_package_id' => $this->tourPackage->id,
        'currency' => 'USD',
        'base_amount' => 1000,
        'final_amount' => 1000,
        'paid_amount' => 0,
        'balance_amount' => 1000,
    ]);

    // 2. Record payment of 100 USD
    $response = $this->actingAs($this->financeUser)->post(route('payments.store'), [
        'booking_id' => $booking->id,
        'amount' => '100.00',
        'payment_method' => 'credit_card',
        'payment_date' => now()->toDateString(),
    ]);

    $response->assertSessionHasNoErrors();

    $payment = Payment::where('booking_id', $booking->id)->first();
    expect($payment)->not->toBeNull();
    expect((string) $payment->exchange_rate_to_lkr)->toBe('300.000000');
    // 100.00 * 300.00 = 30000.00 LKR
    expect((string) $payment->amount_lkr)->toBe('30000.00');

    // 3. New exchange rate arrives: 1 USD = 350.000000 LKR
    ExchangeRate::create([
        'currency' => Currency::USD,
        'rate_to_lkr' => '350.000000',
        'source' => 'manual',
        'fetched_at' => now(),
    ]);

    // 4. Reload payment from DB — its rate and amount_lkr must remain completely frozen
    $freshPayment = $payment->fresh();
    expect((string) $freshPayment->exchange_rate_to_lkr)->toBe('300.000000');
    expect((string) $freshPayment->amount_lkr)->toBe('30000.00');

    // 5. A second payment recorded now should use the new rate of 350.000000
    $response2 = $this->actingAs($this->financeUser)->post(route('payments.store'), [
        'booking_id' => $booking->id,
        'amount' => '50.00',
        'payment_method' => 'credit_card',
        'payment_date' => now()->toDateString(),
    ]);

    $response2->assertSessionHasNoErrors();

    $secondPayment = Payment::where('booking_id', $booking->id)->where('id', '!=', $payment->id)->first();
    expect((string) $secondPayment->exchange_rate_to_lkr)->toBe('350.000000');
    // 50.00 * 350.00 = 17500.00 LKR
    expect((string) $secondPayment->amount_lkr)->toBe('17500.00');
});

test('booking creation snapshots exchange rate at the time of booking', function () {
    ExchangeRate::create([
        'currency' => Currency::USD,
        'rate_to_lkr' => '310.000000',
        'source' => 'manual',
        'fetched_at' => now(),
    ]);

    $staffUser = User::factory()->staff()->create();

    $response = $this->actingAs($staffUser)->post(route('bookings.store'), [
        'customer_id' => $this->customer->id,
        'tour_package_id' => $this->tourPackage->id,
        'booking_date' => now()->toDateString(),
        'travel_date' => now()->addMonth()->toDateString(),
        'travelers' => [
            [
                'full_name' => 'John Doe',
                'traveler_type' => 'adult',
            ],
        ],
    ]);

    $response->assertSessionHasNoErrors();

    $booking = Booking::latest('id')->first();
    expect($booking)->not->toBeNull();
    expect((string) $booking->exchange_rate_to_lkr)->toBe('310.000000');
});
