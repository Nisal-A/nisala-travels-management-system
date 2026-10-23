<?php

use App\Models\Destination;
use App\Models\TourPackage;
use App\Services\PublicCatalogService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['services.nisala_web.key' => 'test-valid-api-key']);
});

test('places contains only tour highlights from live tours of that country', function () {
    $thailand = Destination::create([
        'slug' => 'thailand',
        'country' => 'Thailand',
        'city_region' => 'Bangkok',
        'status' => 'active',
        'listing_state' => 'live',
    ]);

    $india = Destination::create([
        'slug' => 'india',
        'country' => 'India',
        'city_region' => 'Delhi',
        'status' => 'active',
        'listing_state' => 'live',
    ]);

    // Live tour 1 in Thailand
    TourPackage::create([
        'destination_id' => $thailand->id,
        'package_name' => 'Bangkok City Tour',
        'slug' => 'bangkok-city-tour',
        'price' => 20000,
        'highlights' => ['Grand Palace', 'Wat Pho', 'Chao Phraya River'],
        'status' => 'active',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    // Live tour 2 in Thailand with duplicate and new highlights
    TourPackage::create([
        'destination_id' => $thailand->id,
        'package_name' => 'Phuket Island Tour',
        'slug' => 'phuket-island-tour',
        'price' => 30000,
        'highlights' => ['Wat Pho', 'Phi Phi Islands', 'James Bond Island'],
        'status' => 'active',
        'is_active' => true,
        'sort_order' => 2,
    ]);

    // Draft tour in Thailand - highlights should NOT appear
    TourPackage::create([
        'destination_id' => $thailand->id,
        'package_name' => 'Draft Tour',
        'slug' => 'draft-tour',
        'price' => 25000,
        'highlights' => ['Draft Secret Spot'],
        'status' => 'draft',
        'is_active' => true,
    ]);

    // Inactive tour in Thailand - highlights should NOT appear
    TourPackage::create([
        'destination_id' => $thailand->id,
        'package_name' => 'Inactive Tour',
        'slug' => 'inactive-tour',
        'price' => 25000,
        'highlights' => ['Inactive Island'],
        'status' => 'active',
        'is_active' => false,
    ]);

    // Deleted tour in Thailand - highlights should NOT appear
    $deletedTour = TourPackage::create([
        'destination_id' => $thailand->id,
        'package_name' => 'Deleted Tour',
        'slug' => 'deleted-tour',
        'price' => 25000,
        'highlights' => ['Deleted Temple'],
        'status' => 'active',
        'is_active' => true,
    ]);
    $deletedTour->delete();

    // Live tour in India - highlights should NOT appear in Thailand's places
    TourPackage::create([
        'destination_id' => $india->id,
        'package_name' => 'Taj Mahal Tour',
        'slug' => 'taj-mahal-tour',
        'price' => 40000,
        'highlights' => ['Taj Mahal', 'Agra Fort'],
        'status' => 'active',
        'is_active' => true,
    ]);

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/destinations');

    $response->assertStatus(200);

    $destinations = collect($response->json('data'));
    $thaiDest = $destinations->firstWhere('slug', 'thailand');

    expect($thaiDest)->not->toBeNull();
    // Unique highlights in tour order, only from live tours
    expect($thaiDest['places'])->toBe([
        'Grand Palace',
        'Wat Pho',
        'Chao Phraya River',
        'Phi Phi Islands',
        'James Bond Island',
    ]);

    expect($thaiDest['places'])->not->toContain('Draft Secret Spot')
        ->and($thaiDest['places'])->not->toContain('Inactive Island')
        ->and($thaiDest['places'])->not->toContain('Deleted Temple')
        ->and($thaiDest['places'])->not->toContain('Taj Mahal')
        ->and($thaiDest['places'])->not->toContain('Agra Fort');
});

test('places is capped at maximum 12 items in tour order', function () {
    $thailand = Destination::create([
        'slug' => 'thailand-highlights',
        'country' => 'Thailand',
        'city_region' => 'Bangkok',
        'status' => 'active',
        'listing_state' => 'live',
    ]);

    $highlights1 = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8'];
    $highlights2 = ['H7', 'H8', 'H9', 'H10', 'H11', 'H12', 'H13', 'H14', 'H15'];

    TourPackage::create([
        'destination_id' => $thailand->id,
        'package_name' => 'Tour 1',
        'slug' => 'tour-1',
        'price' => 10000,
        'highlights' => $highlights1,
        'status' => 'active',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    TourPackage::create([
        'destination_id' => $thailand->id,
        'package_name' => 'Tour 2',
        'slug' => 'tour-2',
        'price' => 10000,
        'highlights' => $highlights2,
        'status' => 'active',
        'is_active' => true,
        'sort_order' => 2,
    ]);

    $service = app(PublicCatalogService::class);
    $places = $service->computePlacesForDestination($thailand);

    expect(count($places))->toBe(12)
        ->and($places)->toBe(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10', 'H11', 'H12'])
        ->and($places)->not->toContain('H13')
        ->and($places)->not->toContain('H14')
        ->and($places)->not->toContain('H15');
});

test('common_inclusions only includes items present in 2 or more tours', function () {
    $thailand = Destination::create([
        'slug' => 'thailand-inclusions',
        'country' => 'Thailand',
        'city_region' => 'Bangkok',
        'status' => 'active',
        'listing_state' => 'live',
    ]);

    // Tour 1 has internal duplicate of Daily Breakfast; should only count as 1 tour
    TourPackage::create([
        'destination_id' => $thailand->id,
        'package_name' => 'Tour 1',
        'slug' => 'tour-inc-1',
        'price' => 10000,
        'included_items' => "Daily Breakfast\nDaily Breakfast\nAirport Transfer\nEnglish Speaking Guide\nSpecial Dinner",
        'status' => 'active',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    // Tour 2 shares Daily Breakfast and English Speaking Guide
    TourPackage::create([
        'destination_id' => $thailand->id,
        'package_name' => 'Tour 2',
        'slug' => 'tour-inc-2',
        'price' => 10000,
        'included_items' => "Daily Breakfast\nEnglish Speaking Guide\nPrivate Longtail Boat",
        'status' => 'active',
        'is_active' => true,
        'sort_order' => 2,
    ]);

    // Tour 3 shares Daily Breakfast and Airport Transfer
    TourPackage::create([
        'destination_id' => $thailand->id,
        'package_name' => 'Tour 3',
        'slug' => 'tour-inc-3',
        'price' => 10000,
        'included_items' => "Daily Breakfast\nAirport Transfer\nSnorkel Mask",
        'status' => 'active',
        'is_active' => true,
        'sort_order' => 3,
    ]);

    // Draft tour shares Special Dinner; draft tour must NOT contribute to count
    TourPackage::create([
        'destination_id' => $thailand->id,
        'package_name' => 'Draft Tour',
        'slug' => 'draft-tour-inc',
        'price' => 10000,
        'included_items' => "Special Dinner\nPrivate Longtail Boat",
        'status' => 'draft',
        'is_active' => true,
    ]);

    $service = app(PublicCatalogService::class);
    $inclusions = $service->computeCommonInclusionsForDestination($thailand);

    // Common: Daily Breakfast (3 tours), Airport Transfer (2 tours), English Speaking Guide (2 tours)
    expect($inclusions)->toBe([
        'Daily Breakfast',
        'Airport Transfer',
        'English Speaking Guide',
    ]);

    // Items present in only 1 live tour must NOT appear
    expect($inclusions)->not->toContain('Special Dinner')
        ->and($inclusions)->not->toContain('Private Longtail Boat')
        ->and($inclusions)->not->toContain('Snorkel Mask');
});

test('common_inclusions is capped at maximum 8 items', function () {
    $thailand = Destination::create([
        'slug' => 'thailand-cap',
        'country' => 'Thailand',
        'city_region' => 'Bangkok',
        'status' => 'active',
        'listing_state' => 'live',
    ]);

    $items = [];
    for ($i = 1; $i <= 10; $i++) {
        $items[] = "Inclusion Item {$i}";
    }

    // Two live tours both having all 10 items
    TourPackage::create([
        'destination_id' => $thailand->id,
        'package_name' => 'Tour A',
        'slug' => 'tour-a',
        'price' => 10000,
        'included_items' => implode("\n", $items),
        'status' => 'active',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    TourPackage::create([
        'destination_id' => $thailand->id,
        'package_name' => 'Tour B',
        'slug' => 'tour-b',
        'price' => 10000,
        'included_items' => implode("\n", $items),
        'status' => 'active',
        'is_active' => true,
        'sort_order' => 2,
    ]);

    $service = app(PublicCatalogService::class);
    $inclusions = $service->computeCommonInclusionsForDestination($thailand);

    expect(count($inclusions))->toBe(8)
        ->and($inclusions)->not->toContain('Inclusion Item 9')
        ->and($inclusions)->not->toContain('Inclusion Item 10');
});

test('coming_soon destinations have tour_count 0, empty places, and empty common_inclusions', function () {
    $comingSoon = Destination::create([
        'slug' => 'sri-lanka-coming',
        'country' => 'Sri Lanka',
        'city_region' => 'Colombo',
        'status' => 'active',
        'listing_state' => 'coming_soon',
        'recommendations' => [
            '[CONFIRM] Clothing advice for temple visits',
            '[CONFIRM] Train ticket reservation guide',
        ],
    ]);

    // Even if a tour is attached to it in the DB
    TourPackage::create([
        'destination_id' => $comingSoon->id,
        'package_name' => 'Sri Lanka Package',
        'slug' => 'sl-package',
        'price' => 50000,
        'highlights' => ['Sigiriya Rock Fortress'],
        'included_items' => "Daily Breakfast\nChauffeur Guide",
        'status' => 'active',
        'is_active' => true,
    ]);

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/destinations');

    $response->assertStatus(200);

    $dest = collect($response->json('data'))->firstWhere('slug', 'sri-lanka-coming');

    expect($dest)->not->toBeNull();
    expect($dest['listing_state'])->toBe('coming_soon');
    expect($dest['tour_count'])->toBe(0);
    expect($dest['places'])->toBe([]);
    expect($dest['common_inclusions'])->toBe([]);
    expect($dest['recommendations'])->toBe([
        '[CONFIRM] Clothing advice for temple visits',
        '[CONFIRM] Train ticket reservation guide',
    ]);
});

test('hidden destinations are absent from public response', function () {
    $liveDest = Destination::create([
        'slug' => 'live-destination',
        'country' => 'Thailand',
        'city_region' => 'Bangkok',
        'status' => 'active',
        'listing_state' => 'live',
    ]);

    $comingSoonDest = Destination::create([
        'slug' => 'coming-soon-destination',
        'country' => 'Maldives',
        'city_region' => 'Male',
        'status' => 'active',
        'listing_state' => 'coming_soon',
    ]);

    $hiddenDest = Destination::create([
        'slug' => 'hidden-destination',
        'country' => 'Secret Country',
        'city_region' => 'Hidden City',
        'status' => 'active',
        'listing_state' => 'hidden',
    ]);

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/destinations');

    $response->assertStatus(200);

    $slugs = collect($response->json('data'))->pluck('slug')->all();

    expect($slugs)->toContain('live-destination')
        ->and($slugs)->toContain('coming-soon-destination')
        ->and($slugs)->not->toContain('hidden-destination');
});

test('public responses must not include booking, customer, traveller, document, or payment fields', function () {
    $dest = Destination::create([
        'slug' => 'thailand-public-check',
        'country' => 'Thailand',
        'city_region' => 'Bangkok',
        'tagline' => 'Amazing Thailand',
        'description' => 'Explore the kingdom',
        'best_months' => 'Nov-Feb',
        'status' => 'active',
        'listing_state' => 'live',
        'recommendations' => ['[CONFIRM] Great tips'],
    ]);

    TourPackage::create([
        'destination_id' => $dest->id,
        'package_name' => 'Bangkok Explorer',
        'slug' => 'bangkok-public-check',
        'price' => 20000,
        'highlights' => ['Grand Palace'],
        'included_items' => "Breakfast\nGuide",
        'status' => 'active',
        'is_active' => true,
    ]);

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/destinations');

    $response->assertStatus(200);

    $item = collect($response->json('data'))->firstWhere('slug', 'thailand-public-check');

    $expectedKeys = [
        'slug',
        'name',
        'country',
        'listing_state',
        'tagline',
        'overview',
        'hero_image_url',
        'gallery',
        'tour_count',
        'places',
        'common_inclusions',
        'recommendations',
        'best_months',
    ];

    expect(array_keys($item))->toBe($expectedKeys);

    $forbiddenFields = [
        'booking',
        'bookings',
        'booking_id',
        'customer',
        'customers',
        'customer_id',
        'traveller',
        'travellers',
        'traveller_id',
        'document',
        'documents',
        'document_id',
        'payment',
        'payments',
        'payment_id',
        'status',
        'created_at',
        'updated_at',
        'deleted_at',
        'id',
    ];

    foreach ($forbiddenFields as $field) {
        expect(array_key_exists($field, $item))->toBeFalse("Forbidden field {$field} found in public destination response");
    }
});

test('saving a tour package invalidates destination catalog cache', function () {
    $thailand = Destination::create([
        'slug' => 'thailand-cache-check',
        'country' => 'Thailand',
        'city_region' => 'Bangkok',
        'status' => 'active',
        'listing_state' => 'live',
    ]);

    $tour = TourPackage::create([
        'destination_id' => $thailand->id,
        'package_name' => 'Tour Initial',
        'slug' => 'tour-initial',
        'price' => 15000,
        'highlights' => ['Initial Highlight'],
        'status' => 'active',
        'is_active' => true,
    ]);

    // Initial fetch caches destinations
    $response1 = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/destinations');
    $response1->assertStatus(200);

    $item1 = collect($response1->json('data'))->firstWhere('slug', 'thailand-cache-check');
    expect($item1['places'])->toBe(['Initial Highlight']);

    // Update tour highlights
    $tour->update([
        'highlights' => ['Initial Highlight', 'Newly Added Highlight'],
    ]);

    // Second fetch should reflect updated places because tour observer cleared destinations cache
    $response2 = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/destinations');
    $response2->assertStatus(200);

    $item2 = collect($response2->json('data'))->firstWhere('slug', 'thailand-cache-check');
    expect($item2['places'])->toBe(['Initial Highlight', 'Newly Added Highlight']);
});
