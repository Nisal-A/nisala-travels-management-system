<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\PaymentSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PaymentSchedule>
 */
class PaymentScheduleFactory extends Factory
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
            'description' => $this->faker->sentence(3),
            'amount' => $this->faker->randomFloat(2, 100, 1000),
            'due_date' => $this->faker->dateTimeBetween('now', '+1 month')->format('Y-m-d'),
            'status' => 'unpaid',
        ];
    }
}
