<?php

namespace Database\Factories;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'booking_id' => \App\Models\Booking::factory(),
            'customer_id' => \App\Models\Customer::factory(),
            'amount' => $this->faker->randomFloat(2, 100, 5000),
            'currency' => 'LKR',
            'payment_method' => $this->faker->randomElement(\App\Enums\PaymentMethod::cases()),
            'payment_date' => $this->faker->date(),
            'reference_number' => $this->faker->uuid(),
            'recorded_by' => \App\Models\User::factory(),
            'notes' => $this->faker->sentence(),
            'status' => $this->faker->randomElement(\App\Enums\PaymentStatus::cases()),
        ];
    }
}
