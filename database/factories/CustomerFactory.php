<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => 'CUST-' . $this->faker->unique()->numberBetween(1000, 99999),
            'full_name' => $this->faker->name(),
            'nic' => $this->faker->unique()->numerify('#########V'),
            'passport_number' => $this->faker->unique()->bothify('?#######'),
            'dob' => $this->faker->date('Y-m-d', '-18 years'),
            'gender' => $this->faker->randomElement(['Male', 'Female', 'Other']),
            'nationality' => $this->faker->country(),
            'phone' => $this->faker->phoneNumber(),
            'whatsapp' => $this->faker->phoneNumber(),
            'email' => $this->faker->unique()->safeEmail(),
            'address' => $this->faker->address(),
            'emergency_contact_name' => $this->faker->name(),
            'emergency_contact_phone' => $this->faker->phoneNumber(),
            'status' => 'active',
            'notes' => $this->faker->optional(0.3)->sentence(),
        ];
    }
}
