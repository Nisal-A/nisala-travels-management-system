<?php

use App\Events\InquirySubmitted;
use App\Models\Customer;
use App\Models\Destination;
use App\Models\Inquiry;
use App\Models\TourPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

uses(RefreshDatabase::class);

beforeEach(function () {
    config([
        'services.nisala_web.key' => 'test-valid-api-key',
        'services.nisala_web.ip_salt' => 'test-ip-salt',
    ]);
    RateLimiter::clear(hash('sha256', '203.0.113.10'));
    RateLimiter::clear(hash('sha256', '203.0.113.20'));
    RateLimiter::clear(hash('sha256', '127.0.0.1'));
});

function validInquiryPayload(array $overrides = []): array
{
    return array_merge([
        'interest' => 'A specific tour',
        'tour_slug' => 'sri-lanka-cultural-tour',
        'destination_slug' => 'sri-lanka',
        'start_date' => now()->addDays(10)->format('Y-m-d'),
        'end_date' => now()->addDays(15)->format('Y-m-d'),
        'flexible_dates' => true,
        'adults' => 2,
        'children' => 1,
        'child_ages' => [7],
        'full_name' => 'Jane Traveler',
        'email' => 'jane@example.com',
        'phone' => '+94771234567',
        'preferred_contact' => 'whatsapp',
        'country' => 'United Kingdom',
        'message' => 'Interested in heritage hotels and village tours.',
        'budget_range' => 'LKR 150,000 to 300,000',
        'referral_source' => 'Google search',
        'privacy_consent' => true,
        'marketing_consent' => true,
    ], $overrides);
}

function createPublishedRecords(): array
{
    $destination = Destination::create([
        'slug' => 'sri-lanka',
        'country' => 'Sri Lanka',
        'city_region' => 'Colombo & Cultural Triangle',
        'status' => 'active',
    ]);

    $tour = TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Sri Lanka Cultural Tour',
        'slug' => 'sri-lanka-cultural-tour',
        'price' => 150000,
        'status' => 'active',
        'is_active' => true,
    ]);

    return [$destination, $tour];
}

test('valid payload returns 201 with a reference matching NT- prefix', function () {
    createPublishedRecords();

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->postJson('/api/public/inquiries', validInquiryPayload());

    $response->assertStatus(201);
    $reference = $response->json('reference');
    expect($reference)->toMatch('/^NT-[A-Z0-9]{8}$/');
});

test('stored row has source website, status New, consent timestamps, and non-null ip_hash', function () {
    [$destination, $tour] = createPublishedRecords();

    $response = $this->withHeaders([
        'X-Nisala-Key' => 'test-valid-api-key',
        'X-Client-IP' => '198.51.100.5',
    ])->postJson('/api/public/inquiries', validInquiryPayload([
        'marketing_consent' => true,
    ]));

    $response->assertStatus(201);
    $reference = $response->json('reference');

    $inquiry = Inquiry::where('reference', $reference)->first();
    expect($inquiry)->not->toBeNull()
        ->and($inquiry->source)->toBe('website')
        ->and($inquiry->status)->toBe('New')
        ->and($inquiry->privacy_consent_at)->not->toBeNull()
        ->and($inquiry->marketing_consent_at)->not->toBeNull()
        ->and($inquiry->ip_hash)->not->toBeNull()
        ->and($inquiry->name)->toBe('Jane Traveler')
        ->and($inquiry->email)->toBe('jane@example.com')
        ->and($inquiry->contact_information)->toBe('jane@example.com')
        ->and($inquiry->tour_package_id)->toBe($tour->id)
        ->and($inquiry->destination_id)->toBe($destination->id)
        ->and($inquiry->destination)->toBe('Colombo & Cultural Triangle')
        ->and($inquiry->package_interest)->toBe('Sri Lanka Cultural Tour')
        ->and($inquiry->number_of_travelers)->toBe(3)
        ->and($inquiry->travel_date?->format('Y-m-d'))->toBe(now()->addDays(10)->format('Y-m-d'));
});

test('422 validation errors for each invalid case', function (string $field, mixed $value, array $additionalPayload = [], ?string $expectedErrorKey = null) {
    createPublishedRecords();

    $payload = validInquiryPayload(array_merge([$field => $value], $additionalPayload));

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->postJson('/api/public/inquiries', $payload);

    $response->assertStatus(422)
        ->assertJsonValidationErrors($expectedErrorKey ?? $field);
})->with([
    'unknown interest' => ['interest', 'Invalid Unknown Interest'],
    'end date before start date' => ['end_date', now()->addDays(3)->format('Y-m-d'), ['start_date' => now()->addDays(10)->format('Y-m-d')]],
    'start date in the past' => ['start_date', now()->subDay()->format('Y-m-d'), ['end_date' => now()->addDays(2)->format('Y-m-d')]],
    'children 2 with one child age' => ['children', 2, ['child_ages' => [7]], 'child_ages'],
    'child age 18' => ['child_ages', [18], ['children' => 1], 'child_ages.0'],
    'invalid phone' => ['phone', '123'],
    'phone missing when preferred_contact is whatsapp' => ['phone', null, ['preferred_contact' => 'whatsapp'], 'phone'],
    'privacy_consent missing' => ['privacy_consent', false],
    'adults 0' => ['adults', 0],
    'unpublished tour slug' => ['tour_slug', 'unpublished-tour'],
    'unknown destination slug' => ['destination_slug', 'unknown-destination-slug'],
]);

test('honeypot: filled website field returns 201 with reference and creates no row even if payload is otherwise invalid', function () {
    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->postJson('/api/public/inquiries', [
            'website' => 'http://spambot.example.com',
            'interest' => 'invalid-interest',
            'adults' => 0,
            'email' => 'not-an-email',
            'privacy_consent' => false,
        ]);

    $response->assertStatus(201);
    expect($response->json('reference'))->toMatch('/^NT-[A-Z0-9]{8}$/');

    expect(Inquiry::count())->toBe(0)
        ->and(Customer::count())->toBe(0);
});

test('rate limit: the 6th request within 10 minutes from the same X-Client-IP returns 429 and different IPs are counted separately', function () {
    createPublishedRecords();

    $headers = [
        'X-Nisala-Key' => 'test-valid-api-key',
        'X-Client-IP' => '203.0.113.10',
    ];

    // 5 requests allowed
    for ($i = 0; $i < 5; $i++) {
        $res = $this->withHeaders($headers)->postJson('/api/public/inquiries', validInquiryPayload());
        $res->assertStatus(201);
    }

    // 6th request from same IP returns 429
    $sixth = $this->withHeaders($headers)->postJson('/api/public/inquiries', validInquiryPayload());
    $sixth->assertStatus(429);

    // Different IP still succeeds
    $diffIpRes = $this->withHeaders([
        'X-Nisala-Key' => 'test-valid-api-key',
        'X-Client-IP' => '203.0.113.20',
    ])->postJson('/api/public/inquiries', validInquiryPayload());
    $diffIpRes->assertStatus(201);
});

test('X-Client-IP is ignored without a valid key (401)', function () {
    $response = $this->withHeaders([
        'X-Client-IP' => '203.0.113.10',
    ])->postJson('/api/public/inquiries', validInquiryPayload());

    $response->assertStatus(401);
});

test('two identical submissions create two separate Inquiry rows and no Customer row is created', function () {
    createPublishedRecords();

    $payload = validInquiryPayload();

    $res1 = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')->postJson('/api/public/inquiries', $payload);
    $res1->assertStatus(201);

    $res2 = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')->postJson('/api/public/inquiries', $payload);
    $res2->assertStatus(201);

    expect(Inquiry::count())->toBe(2)
        ->and(Customer::count())->toBe(0)
        ->and($res1->json('reference'))->not->toBe($res2->json('reference'));
});

test('marketing_consent false: marketing_consent_at is null', function () {
    createPublishedRecords();

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->postJson('/api/public/inquiries', validInquiryPayload([
            'marketing_consent' => false,
        ]));

    $response->assertStatus(201);
    $inquiry = Inquiry::where('reference', $response->json('reference'))->first();

    expect($inquiry->marketing_consent_at)->toBeNull()
        ->and($inquiry->privacy_consent_at)->not->toBeNull();
});

test('Event::fake: InquirySubmitted is dispatched with an Inquiry', function () {
    createPublishedRecords();
    Event::fake([InquirySubmitted::class]);

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->postJson('/api/public/inquiries', validInquiryPayload());

    $response->assertStatus(201);

    Event::assertDispatched(InquirySubmitted::class, function ($event) {
        return $event->lead instanceof Inquiry
            && $event->lead->email === 'jane@example.com';
    });
});

test('Log::spy: no name, email, phone, or message appears in any logged context', function () {
    createPublishedRecords();
    Log::spy();

    $name = 'TopSecret Name';
    $email = 'topsecret@example.com';
    $phone = '+94779998877';
    $message = 'Confidential itinerary requirements';

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->postJson('/api/public/inquiries', validInquiryPayload([
            'full_name' => $name,
            'email' => $email,
            'phone' => $phone,
            'message' => $message,
        ]));

    $response->assertStatus(201);
    $ref = $response->json('reference');

    Log::shouldHaveReceived('info')
        ->once()
        ->withArgs(function ($msg, $context) use ($ref) {
            expect($msg)->toBe('public inquiry stored')
                ->and($context)->toBe(['reference' => $ref, 'status' => 201]);

            return true;
        });

    Log::shouldNotHaveReceived('info', function ($msg, $context = []) use ($name, $email, $phone, $message) {
        $encoded = json_encode([$msg, $context]);

        return str_contains($encoded, $name)
            || str_contains($encoded, $email)
            || str_contains($encoded, $phone)
            || str_contains($encoded, $message);
    });
});
