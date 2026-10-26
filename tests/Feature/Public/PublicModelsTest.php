<?php

use App\Models\Destination;
use App\Models\Inquiry;
use App\Models\TourPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

test('Destination::published() excludes status other than active and excludes soft-deleted rows', function () {
    $active = Destination::create([
        'country' => 'Thailand',
        'city_region' => 'Bangkok',
        'status' => 'active',
        'slug' => 'bangkok',
    ]);

    $inactive = Destination::create([
        'country' => 'Thailand',
        'city_region' => 'Chiang Mai',
        'status' => 'inactive',
        'slug' => 'chiang-mai',
    ]);

    $draft = Destination::create([
        'country' => 'Thailand',
        'city_region' => 'Phuket',
        'status' => 'draft',
        'slug' => 'phuket',
    ]);

    $softDeleted = Destination::create([
        'country' => 'Thailand',
        'city_region' => 'Krabi',
        'status' => 'active',
        'slug' => 'krabi',
    ]);
    $softDeleted->delete();

    $published = Destination::published()->get();

    expect($published->pluck('id')->all())->toBe([$active->id])
        ->and($published->contains('id', $inactive->id))->toBeFalse()
        ->and($published->contains('id', $draft->id))->toBeFalse()
        ->and($published->contains('id', $softDeleted->id))->toBeFalse();
});

test('TourPackage::published() excludes is_active false and status other than active', function () {
    $destination = Destination::create([
        'country' => 'Thailand',
        'city_region' => 'Bangkok',
        'status' => 'active',
        'slug' => 'bangkok-pkg-dest',
    ]);

    $publishedPkg = TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Bangkok Explorer',
        'price' => 15000,
        'status' => 'active',
        'is_active' => true,
    ]);

    $inactiveIsActivePkg = TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Hidden Bangkok',
        'price' => 12000,
        'status' => 'active',
        'is_active' => false,
    ]);

    $inactiveStatusPkg = TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Bangkok Ancient',
        'price' => 18000,
        'status' => 'inactive',
        'is_active' => true,
    ]);

    $draftPkg = TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Bangkok Draft',
        'price' => 20000,
        'status' => 'draft',
        'is_active' => true,
    ]);

    $published = TourPackage::published()->get();

    expect($published->pluck('id')->all())->toBe([$publishedPkg->id])
        ->and($published->contains('id', $inactiveIsActivePkg->id))->toBeFalse()
        ->and($published->contains('id', $inactiveStatusPkg->id))->toBeFalse()
        ->and($published->contains('id', $draftPkg->id))->toBeFalse();

    // Verify Destination::publicTourCount()
    expect($destination->publicTourCount())->toBe(1);
});

test('Inquiry::generateReference() matches NT- followed by 8 uppercase alphanumeric characters and 50 calls are unique', function () {
    $ref = Inquiry::generateReference();
    expect($ref)->toMatch('/^NT-[A-Z0-9]{8}$/');

    $references = [];
    for ($i = 0; $i < 50; $i++) {
        $references[] = Inquiry::generateReference();
    }

    expect(count($references))->toBe(50)
        ->and(count(array_unique($references)))->toBe(50);

    foreach ($references as $r) {
        expect($r)->toMatch('/^NT-[A-Z0-9]{8}$/');
    }
});

test('schema check: the new columns exist on destinations, tour_packages, and inquiries', function () {
    $destinationColumns = [
        'slug',
        'region',
        'tagline',
        'best_months',
        'facts',
        'highlights',
        'hero_image',
        'gallery',
        'sort_order',
        'recommendations',
    ];

    foreach ($destinationColumns as $col) {
        expect(Schema::hasColumn('destinations', $col))
            ->toBeTrue("Column {$col} missing on destinations table");
    }

    $tourPackageColumns = [
        'slug',
        'duration_nights',
        'group_min',
        'itinerary',
        'highlights',
        'tags',
        'departure_months',
        'faqs',
        'sort_order',
    ];

    foreach ($tourPackageColumns as $col) {
        expect(Schema::hasColumn('tour_packages', $col))
            ->toBeTrue("Column {$col} missing on tour_packages table");
    }

    $inquiryColumns = [
        'reference',
        'interest',
        'tour_package_id',
        'destination_id',
        'email',
        'phone',
        'preferred_contact',
        'country',
        'start_date',
        'end_date',
        'flexible_dates',
        'adults',
        'children',
        'child_ages',
        'budget_range',
        'referral_source',
        'privacy_consent_at',
        'marketing_consent_at',
        'ip_hash',
        'user_agent',
        'submitted_at',
    ];

    foreach ($inquiryColumns as $col) {
        expect(Schema::hasColumn('inquiries', $col))
            ->toBeTrue("Column {$col} missing on inquiries table");
    }
});

test('Destination::publicListed() excludes coming_soon and hidden destinations as well as inactive', function () {
    $liveActive = Destination::create([
        'country' => 'Thailand',
        'city_region' => 'Bangkok',
        'status' => 'active',
        'listing_state' => 'live',
        'slug' => 'bangkok-live',
    ]);

    $comingSoonActive = Destination::create([
        'country' => 'Maldives',
        'city_region' => 'Male',
        'status' => 'active',
        'listing_state' => 'coming_soon',
        'slug' => 'male-coming-soon',
    ]);

    $hiddenActive = Destination::create([
        'country' => 'India',
        'city_region' => 'Delhi',
        'status' => 'active',
        'listing_state' => 'hidden',
        'slug' => 'delhi-hidden',
    ]);

    $liveInactive = Destination::create([
        'country' => 'Thailand',
        'city_region' => 'Phuket',
        'status' => 'inactive',
        'listing_state' => 'live',
        'slug' => 'phuket-inactive',
    ]);

    $liveSoftDeleted = Destination::create([
        'country' => 'Thailand',
        'city_region' => 'Chiang Mai',
        'status' => 'active',
        'listing_state' => 'live',
        'slug' => 'chiang-mai-deleted',
    ]);
    $liveSoftDeleted->delete();

    $listed = Destination::publicListed()->get();

    expect($listed->pluck('id')->all())->toBe([$liveActive->id])
        ->and($listed->contains('id', $comingSoonActive->id))->toBeFalse()
        ->and($listed->contains('id', $hiddenActive->id))->toBeFalse()
        ->and($listed->contains('id', $liveInactive->id))->toBeFalse()
        ->and($listed->contains('id', $liveSoftDeleted->id))->toBeFalse();
});

test('Destination model rejects invalid listing_state', function () {
    expect(function () {
        Destination::create([
            'country' => 'Test',
            'city_region' => 'Test',
            'status' => 'active',
            'listing_state' => 'invalid_state',
            'slug' => 'invalid-dest',
        ]);
    })->toThrow(\InvalidArgumentException::class);
});

test('Maldives listing_state is coming_soon after seeding and no Sri Lanka data exists', function () {
    $this->seed(\Database\Seeders\PublicContentSeeder::class);

    $sriLanka = Destination::where('slug', 'sri-lanka')->first();
    expect($sriLanka)->toBeNull();

    $thailand = Destination::where('slug', 'thailand')->first();
    expect($thailand->listing_state)->toBe('live');

    $india = Destination::where('slug', 'india')->first();
    expect($india->listing_state)->toBe('live');

    $maldives = Destination::where('slug', 'maldives')->first();
    expect($maldives)->not->toBeNull();
    expect($maldives->listing_state)->toBe('coming_soon');
    expect($maldives->status)->toBe('coming_soon');

    expect($thailand->recommendations)->toBe([
        'Dress modestly at temples: cover your shoulders and knees, and take off your shoes before entering temple buildings.',
        'Carry some Thai baht for markets and small shops, and use cards at hotels and larger shops.',
        'Show respect for the royal family, and don\'t post disrespectful comments or photos about them.',
        'Book island boat tours and sunset cruises early during the busy months, November to April.',
        'Pack sun protection and a light rain jacket, since weather can change quickly in the monsoon months.',
    ]);

    expect($india->recommendations)->toBe([
        'Check health advice and vaccination requirements before you go, and carry a basic first-aid kit with any personal medicine.',
        'Drink only sealed bottled water, and be careful with street food in the first days.',
        'Dress modestly at temples and religious sites, and remove your shoes where asked.',
        'Keep valuables secure in busy markets and on crowded trains.',
        'Travel with a company guide for long drives and temple visits, and allow extra time for road journeys.',
    ]);

    expect($maldives->recommendations)->toBe([
        'Resort islands allow swimwear. Local islands require modest clothing, so plan your outfits for each part of the trip.',
        'Alcohol is sold only at resorts and on some islands, so check the rules before you travel.',
        'Use reef-safe sunscreen, and don\'t touch or stand on coral.',
        'Book water activities with certified operators, and check sea conditions before each trip.',
        'Plan transfers in advance, since many islands are reached by speedboat or seaplane.',
    ]);

    // Verify no tours exist for Maldives
    $maldivesTours = TourPackage::where('destination_id', $maldives->id)->get();
    expect($maldivesTours->count())->toBe(0);
});

test('config/tour_tiers.php structure and rules', function () {
    $tiers = config('tour_tiers.tiers');
    expect($tiers)->toHaveKeys(['semi_luxury', 'luxury', 'premium']);
    expect($tiers['semi_luxury']['label'])->toBe('Semi Luxury');
    expect($tiers['luxury']['label'])->toBe('Luxury');
    expect($tiers['premium']['label'])->toBe('Premium');

    $allowed = config('tour_tiers.allowed_by_destination');
    expect($allowed['thailand'])->toBe(['semi_luxury', 'luxury', 'premium']);
    expect($allowed['india'])->toBe(['semi_luxury', 'luxury']);
    expect(array_key_exists('sri-lanka', $allowed))->toBeFalse();

    $groupSizes = config('tour_tiers.suggested_group_size');
    expect($groupSizes['india']['semi_luxury'])->toBe([30, 40]);
    expect($groupSizes['india']['luxury'])->toBe([10, 15]);
});
