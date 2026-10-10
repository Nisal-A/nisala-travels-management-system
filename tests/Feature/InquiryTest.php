<?php

use App\Events\InquirySubmitted;
use App\Models\Customer;
use Illuminate\Support\Facades\Event;
use function Pest\Laravel\postJson;
use function Pest\Laravel\withSession;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    config(['session.driver' => 'array']);
});

it('validates inquiry required fields', function () {
    $response = postJson('/inquiries', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'email', 'phone', 'consent']);
});

it('rejects inquiry if submitted too quickly (time based honeypot)', function () {
    // Session time is now, simulating a form submit immediately after page load
    withSession(['form_start_time' => time()]);

    $response = postJson('/inquiries', [
        'name' => 'Fast Bot',
        'email' => 'bot@example.com',
        'phone' => '123456789',
        'consent' => true,
    ]);

    // Controller returns 200 to trick bots, but doesn't store the lead
    $response->assertStatus(200);

    expect(Customer::where('email', 'bot@example.com')->exists())->toBeFalse();
});

it('rejects inquiry if honeypot field is filled', function () {
    // Valid time session
    withSession(['form_start_time' => time() - 5]);

    $response = postJson('/inquiries', [
        'name' => 'Honey Bot',
        'email' => 'honey@example.com',
        'phone' => '123456789',
        'consent' => true,
        'website_field' => 'bot-filled-this',
    ]);

    // Controller returns 200 to trick bots
    $response->assertStatus(200);

    expect(Customer::where('email', 'honey@example.com')->exists())->toBeFalse();
});

it('stores valid inquiry and fires event', function () {
    Event::fake();

    withSession(['form_start_time' => time() - 5]);

    $response = postJson('/inquiries', [
        'name' => 'John Doe',
        'email' => 'johndoe@example.com',
        'phone' => '+94771234567',
        'destination_interest' => 'Sri Lanka',
        'number_of_travelers' => 2,
        'preferred_travel_month' => 'November 2026',
        'message' => 'Looking for a relaxing tour.',
        'consent' => true,
    ]);

    $response->assertStatus(200);

    $customer = Customer::where('email', 'johndoe@example.com')->first();
    expect($customer)->not->toBeNull()
        ->status->toBe('New')
        ->source->toBe('website')
        ->notes->toContain('Sri Lanka')
        ->notes->toContain('November 2026')
        ->notes->toContain('Looking for a relaxing tour.');

    Event::assertDispatched(InquirySubmitted::class, function ($event) use ($customer) {
        return $event->lead->id === $customer->id;
    });
});
