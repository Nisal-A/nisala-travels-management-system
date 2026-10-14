 <?php

use App\Models\Destination;
use App\Models\TourPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['services.nisala_web.key' => 'test-valid-api-key']);
});

test('only published tours and destinations are returned, excluding inactive, draft, and soft-deleted', function () {
    $destination = Destination::create([
        'slug' => 'sri-lanka',
        'country' => 'Sri Lanka',
        'city_region' => 'Colombo',
        'status' => 'active',
    ]);

    $inactiveDest = Destination::create([
        'slug' => 'maldives',
        'country' => 'Maldives',
        'city_region' => 'Male',
        'status' => 'inactive',
    ]);

    $draftDest = Destination::create([
        'slug' => 'bhutan',
        'country' => 'Bhutan',
        'city_region' => 'Thimphu',
        'status' => 'draft',
    ]);

    $deletedDest = Destination::create([
        'slug' => 'nepal',
        'country' => 'Nepal',
        'city_region' => 'Kathmandu',
        'status' => 'active',
    ]);
    $deletedDest->delete();

    $publishedTour = TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Active Tour',
        'slug' => 'active-tour',
        'price' => 10000,
        'status' => 'active',
        'is_active' => true,
    ]);

    $inactiveTour = TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Inactive Tour',
        'slug' => 'inactive-tour',
        'price' => 10000,
        'status' => 'active',
        'is_active' => false,
    ]);

    $draftTour = TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Draft Tour',
        'slug' => 'draft-tour',
        'price' => 10000,
        'status' => 'draft',
        'is_active' => true,
    ]);

    $deletedTour = TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Deleted Tour',
        'slug' => 'deleted-tour',
        'price' => 10000,
        'status' => 'active',
        'is_active' => true,
    ]);
    $deletedTour->delete();

    // Verify tours endpoint
    $tourResponse = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/tours');

    $tourResponse->assertStatus(200);
    $tourSlugs = collect($tourResponse->json('data'))->pluck('slug')->all();
    expect($tourSlugs)->toBe(['active-tour'])
        ->and($tourSlugs)->not->toContain('inactive-tour')
        ->and($tourSlugs)->not->toContain('draft-tour')
        ->and($tourSlugs)->not->toContain('deleted-tour');

    // Verify destinations endpoint
    $destResponse = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/destinations');

    $destResponse->assertStatus(200);
    $destSlugs = collect($destResponse->json('data'))->pluck('slug')->all();
    expect($destSlugs)->toBe(['sri-lanka'])
        ->and($destSlugs)->not->toContain('maldives')
        ->and($destSlugs)->not->toContain('bhutan')
        ->and($destSlugs)->not->toContain('nepal');
});

test('the keys of each response object match the whitelist exactly and forbidden fields are absent', function () {
    $destination = Destination::create([
        'slug' => 'thailand',
        'country' => 'Thailand',
        'city_region' => 'Bangkok',
        'region' => 'southeast-asia',
        'tagline' => 'City of Angels',
        'description' => 'A wonderful capital city.',
        'travel_information' => 'Visa required for some.',
        'best_months' => 'Nov to Feb',
        'facts' => [['label' => 'Time', 'value' => 'UTC+7']],
        'highlights' => ['Temples', 'Food'],
        'hero_image' => 'https://images.example.com/bangkok.jpg',
        'gallery' => ['https://images.example.com/bkk-1.jpg'],
        'status' => 'active',
        'sort_order' => 1,
    ]);

    $tour = TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Bangkok Explorer',
        'slug' => 'bangkok-explorer',
        'short_description' => 'Explore the city.',
        'description' => 'A detailed tour overview.',
        'duration_days' => 5,
        'duration_nights' => 4,
        'price' => 120000,
        'price_from' => 110000,
        'currency' => 'LKR',
        'hero_image' => 'https://images.example.com/tour.jpg',
        'tags' => ['City', 'Culture'],
        'is_featured' => true,
        'hotel_information' => '4-star hotel in city center',
        'included_items' => "Breakfast\nAirport transfer\nGuide",
        'excluded_items' => "Flight\nPersonal expenses",
        'highlights' => ['Wat Arun', 'Grand Palace'],
        'itinerary' => [['day' => 1, 'title' => 'Arrival', 'description' => 'Welcome']],
        'group_min' => 2,
        'capacity' => 10,
        'departure_months' => ['Nov', 'Dec'],
        'gallery' => ['https://images.example.com/tour-1.jpg'],
        'faqs' => [['question' => 'Q?', 'answer' => 'A!']],
        'status' => 'active',
        'is_active' => true,
    ]);

    $forbiddenFields = [
        'status',
        'is_active',
        'sort_order',
        'available_seats',
        'terms',
        'notes',
        'created_at',
        'updated_at',
        'deleted_at',
        'created_by',
    ];

    // 1. Tour List Item Whitelist Check
    $listResponse = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/tours');
    $listResponse->assertStatus(200);

    $tourListItem = $listResponse->json('data.0');
    $expectedTourListKeys = [
        'slug',
        'title',
        'summary',
        'destination',
        'duration_days',
        'duration_nights',
        'price',
        'price_from_label',
        'currency',
        'hero_image_url',
        'tags',
        'featured',
    ];

    expect(array_keys($tourListItem))->toBe($expectedTourListKeys);
    expect(array_keys($tourListItem['destination']))->toBe(['slug', 'name', 'country']);

    foreach ($forbiddenFields as $field) {
        expect(array_key_exists($field, $tourListItem))->toBeFalse("Forbidden field {$field} found in tour list item");
    }

    // 2. Tour Detail Item Whitelist Check
    $detailResponse = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/tours/bangkok-explorer');
    $detailResponse->assertStatus(200);

    $tourDetailItem = $detailResponse->json('data');
    $expectedTourDetailKeys = [
        'slug',
        'title',
        'summary',
        'destination',
        'duration_days',
        'duration_nights',
        'price',
        'price_from_label',
        'currency',
        'hero_image_url',
        'tags',
        'featured',
        'overview',
        'accommodation',
        'included',
        'excluded',
        'highlights',
        'itinerary',
        'group_min',
        'group_max',
        'departure_months',
        'gallery',
        'faqs',
    ];

    expect(array_keys($tourDetailItem))->toBe($expectedTourDetailKeys);
    expect(array_keys($tourDetailItem['destination']))->toBe(['slug', 'name', 'country']);

    foreach ($forbiddenFields as $field) {
        expect(array_key_exists($field, $tourDetailItem))->toBeFalse("Forbidden field {$field} found in tour detail item");
    }

    // 3. Destination List Item Whitelist Check
    $destListResponse = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/destinations');
    $destListResponse->assertStatus(200);

    $destListItem = $destListResponse->json('data.0');
    $expectedDestKeys = [
        'slug',
        'name',
        'country',
        'region',
        'tagline',
        'overview',
        'travel_information',
        'best_months',
        'facts',
        'highlights',
        'hero_image_url',
        'gallery',
        'tour_count',
    ];

    expect(array_keys($destListItem))->toBe($expectedDestKeys);

    foreach ($forbiddenFields as $field) {
        expect(array_key_exists($field, $destListItem))->toBeFalse("Forbidden field {$field} found in destination item");
    }
});

test('a numeric ID returns 404 on /tours/{id}', function () {
    $destination = Destination::create([
        'slug' => 'india',
        'country' => 'India',
        'city_region' => 'Delhi',
        'status' => 'active',
    ]);

    $tour = TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Delhi Heritage',
        'slug' => 'delhi-heritage',
        'price' => 50000,
        'status' => 'active',
        'is_active' => true,
    ]);

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson("/api/public/tours/{$tour->id}");

    $response->assertStatus(404);
});

test('an unknown slug returns 404', function () {
    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/tours/non-existent-tour-slug');

    $response->assertStatus(404);
});

test('included and excluded are arrays of strings', function () {
    $destination = Destination::create([
        'slug' => 'sri-lanka-2',
        'country' => 'Sri Lanka',
        'city_region' => 'Galle',
        'status' => 'active',
    ]);

    TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Galle Fort Tour',
        'slug' => 'galle-fort-tour',
        'price' => 30000,
        'included_items' => "  Hotel accommodation  \n\nDaily breakfast\n  Guide fees\n",
        'excluded_items' => "International airfare\n\nTips and gratuities  \n",
        'status' => 'active',
        'is_active' => true,
    ]);

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/tours/galle-fort-tour');

    $response->assertStatus(200);

    $included = $response->json('data.included');
    $excluded = $response->json('data.excluded');

    expect($included)->toBe(['Hotel accommodation', 'Daily breakfast', 'Guide fees'])
        ->and($excluded)->toBe(['International airfare', 'Tips and gratuities']);
});

test('image URLs are absolute', function () {
    $destination = Destination::create([
        'slug' => 'sri-lanka-3',
        'country' => 'Sri Lanka',
        'city_region' => 'Kandy',
        'hero_image' => 'tours/hero.jpg',
        'gallery' => ['tours/gallery1.jpg', 'https://cdn.example.com/photo.jpg'],
        'status' => 'active',
    ]);

    TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Kandy Tour',
        'slug' => 'kandy-tour',
        'price' => 40000,
        'hero_image' => 'tours/kandy-hero.jpg',
        'gallery' => ['tours/g1.jpg', 'https://cdn.example.com/ext.jpg'],
        'status' => 'active',
        'is_active' => true,
    ]);

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/tours/kandy-tour');

    $response->assertStatus(200);

    $heroUrl = $response->json('data.hero_image_url');
    expect($heroUrl)->toMatch('/^https?:\/\//');

    $gallery = $response->json('data.gallery');
    foreach ($gallery as $imgUrl) {
        expect($imgUrl)->toMatch('/^https?:\/\//');
    }
});

test('after a tour is saved, the next GET /api/public/tours returns the updated title', function () {
    $destination = Destination::create([
        'slug' => 'sri-lanka-cache-test',
        'country' => 'Sri Lanka',
        'city_region' => 'Negombo',
        'status' => 'active',
    ]);

    $tour = TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Original Title',
        'slug' => 'cache-test-tour',
        'price' => 25000,
        'status' => 'active',
        'is_active' => true,
    ]);

    // Initial request populates cache
    $firstResponse = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/tours');
    $firstResponse->assertStatus(200);
    expect($firstResponse->json('data.0.title'))->toBe('Original Title');

    // Update tour title
    $tour->update(['package_name' => 'Updated Title']);

    // Next request should return updated title
    $secondResponse = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/tours');
    $secondResponse->assertStatus(200);
    expect($secondResponse->json('data.0.title'))->toBe('Updated Title');
});
