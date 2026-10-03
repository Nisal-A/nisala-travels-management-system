<?php

namespace Tests\Feature;

use App\Events\InquirySubmitted;
use App\Models\Customer;
use App\Models\Destination;
use App\Models\TourPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class PublicWebsiteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['session.driver' => 'array']);
    }

    public function test_inactive_packages_are_never_exposed()
    {
        $destination = Destination::factory()->create();

        TourPackage::factory()->create([
            'is_active' => false,
            'status' => 'inactive',
            'package_name' => 'Inactive Package',
            'destination_id' => $destination->id,
        ]);

        TourPackage::factory()->create([
            'is_active' => true,
            'status' => 'active',
            'package_name' => 'Active Package',
            'destination_id' => $destination->id,
        ]);

        $response = $this->get('/api/public/tours');

        $response->assertStatus(200);
        $this->assertStringNotContainsString('Inactive Package', $response->getContent());
        $this->assertStringContainsString('Active Package', $response->getContent());
    }

    public function test_filters_and_sorts_are_whitelisted()
    {
        $dest1 = Destination::factory()->create(['country' => 'Sri Lanka', 'city_region' => 'Colombo']);
        $dest2 = Destination::factory()->create(['country' => 'Sri Lanka', 'city_region' => 'Kandy']);

        TourPackage::factory()->create([
            'destination_id' => $dest1->id,
            'duration_days' => 5,
            'price' => 100,
            'is_active' => true,
            'status' => 'active',
        ]);

        TourPackage::factory()->create([
            'destination_id' => $dest2->id,
            'duration_days' => 10,
            'price' => 200,
            'is_active' => true,
            'status' => 'active',
        ]);

        $response = $this->get('/api/public/tours?destination=Colombo');
        $this->assertCount(1, $response->json('data'));

        $response = $this->get('/api/public/tours?price_min=150');
        $this->assertCount(1, $response->json('data'));

        $response = $this->get('/api/public/tours?sort=price_desc');
        $this->assertEquals(200, $response->json('data.0.price_from'));
    }

    public function test_inquiry_validation_and_lead_creation()
    {
        Event::fake();

        $response = $this->postJson('/inquiries', [
            'name' => 'John Doe',
            'email' => 'invalid-email',
            'phone' => '1234567890',
            'consent' => true,
        ]);
        $response->assertStatus(422);

        // Bypass time check by setting session
        $this->withSession(['form_start_time' => time() - 5]);

        $response = $this->postJson('/inquiries', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '1234567890',
            'message' => 'Hello <b>world</b>',
            'consent' => true,
        ]);

        $response->assertStatus(200);

        $lead = Customer::where('email', 'john@example.com')->first();
        $this->assertNotNull($lead);
        $this->assertEquals('New', $lead->status);
        $this->assertEquals('website', $lead->source);
        $this->assertStringContainsString('Hello world', $lead->notes);
        $this->assertStringNotContainsString('<b>', $lead->notes); // Strip tags check

        Event::assertDispatched(InquirySubmitted::class);
    }

    public function test_honeypot_and_timing_rejection()
    {
        // Timing check
        $this->withSession(['form_start_time' => time()]);
        $response = $this->postJson('/inquiries', [
            'name' => 'Fast Bot',
            'email' => 'bot@example.com',
            'phone' => '1234567890',
            'consent' => true,
        ]);
        $response->assertStatus(200);
        $this->assertNull(Customer::where('email', 'bot@example.com')->first());

        // Honeypot check
        $this->withSession(['form_start_time' => time() - 5]);
        $response = $this->postJson('/inquiries', [
            'name' => 'Honeypot Bot',
            'email' => 'honeypot@example.com',
            'phone' => '1234567890',
            'consent' => true,
            'website_field' => 'bot filled this',
        ]);
        $response->assertStatus(200);
        $this->assertNull(Customer::where('email', 'honeypot@example.com')->first());
    }

    public function test_duplicate_lead_handling()
    {
        $this->withSession(['form_start_time' => time() - 5]);

        Customer::create([
            'customer_id' => 'CUS-TEST',
            'full_name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '0987654321',
            'status' => 'New',
            'notes' => 'Old notes',
        ]);

        $response = $this->postJson('/inquiries', [
            'name' => 'Jane Doe updated',
            'email' => 'jane@example.com',
            'phone' => '0987654321',
            'message' => 'New inquiry',
            'consent' => true,
        ]);

        $response->assertStatus(200);

        $leads = Customer::where('email', 'jane@example.com')->get();
        $this->assertCount(1, $leads); // Did not duplicate

        $this->assertStringContainsString('Old notes', $leads[0]->notes);
        $this->assertStringContainsString('New inquiry', $leads[0]->notes);
    }
}
