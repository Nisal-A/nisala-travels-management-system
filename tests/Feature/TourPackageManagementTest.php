<?php

use App\Enums\UserRole;
use App\Models\Destination;
use App\Models\TourPackage;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => UserRole::SuperAdmin->value, 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => UserRole::Manager->value, 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => UserRole::Staff->value, 'guard_name' => 'web']);

    $this->manager = User::factory()->create();
    $this->manager->assignRole(UserRole::Manager->value);

    $this->staff = User::factory()->create();
    $this->staff->assignRole(UserRole::Staff->value);

    Storage::fake('public');
});

test('manager and staff can create a tour package with full data and uploads stored on public disk', function () {
    $destination = Destination::factory()->create([
        'country' => 'Thailand',
        'city_region' => 'Bangkok & Phuket',
        'slug' => 'thailand',
    ]);

    $heroFile = UploadedFile::fake()->image('tour_hero.jpg', 1200, 800);
    $galleryFile1 = UploadedFile::fake()->image('gallery1.webp', 800, 600);
    $galleryFile2 = UploadedFile::fake()->image('gallery2.jpg', 800, 600);

    $payload = [
        'destination_id' => $destination->id,
        'package_name' => 'Thailand Island & Culture Escape',
        'slug' => 'thailand-island-escape',
        'status' => 'active',
        'is_active' => true,
        'is_featured' => true,
        'sort_order' => 1,

        'price' => 280000,
        'price_from' => 250000,
        'currency' => 'LKR',
        'capacity' => 14,
        'available_seats' => 10,
        'group_min' => 2,
        'group_max' => 14,

        'tier' => 'luxury',

        'duration_days' => 8,
        'duration_nights' => 7,
        'start_date' => '2026-11-01',
        'end_date' => '2026-11-08',
        'departure_months' => ['Nov', 'Dec', 'Jan'],

        'short_description' => 'From bustling Bangkok to pristine Phuket beaches.',
        'description' => 'The ultimate Thai getaway experience combining urban charm with turquoise waters.',
        'highlights' => ['Grand Palace tour', 'Phi Phi speedboat', 'Night street food tour'],
        'itinerary' => [
            ['day' => 1, 'title' => 'Arrival in Bangkok', 'description' => 'Airport pickup and river cruise.'],
            ['day' => 2, 'title' => 'Bangkok Temples', 'description' => 'Visit Grand Palace and Wat Pho.'],
        ],
        'included_items' => "7 nights hotel\nDomestic flights\nDaily breakfast",
        'excluded_items' => "International flights\nNational park fees",
        'hotel_information' => '5-star riverside and beachfront hotels',
        'transportation_information' => 'Private air-conditioned vehicle and speedboats',
        'meals' => 'Daily buffet breakfast and selected dinners',
        'terms' => 'Free cancellation up to 30 days before departure.',
        'tags' => ['Beaches', 'Culture', 'Islands'],
        'faqs' => [
            ['question' => 'Do I need a visa for Thailand?', 'answer' => 'Visa on Arrival is available for many nationalities.'],
        ],

        'hero_image' => $heroFile,
        'gallery_files' => [$galleryFile1, $galleryFile2],
    ];

    $response = $this->actingAs($this->manager)->post(route('tours.store'), $payload);

    $response->assertRedirect(route('tours.index'));
    $response->assertSessionHas('success');

    $tour = TourPackage::where('slug', 'thailand-island-escape')->first();
    expect($tour)->not->toBeNull()
        ->and($tour->package_name)->toBe('Thailand Island & Culture Escape')
        ->and($tour->destination_id)->toBe($destination->id)
        ->and($tour->status)->toBe('active')
        ->and($tour->is_active)->toBeTrue()
        ->and($tour->is_featured)->toBeTrue()
        ->and((float) $tour->price)->toEqual(280000.0)
        ->and((float) $tour->price_from)->toEqual(250000.0)
        ->and($tour->currency)->toBe('LKR')
        ->and($tour->capacity)->toBe(14)
        ->and($tour->available_seats)->toBe(10)
        ->and($tour->group_min)->toBe(2)
        ->and($tour->group_max)->toBe(14)
        ->and($tour->tier)->toBe('luxury')
        ->and($tour->duration_days)->toBe(8)
        ->and($tour->duration_nights)->toBe(7)
        ->and($tour->departure_months)->toBe(['Nov', 'Dec', 'Jan'])
        ->and($tour->highlights)->toBe(['Grand Palace tour', 'Phi Phi speedboat', 'Night street food tour'])
        ->and($tour->tags)->toBe(['Beaches', 'Culture', 'Islands'])
        ->and($tour->hero_image)->not->toBeNull()
        ->and($tour->hero_image)->toStartWith('tours/');

    Storage::disk('public')->assertExists($tour->hero_image);
    expect($tour->gallery)->toBeArray()->toHaveCount(2);
    Storage::disk('public')->assertExists($tour->gallery[0]);
    Storage::disk('public')->assertExists($tour->gallery[1]);
});

test('staff can create a tour package', function () {
    $destination = Destination::factory()->create([
        'country' => 'India',
        'city_region' => 'Delhi & Agra',
        'slug' => 'india',
    ]);

    $response = $this->actingAs($this->staff)->post(route('tours.store'), [
        'destination_id' => $destination->id,
        'package_name' => 'Golden Triangle Tour',
        'slug' => 'golden-triangle-staff',
        'status' => 'active',
        'price' => 210000,
        'currency' => 'LKR',
        'tier' => 'semi_luxury',
    ]);

    $response->assertRedirect(route('tours.index'));
    $response->assertSessionHas('success');

    expect(TourPackage::where('slug', 'golden-triangle-staff')->exists())->toBeTrue();
});

test('the form loads with existing values on Edit', function () {
    $destination = Destination::factory()->create([
        'country' => 'Thailand',
        'city_region' => 'Phuket',
        'slug' => 'thailand',
    ]);

    $tour = TourPackage::factory()->create([
        'destination_id' => $destination->id,
        'package_name' => 'Phuket Island Delight',
        'slug' => 'phuket-delight',
        'price' => 195000,
        'currency' => 'LKR',
        'tier' => 'luxury',
        'capacity' => 16,
        'available_seats' => 8,
        'group_min' => 2,
        'group_max' => 16,
        'duration_days' => 5,
        'duration_nights' => 4,
        'highlights' => ['Island hopping', 'Sunset cruise'],
    ]);

    $response = $this->actingAs($this->manager)->get(route('tours.edit', $tour));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Tours/Edit')
        ->has('tour')
        ->where('tour.id', $tour->id)
        ->where('tour.package_name', 'Phuket Island Delight')
        ->where('tour.slug', 'phuket-delight')
        ->where('tour.tier', 'luxury')
        ->where('tour.destination_id', $destination->id)
        ->has('destinations')
        ->has('tiers')
        ->has('allowed_by_destination')
    );
});

test('create page loads with destinations and tiers', function () {
    Destination::factory()->create(['country' => 'Thailand', 'city_region' => 'Bangkok', 'slug' => 'thailand']);

    $response = $this->actingAs($this->manager)->get(route('tours.create'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Tours/Create')
        ->has('destinations')
        ->has('tiers')
        ->has('allowed_by_destination')
    );
});

test('tour show route redirects to edit route', function () {
    $tour = TourPackage::factory()->create();

    $response = $this->actingAs($this->manager)->get(route('tours.show', $tour));

    $response->assertRedirect(route('tours.edit', $tour));
});

test('manager can edit an existing tour package', function () {
    $destination = Destination::factory()->create([
        'country' => 'India',
        'city_region' => 'Kerala',
        'slug' => 'india',
    ]);

    $tour = TourPackage::factory()->create([
        'destination_id' => $destination->id,
        'package_name' => 'Kerala Backwaters Classic',
        'slug' => 'kerala-backwaters-classic',
        'price' => 180000,
        'currency' => 'LKR',
        'status' => 'active',
        'group_min' => 2,
        'group_max' => 10,
    ]);

    $response = $this->actingAs($this->manager)->put(route('tours.update', $tour), [
        'destination_id' => $destination->id,
        'package_name' => 'Kerala Backwaters & Houseboat Luxury',
        'slug' => 'kerala-backwaters-houseboat-luxury',
        'price' => 220000,
        'currency' => 'LKR',
        'status' => 'active',
        'tier' => 'luxury',
        'group_min' => 4,
        'group_max' => 12,
        'short_description' => 'Updated luxury houseboat retreat.',
    ]);

    $response->assertRedirect(route('tours.index'));
    $response->assertSessionHas('success');

    $tour->refresh();
    expect($tour->package_name)->toBe('Kerala Backwaters & Houseboat Luxury')
        ->and($tour->slug)->toBe('kerala-backwaters-houseboat-luxury')
        ->and((float) $tour->price)->toEqual(220000.0)
        ->and($tour->tier)->toBe('luxury')
        ->and($tour->group_min)->toBe(4)
        ->and($tour->group_max)->toBe(12);
});

test('a tier not allowed for the destination is rejected', function () {
    // Sri Lanka has no allowed tiers according to config/tour_tiers.php
    $destination = Destination::factory()->create([
        'country' => 'Sri Lanka',
        'city_region' => 'Ella',
        'slug' => 'sri-lanka',
    ]);

    $response = $this->actingAs($this->manager)->post(route('tours.store'), [
        'destination_id' => $destination->id,
        'package_name' => 'Ella Mountain Trail',
        'slug' => 'ella-mountain-trail',
        'status' => 'active',
        'price' => 95000,
        'currency' => 'LKR',
        'tier' => 'luxury', // Not allowed for Sri Lanka
    ]);

    $response->assertSessionHasErrors(['tier']);

    // India allows semi_luxury and luxury, but not premium
    $indiaDest = Destination::factory()->create([
        'country' => 'India',
        'city_region' => 'Jaipur',
        'slug' => 'india',
    ]);

    $response2 = $this->actingAs($this->manager)->post(route('tours.store'), [
        'destination_id' => $indiaDest->id,
        'package_name' => 'Jaipur Royal Experience',
        'slug' => 'jaipur-royal-experience',
        'status' => 'active',
        'price' => 240000,
        'currency' => 'LKR',
        'tier' => 'premium', // Disallowed for India
    ]);

    $response2->assertSessionHasErrors(['tier']);
});

test('group_max below group_min is rejected', function () {
    $destination = Destination::factory()->create([
        'country' => 'Thailand',
        'city_region' => 'Chiang Mai',
        'slug' => 'thailand',
    ]);

    $response = $this->actingAs($this->manager)->post(route('tours.store'), [
        'destination_id' => $destination->id,
        'package_name' => 'Chiang Mai Trekking',
        'slug' => 'chiang-mai-trekking',
        'status' => 'active',
        'price' => 150000,
        'currency' => 'LKR',
        'group_min' => 10,
        'group_max' => 5, // Below group_min!
    ]);

    $response->assertSessionHasErrors(['group_max']);
});

test('available_seats exceeding capacity is rejected', function () {
    $destination = Destination::factory()->create([
        'country' => 'Thailand',
        'city_region' => 'Phuket',
        'slug' => 'thailand',
    ]);

    $response = $this->actingAs($this->manager)->post(route('tours.store'), [
        'destination_id' => $destination->id,
        'package_name' => 'Phuket Sailing Tour',
        'slug' => 'phuket-sailing',
        'status' => 'active',
        'price' => 175000,
        'currency' => 'LKR',
        'capacity' => 15,
        'available_seats' => 20, // Exceeds capacity!
    ]);

    $response->assertSessionHasErrors(['available_seats']);
});

test('upload of a non-image file is rejected', function () {
    $destination = Destination::factory()->create([
        'country' => 'Thailand',
        'city_region' => 'Bangkok',
        'slug' => 'thailand',
    ]);

    $nonImage = UploadedFile::fake()->create('contract.pdf', 100, 'application/pdf');

    $response = $this->actingAs($this->manager)->post(route('tours.store'), [
        'destination_id' => $destination->id,
        'package_name' => 'Bangkok City Explorer',
        'slug' => 'bangkok-city-explorer',
        'status' => 'active',
        'price' => 120000,
        'currency' => 'LKR',
        'hero_image' => $nonImage,
    ]);

    $response->assertSessionHasErrors(['hero_image']);
});

test('deleting a tour package removes it and clears catalog cache', function () {
    $tour = TourPackage::factory()->create([
        'package_name' => 'Short Getaway',
        'slug' => 'short-getaway',
    ]);

    Cache::put('public.tours.all', 'cached-data', 3600);
    Cache::put("public.tour.{$tour->slug}", 'cached-tour', 3600);

    $response = $this->actingAs($this->manager)->delete(route('tours.destroy', $tour));

    $response->assertRedirect(route('tours.index'));
    $response->assertSessionHas('success');

    $this->assertSoftDeleted('tour_packages', ['id' => $tour->id]);
    expect(Cache::has('public.tours.all'))->toBeFalse();
});
