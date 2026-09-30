<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Customer;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\CustomerDocument;
use App\Enums\UserRole;
use Spatie\Permission\Models\Role;
use Database\Seeders\RoleSeeder;

class PortalAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure roles exist
        if (Role::count() === 0) {
            $this->seed(RoleSeeder::class);
        }
    }

    private function createCustomerUser()
    {
        $user = User::factory()->create();
        $user->assignRole(UserRole::Customer->value);
        
        $customer = Customer::factory()->create([
            'user_id' => $user->id,
        ]);
        
        return [$user, $customer];
    }

    public function test_guests_are_blocked()
    {
        $response = $this->get('/portal/bookings');
        $response->assertRedirect('/login');
    }

    public function test_staff_without_customer_profile_are_blocked()
    {
        $user = User::factory()->create();
        $user->assignRole(UserRole::Staff->value);
        
        $response = $this->actingAs($user)->get('/portal/bookings');
        $response->assertStatus(403);
    }

    public function test_customer_can_only_access_their_own_booking()
    {
        [$userA, $customerA] = $this->createCustomerUser();
        [$userB, $customerB] = $this->createCustomerUser();
        
        $bookingB = Booking::factory()->create(['customer_id' => $customerB->id]);
        
        $response = $this->actingAs($userA)->get("/portal/bookings/{$bookingB->id}");
        $response->assertStatus(403);
        
        $response = $this->actingAs($userA)->get("/portal/bookings/{$bookingB->id}/itinerary");
        $response->assertStatus(403);
    }

    public function test_customer_can_only_access_their_own_document()
    {
        [$userA, $customerA] = $this->createCustomerUser();
        [$userB, $customerB] = $this->createCustomerUser();
        
        $documentB = CustomerDocument::factory()->create(['customer_id' => $customerB->id]);
        
        $response = $this->actingAs($userA)->delete("/portal/documents/{$documentB->id}");
        $response->assertStatus(403);
    }

    public function test_customer_can_only_access_their_own_payment()
    {
        [$userA, $customerA] = $this->createCustomerUser();
        [$userB, $customerB] = $this->createCustomerUser();
        
        $paymentB = Payment::factory()->create(['customer_id' => $customerB->id]);
        
        $response = $this->actingAs($userA)->get("/portal/payments/{$paymentB->id}/receipt");
        $response->assertStatus(403);
    }

    public function test_dashboard_numbers_are_correct()
    {
        [$user, $customer] = $this->createCustomerUser();
        
        Booking::factory()->create([
            'customer_id' => $customer->id,
            'travel_date' => now()->addDays(5),
            'balance_amount' => 500,
        ]);
        
        Booking::factory()->create([
            'customer_id' => $customer->id,
            'travel_date' => now()->addDays(10),
            'balance_amount' => 200,
        ]);
        
        CustomerDocument::factory()->create([
            'customer_id' => $customer->id,
            'verification_status' => 'rejected',
        ]);
        
        $response = $this->actingAs($user)->get("/portal");
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Portal/Dashboard')
            ->has('daysRemaining')
            ->where('totalOutstanding', 700)
            ->where('actionItems', function ($val) {
                return count($val) > 0;
            })
        );
    }
    
    public function test_resources_do_not_leak_hidden_fields()
    {
        [$user, $customer] = $this->createCustomerUser();
        
        $booking = Booking::factory()->create([
            'customer_id' => $customer->id,
            'notes' => 'Some customer notes',
        ]);
        
        $response = $this->actingAs($user)->get("/portal/bookings/{$booking->id}");
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Portal/BookingDetail')
            ->has('booking.data', fn ($page) => $page
                ->has('id')
                ->has('booking_reference')
                ->has('notes')
                ->missing('internal_notes')
                ->missing('staff_only')
                ->missing('margin')
                ->etc()
            )
        );
    }
}
