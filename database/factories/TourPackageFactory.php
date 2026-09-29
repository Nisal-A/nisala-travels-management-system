<?php

namespace Database\Factories;

use App\Models\TourPackage;
use Illuminate\Database\Eloquent\Factories\Factory;

use App\Models\Destination;

/**
 * @extends Factory<TourPackage>
 */
class TourPackageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'destination_id' => Destination::factory(),
            'package_name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph(),
            'duration_days' => $this->faker->numberBetween(3, 14),
            'start_date' => $this->faker->optional()->date(),
            'end_date' => $this->faker->optional()->date(),
            'price' => $this->faker->randomFloat(2, 1000, 5000),
            'currency' => 'LKR',
            'capacity' => $this->faker->numberBetween(10, 50),
            'available_seats' => $this->faker->numberBetween(0, 10),
            'status' => 'active',
        ];
    }
}
