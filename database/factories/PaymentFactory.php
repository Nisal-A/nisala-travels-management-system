<?php

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\User;
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
            'booking_id' => Booking::factory(),
            'customer_id' => Customer::factory(),
            'amount' => $this->faker->randomFloat(2, 100, 5000),
            'currency' => 'LKR',
            'payment_method' => $this->faker->randomElement(PaymentMethod::cases()),
            'payment_date' => $this->faker->date(),
            'reference_number' => $this->faker->uuid(),
            'recorded_by' => User::factory(),
            'notes' => $this->faker->sentence(),
            'status' => $this->faker->randomElement(PaymentStatus::cases()),
        ];
    }
}
