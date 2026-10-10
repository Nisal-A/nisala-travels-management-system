<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\TourPackage;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure roles exist
        Role::firstOrCreate(['name' => 'super_admin']);
        Role::firstOrCreate(['name' => 'manager']);
        Role::firstOrCreate(['name' => 'finance']);
        Role::firstOrCreate(['name' => 'staff']);
    }

    public function test_finance_role_can_access_reports()
    {
        $user = User::factory()->create();
        $user->assignRole('finance');

        $response = $this->actingAs($user)->get(route('reports.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Reports/Index'));
    }
    
    public function test_manager_role_can_access_reports()
    {
        $user = User::factory()->create();
        $user->assignRole('manager');

        $response = $this->actingAs($user)->get(route('reports.index'));

        $response->assertStatus(200);
    }

    public function test_staff_role_gets_forbidden_for_reports()
    {
        $user = User::factory()->create();
        $user->assignRole('staff');

        $response = $this->actingAs($user)->get(route('reports.index'));

        $response->assertStatus(403);
    }

    public function test_outstanding_balance_math()
    {
        $user = User::factory()->create();
        $user->assignRole('finance');

        $customer = Customer::factory()->create();
        $tour = TourPackage::factory()->create();

        // Create a booking with final_amount = 1000, paid = 400, balance = 600
        Booking::create([
            'booking_reference' => 'TEST-001',
            'customer_id' => $customer->id,
            'tour_package_id' => $tour->id,
            'booking_status' => 'confirmed',
            'base_amount' => 1000,
            'final_amount' => 1000,
            'paid_amount' => 400,
            'balance_amount' => 600,
            'number_of_travelers' => 2,
            'booking_date' => now(),
            'travel_date' => now()->addDays(10),
        ]);

        $response = $this->actingAs($user)->get(route('reports.index'));
        $response->assertStatus(200);
        
        $page = $response->viewData('page');
        $this->assertEquals(600, $page['props']['kpis']['outstanding']['value']);
    }
}
