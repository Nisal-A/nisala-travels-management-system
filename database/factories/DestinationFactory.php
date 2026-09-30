<?php

namespace Database\Factories;

use App\Models\Destination;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Destination>
 */
class DestinationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'country' => $this->faker->country(),
            'city_region' => $this->faker->city(),
            'description' => $this->faker->sentence(),
            'status' => 'active',
        ];
    }
}
