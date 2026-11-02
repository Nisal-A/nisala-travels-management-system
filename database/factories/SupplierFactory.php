<?php

namespace Database\Factories;

use App\Enums\SupplierType;
use App\Models\Supplier;
use App\Services\NumberGenerator;
use Illuminate\Database\Eloquent\Factories\Factory;

class SupplierFactory extends Factory
{
    protected $model = Supplier::class;

    public function definition(): array
    {
        return [
            'supplier_code' => app(NumberGenerator::class)->supplier(),
            'name' => $this->faker->company(),
            'type' => $this->faker->randomElement(SupplierType::cases()),
            'contact_name' => $this->faker->name(),
            'phone' => $this->faker->phoneNumber(),
            'email' => $this->faker->safeEmail(),
            'default_currency' => 'LKR',
            'is_active' => true,
            'notes' => $this->faker->sentence(),
        ];
    }
}
