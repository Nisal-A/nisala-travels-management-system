<?php

namespace Database\Factories;

use App\Enums\TravelerType;
use App\Models\Booking;
use App\Models\BookingTraveler;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BookingTraveler>
 */
class BookingTravelerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'customer_id' => $this->faker->boolean(30) ? Customer::factory() : null,
            'full_name' => $this->faker->name(),
            'dob' => $this->faker->date('Y-m-d', '-18 years'),
            'gender' => $this->faker->randomElement(['Male', 'Female']),
            'nationality' => $this->faker->country(),
            'nic' => $this->faker->numerify('#########V'),
            'passport_number' => 'N'.$this->faker->numerify('#######'),
            'passport_expiry' => $this->faker->dateTimeBetween('+1 year', '+10 years')->format('Y-m-d'),
            'relationship_to_primary' => $this->faker->randomElement(['Self', 'Spouse', 'Child', 'Friend']),
            'traveler_type' => $this->faker->randomElement([
                TravelerType::Adult,
                TravelerType::Child,
                TravelerType::Infant,
            ]),
            'contact_information' => $this->faker->phoneNumber(),
            'special_requirements' => $this->faker->optional(0.2)->sentence(),
            'notes' => $this->faker->optional(0.2)->sentence(),
        ];
    }
}
