<?php

namespace Database\Factories;

use App\Models\DocumentType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DocumentType>
 */
class DocumentTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->randomElement(['NIC', 'Passport', 'Visa', 'Photo', 'Ticket', 'Insurance']),
            'description' => $this->faker->sentence(),
            'is_required' => $this->faker->boolean(),
            'is_active' => true,
            'tracks_expiry' => $this->faker->boolean(),
        ];
    }
}
