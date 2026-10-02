<?php

namespace Tests\Feature\Portal;

use App\Models\User;
use App\Models\Customer;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // create roles
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
    }

    public function test_payments_list_only_shows_own_records()
    {
        $user1 = User::factory()->create();
        $user1->assignRole('customer');
        $customer1 = Customer::factory()->create(['user_id' => $user1->id]);
        $booking1 = Booking::factory()->create(['customer_id' => $customer1->id]);
        $payment1 = Payment::factory()->create(['customer_id' => $customer1->id, 'booking_id' => $booking1->id, 'amount' => 100]);

        $user2 = User::factory()->create();
        $user2->assignRole('customer');
        $customer2 = Customer::factory()->create(['user_id' => $user2->id]);
        $booking2 = Booking::factory()->create(['customer_id' => $customer2->id]);
        $payment2 = Payment::factory()->create(['customer_id' => $customer2->id, 'booking_id' => $booking2->id, 'amount' => 200]);

        $response = $this->actingAs($user1)->get(route('portal.payments.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
            ->component('Portal/Payments')
            ->has('payments.data', 1)
            ->where('payments.data.0.id', $payment1->id)
            ->where('payments.data.0.amount', 100)
        );
    }

    public function test_receipt_authorization_prevents_other_customers()
    {
        $user1 = User::factory()->create();
        $user1->assignRole('customer');
        $customer1 = Customer::factory()->create(['user_id' => $user1->id]);
        $booking1 = Booking::factory()->create(['customer_id' => $customer1->id]);
        $payment1 = Payment::factory()->create(['customer_id' => $customer1->id, 'booking_id' => $booking1->id]);

        $user2 = User::factory()->create();
        $user2->assignRole('customer');
        $customer2 = Customer::factory()->create(['user_id' => $user2->id]);

        // User 2 trying to access user 1's payment receipt
        $response = $this->actingAs($user2)->get(route('portal.payments.receipt', $payment1));

        $response->assertStatus(403);
        
        // User 1 trying to access user 1's payment receipt
        $response2 = $this->actingAs($user1)->get(route('portal.payments.receipt', $payment1));
        
        $response2->assertStatus(200);
    }
}
