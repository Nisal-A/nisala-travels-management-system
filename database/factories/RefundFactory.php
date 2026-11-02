<?php

namespace Database\Factories;

use App\Enums\RefundStatus;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Refund;
use App\Models\User;
use App\Services\NumberGenerator;
use Illuminate\Database\Eloquent\Factories\Factory;

class RefundFactory extends Factory
{
    protected $model = Refund::class;

    public function definition(): array
    {
        return [
            'refund_number' => app(NumberGenerator::class)->refund(),
            'booking_id' => Booking::factory(),
            'payment_id' => null,
            'customer_id' => Customer::factory(),
            'amount' => 500.00,
            'cancellation_charge' => 0.00,
            'currency' => 'LKR',
            'exchange_rate_to_lkr' => '1.000000',
            'amount_lkr' => 500.00,
            'reason' => $this->faker->sentence(),
            'status' => RefundStatus::Requested,
            'requested_by' => User::factory(),
            'approved_by' => null,
            'approved_at' => null,
            'paid_on' => null,
            'payment_method' => null,
            'notes' => null,
        ];
    }
}
