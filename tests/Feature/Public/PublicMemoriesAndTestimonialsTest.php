<?php

use App\Services\PublicCatalogService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['services.nisala_web.key' => 'test-valid-api-key']);
    PublicCatalogService::setMemoriesForTesting(null);
    PublicCatalogService::setTestimonialsForTesting(null);
});

afterEach(function () {
    PublicCatalogService::setMemoriesForTesting(null);
    PublicCatalogService::setTestimonialsForTesting(null);
});

/* =========================================================================
 * 1. GET /api/public/memories Tests
 * ========================================================================= */

test('get api public memories with no key returns 401', function () {
    $response = $this->getJson('/api/public/memories');

    $response->assertStatus(401)
        ->assertJson(['message' => 'Unauthorized']);
});

test('get api public memories with invalid key returns 401', function () {
    $response = $this->withHeader('X-Nisala-Key', 'invalid-key')
        ->getJson('/api/public/memories');

    $response->assertStatus(401)
        ->assertJson(['message' => 'Unauthorized']);
});

test('get api public memories with valid key returns 200', function () {
    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/memories');

    $response->assertStatus(200);
});

test('get api public memories returns only published years with consent_confirmed_at set, newest first', function () {
    $customData = [
        [
            'year' => 2026,
            'title' => 'Future Tour 2026',
            'destination_name' => 'Thailand',
            'summary' => 'Highlights from 2026',
            'published' => true,
            'consent_confirmed_at' => '2026-01-01 10:00:00',
            'media' => [
                [
                    'type' => 'image',
                    'url' => 'https://example.com/2026.jpg',
                    'alt_text' => '2026 Photo',
                    'caption' => '2026 Caption',
                    'poster_url' => null,
                    'external_url' => null,
                ],
            ],
        ],
        [
            'year' => 2025,
            'title' => 'Year 2025 Tour',
            'destination_name' => 'Sri Lanka',
            'summary' => 'Highlights from 2025',
            'published' => true,
            'consent_confirmed_at' => '2025-01-01 10:00:00',
            'media' => [],
        ],
        [
            'year' => 2024,
            'title' => 'Unpublished 2024',
            'destination_name' => 'India',
            'summary' => 'Unpublished summary',
            'published' => false, // unpublished: must NOT be returned
            'consent_confirmed_at' => '2024-01-01 10:00:00',
            'media' => [],
        ],
        [
            'year' => 2023,
            'title' => 'Unconsented 2023',
            'destination_name' => 'Maldives',
            'summary' => 'Unconsented summary',
            'published' => true,
            'consent_confirmed_at' => null, // null consent: must NOT be returned
            'media' => [],
        ],
    ];

    PublicCatalogService::setMemoriesForTesting($customData);

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/memories');

    $response->assertStatus(200);
    $data = $response->json('data');

    // Exactly 2 items returned: 2026 and 2025
    expect(count($data))->toBe(2);

    // Newest first
    expect($data[0]['year'])->toBe(2026)
        ->and($data[1]['year'])->toBe(2025);

    // Ensure 2024 (unpublished) and 2023 (unconsented) are absent
    $years = array_column($data, 'year');
    expect($years)->not->toContain(2024)
        ->and($years)->not->toContain(2023);
});

test('get api public memories includes required fields and never returns consent or internal fields', function () {
    $customData = [
        [
            'id' => 999,
            'year' => 2025,
            'title' => 'Sacred Summits & Southern Lagoons',
            'destination_name' => 'Sri Lanka & Maldives',
            'summary' => 'A wonderful expedition.',
            'published' => true,
            'consent_confirmed_at' => '2025-01-15 10:00:00',
            'privacy_consent' => true,
            'created_at' => '2025-01-15 09:00:00',
            'updated_at' => '2025-01-15 10:00:00',
            'deleted_at' => null,
            'media' => [
                [
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=sample',
                    'alt_text' => 'Highland Expedition Highlights',
                    'caption' => 'Scenic mountain pass video',
                    'poster_url' => 'https://example.com/poster.jpg',
                    'external_url' => 'https://www.youtube.com/watch?v=sample',
                ],
            ],
        ],
    ];

    PublicCatalogService::setMemoriesForTesting($customData);

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/memories');

    $response->assertStatus(200);
    $item = $response->json('data.0');

    // Required fields present
    expect($item)->toHaveKeys([
        'year',
        'title',
        'summary',
        'destination_name',
        'media',
    ]);

    expect($item['year'])->toBe(2025)
        ->and($item['title'])->toBe('Sacred Summits & Southern Lagoons')
        ->and($item['summary'])->toBe('A wonderful expedition.')
        ->and($item['destination_name'])->toBe('Sri Lanka & Maldives');

    // Media fields
    $mediaItem = $item['media'][0];
    expect($mediaItem)->toHaveKeys([
        'type',
        'url',
        'alt_text',
        'caption',
        'poster_url',
        'external_url',
    ]);
    expect($mediaItem['type'])->toBe('video')
        ->and($mediaItem['poster_url'])->toBe('https://example.com/poster.jpg')
        ->and($mediaItem['external_url'])->toBe('https://www.youtube.com/watch?v=sample');

    // Consent and internal fields MUST NOT be present
    expect($item)->not->toHaveKey('id')
        ->and($item)->not->toHaveKey('published')
        ->and($item)->not->toHaveKey('consent_confirmed_at')
        ->and($item)->not->toHaveKey('privacy_consent')
        ->and($item)->not->toHaveKey('created_at')
        ->and($item)->not->toHaveKey('updated_at')
        ->and($item)->not->toHaveKey('deleted_at');
});

/* =========================================================================
 * 2. GET /api/public/testimonials Tests
 * ========================================================================= */

test('get api public testimonials with no key returns 401', function () {
    $response = $this->getJson('/api/public/testimonials');

    $response->assertStatus(401)
        ->assertJson(['message' => 'Unauthorized']);
});

test('get api public testimonials with invalid key returns 401', function () {
    $response = $this->withHeader('X-Nisala-Key', 'invalid-key')
        ->getJson('/api/public/testimonials');

    $response->assertStatus(401)
        ->assertJson(['message' => 'Unauthorized']);
});

test('get api public testimonials with valid key returns 200', function () {
    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/testimonials');

    $response->assertStatus(200);
});

test('get api public testimonials returns only published items with consent_confirmed_at set', function () {
    $customData = [
        [
            'display_name' => 'Dr. Aruni Perera',
            'trip_title' => 'Central Highlands & Cultural Sanctuaries',
            'quote' => 'An extraordinary, spiritually enriching expedition.',
            'tour_year' => 2025,
            'photo_url' => 'https://example.com/aruni.jpg',
            'rating' => 5,
            'published' => true,
            'consent_confirmed_at' => '2025-02-01 12:00:00',
        ],
        [
            'display_name' => 'Marcus & Elena Vance',
            'trip_title' => 'Tea Trails & Southern Coast Retreat',
            'quote' => 'The private chauffeur-guide was exceptionally attentive.',
            'tour_year' => 2024,
            'photo_url' => 'https://example.com/marcus.jpg',
            'rating' => 5,
            'published' => true,
            'consent_confirmed_at' => '2024-03-15 09:30:00',
        ],
        [
            'display_name' => 'Unpublished Guest',
            'trip_title' => 'Draft Journey',
            'quote' => 'Unpublished review text.',
            'tour_year' => 2024,
            'photo_url' => null,
            'rating' => 4,
            'published' => false, // unpublished: must NOT be returned
            'consent_confirmed_at' => '2024-04-01 10:00:00',
        ],
        [
            'display_name' => 'Unconsented Traveler',
            'trip_title' => 'Pending Journey',
            'quote' => 'Unconsented review text.',
            'tour_year' => 2025,
            'photo_url' => null,
            'rating' => 5,
            'published' => true,
            'consent_confirmed_at' => null, // null consent: must NOT be returned
        ],
    ];

    PublicCatalogService::setTestimonialsForTesting($customData);

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/testimonials');

    $response->assertStatus(200);
    $data = $response->json('data');

    // Exactly 2 items returned
    expect(count($data))->toBe(2);

    $names = array_column($data, 'display_name');
    expect($names)->toContain('Dr. Aruni Perera')
        ->and($names)->toContain('Marcus & Elena Vance')
        ->and($names)->not->toContain('Unpublished Guest')
        ->and($names)->not->toContain('Unconsented Traveler');
});

test('get api public testimonials returns display_name, trip_title, quote, tour_year, photo_url and NO rating or consent fields', function () {
    $customData = [
        [
            'id' => 123,
            'display_name' => 'Dr. Aruni Perera',
            'trip_title' => 'Central Highlands & Cultural Sanctuaries',
            'quote' => 'An extraordinary expedition.',
            'tour_year' => 2025,
            'photo_url' => 'https://example.com/aruni.jpg',
            'rating' => 5,
            'published' => true,
            'consent_confirmed_at' => '2025-02-01 12:00:00',
            'created_at' => '2025-02-01 12:00:00',
            'updated_at' => '2025-02-01 12:00:00',
        ],
    ];

    PublicCatalogService::setTestimonialsForTesting($customData);

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/testimonials');

    $response->assertStatus(200);
    $item = $response->json('data.0');

    // Verify fields
    expect($item)->toHaveKeys([
        'display_name',
        'trip_title',
        'quote',
        'tour_year',
        'photo_url',
    ]);

    expect($item['display_name'])->toBe('Dr. Aruni Perera')
        ->and($item['trip_title'])->toBe('Central Highlands & Cultural Sanctuaries')
        ->and($item['quote'])->toBe('An extraordinary expedition.')
        ->and($item['tour_year'])->toBe(2025)
        ->and($item['photo_url'])->toBe('https://example.com/aruni.jpg');

    // Verify NO rating field
    expect($item)->not->toHaveKey('rating');

    // Verify NO consent or internal fields
    expect($item)->not->toHaveKey('id')
        ->and($item)->not->toHaveKey('published')
        ->and($item)->not->toHaveKey('consent_confirmed_at')
        ->and($item)->not->toHaveKey('created_at')
        ->and($item)->not->toHaveKey('updated_at');
});
