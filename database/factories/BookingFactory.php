<?php

namespace Database\Factories;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;

use App\Models\Customer;
use App\Models\TourPackage;
use App\Models\User;
use App\Enums\BookingStatus;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    public function definition(): array
    {
        $baseAmount = $this->faker->randomFloat(2, 500, 5000);
        $discountAmount = $this->faker->randomFloat(2, 0, 100);
        $finalAmount = $baseAmount - $discountAmount;
        $paidAmount = $this->faker->randomFloat(2, 0, $finalAmount);
        
        return [
            'booking_reference' => 'NT-' . $this->faker->unique()->numerify('####-######'),
            'customer_id' => Customer::factory(),
            'tour_package_id' => TourPackage::factory(),
            'assigned_to' => null,
            'booking_date' => $this->faker->date(),
            'travel_date' => $this->faker->dateTimeBetween('+1 week', '+2 months')->format('Y-m-d'),
            'return_date' => $this->faker->dateTimeBetween('+2 months', '+3 months')->format('Y-m-d'),
            'number_of_travelers' => $this->faker->numberBetween(1, 4),
            'base_amount' => $baseAmount,
            'discount_amount' => $discountAmount,
            'final_amount' => $finalAmount,
            'paid_amount' => $paidAmount,
            'balance_amount' => $finalAmount - $paidAmount,
            'currency' => 'LKR',
            'booking_status' => $this->faker->randomElement([
                BookingStatus::Pending,
                BookingStatus::Confirmed,
                BookingStatus::Cancelled,
                BookingStatus::Completed
            ]),
            'payment_status' => $paidAmount >= $finalAmount ? 'Paid' : ($paidAmount > 0 ? 'Partial' : 'Unpaid'),
            'notes' => $this->faker->optional()->sentence(),
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
