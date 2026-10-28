<?php

namespace Database\Factories;

use App\Enums\SupplierType;
use App\Models\PackageCostLine;
use App\Models\Supplier;
use App\Models\TourPackage;
use Illuminate\Database\Eloquent\Factories\Factory;

class PackageCostLineFactory extends Factory
{
    protected $model = PackageCostLine::class;

    public function definition(): array
    {
        return [
            'tour_package_id' => TourPackage::factory(),
            'supplier_id' => Supplier::factory(),
            'category' => $this->faker->randomElement(SupplierType::cases()),
            'description' => $this->faker->sentence(3),
            'amount' => 1000.00,
            'currency' => 'LKR',
            'exchange_rate_to_lkr' => '1.000000',
            'amount_lkr' => 1000.00,
            'incurred_on' => now()->toDateString(),
            'paid_on' => null,
            'notes' => null,
        ];
    }
}
