<?php

use App\Models\Destination;
use App\Models\TourPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['services.nisala_web.key' => 'test-valid-api-key']);
});

test('a package with no tier is valid', function () {
    $staff = User::factory()->staff()->create();
    $destination = Destination::create([
        'country' => 'India',
        'city_region' => 'Delhi',
        'status' => 'active',
        'listing_state' => 'live',
        'slug' => 'india',
    ]);

    $response = $this->actingAs($staff)->post('/tours', [
        'destination_id' => $destination->id,
        'package_name' => 'Delhi No Tier Tour',
        'price' => 50000,
        'currency' => 'LKR',
        'status' => 'active',
        'tier' => null,
    ]);

    $response->assertRedirect(route('tours.index'));
    $this->assertDatabaseHas('tour_packages', [
        'package_name' => 'Delhi No Tier Tour',
        'tier' => null,
    ]);
});

test('assigning semi_luxury to an India package is valid', function () {
    $staff = User::factory()->staff()->create();
    $destination = Destination::create([
        'country' => 'India',
        'city_region' => 'Delhi',
        'status' => 'active',
        'listing_state' => 'live',
        'slug' => 'india',
    ]);

    $response = $this->actingAs($staff)->post('/tours', [
        'destination_id' => $destination->id,
        'package_name' => 'Delhi Semi Luxury Tour',
        'price' => 75000,
        'currency' => 'LKR',
        'status' => 'active',
        'tier' => 'semi_luxury',
    ]);

    $response->assertRedirect(route('tours.index'));
    $this->assertDatabaseHas('tour_packages', [
        'package_name' => 'Delhi Semi Luxury Tour',
        'tier' => 'semi_luxury',
    ]);
});

test('assigning premium to India is rejected', function () {
    $staff = User::factory()->staff()->create();
    $destination = Destination::create([
        'country' => 'India',
        'city_region' => 'Delhi',
        'status' => 'active',
        'listing_state' => 'live',
        'slug' => 'india',
    ]);

    $response = $this->actingAs($staff)->post('/tours', [
        'destination_id' => $destination->id,
        'package_name' => 'Delhi Premium Tour',
        'price' => 100000,
        'currency' => 'LKR',
        'status' => 'active',
        'tier' => 'premium',
    ]);

    $response->assertSessionHasErrors('tier');
    $this->assertDatabaseMissing('tour_packages', [
        'package_name' => 'Delhi Premium Tour',
    ]);
});

test('group_max below group_min is rejected', function () {
    $staff = User::factory()->staff()->create();
    $destination = Destination::create([
        'country' => 'Thailand',
        'city_region' => 'Bangkok',
        'status' => 'active',
        'listing_state' => 'live',
        'slug' => 'thailand',
    ]);

    $response = $this->actingAs($staff)->post('/tours', [
        'destination_id' => $destination->id,
        'package_name' => 'Bangkok Sized Tour',
        'price' => 60000,
        'currency' => 'LKR',
        'status' => 'active',
        'group_min' => 10,
        'group_max' => 5,
    ]);

    $response->assertSessionHasErrors('group_max');
    $this->assertDatabaseMissing('tour_packages', [
        'package_name' => 'Bangkok Sized Tour',
    ]);

    // When group_max >= group_min, it succeeds
    $validResponse = $this->actingAs($staff)->post('/tours', [
        'destination_id' => $destination->id,
        'package_name' => 'Bangkok Sized Tour',
        'price' => 60000,
        'currency' => 'LKR',
        'status' => 'active',
        'group_min' => 10,
        'group_max' => 15,
    ]);

    $validResponse->assertRedirect(route('tours.index'));
    $this->assertDatabaseHas('tour_packages', [
        'package_name' => 'Bangkok Sized Tour',
        'group_min' => 10,
        'group_max' => 15,
    ]);
});

test('the API detail returns group_max from the new column and tier with label', function () {
    $destination = Destination::create([
        'country' => 'India',
        'city_region' => 'Delhi',
        'status' => 'active',
        'listing_state' => 'live',
        'slug' => 'india',
    ]);

    $tour = TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Delhi Heritage Tour',
        'slug' => 'delhi-heritage-tour',
        'price' => 80000,
        'capacity' => 50, // Old seat inventory capacity
        'group_min' => 4,
        'group_max' => 12, // New group_max column
        'tier' => 'semi_luxury',
        'status' => 'active',
        'is_active' => true,
    ]);

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/tours/delhi-heritage-tour');

    $response->assertStatus(200);
    expect($response->json('data.group_max'))->toBe(12)
        ->and($response->json('data.group_min'))->toBe(4)
        ->and($response->json('data.tier'))->toBe('semi_luxury')
        ->and($response->json('data.tier_label'))->toBe('Semi Luxury');
});

test('TourPackage::publicListed() returns active, is_active packages whose destination is publicListed', function () {
    $liveDest = Destination::create([
        'country' => 'Thailand',
        'city_region' => 'Bangkok',
        'status' => 'active',
        'listing_state' => 'live',
        'slug' => 'thailand-live',
    ]);

    $comingSoonDest = Destination::create([
        'country' => 'Sri Lanka',
        'city_region' => 'Colombo',
        'status' => 'active',
        'listing_state' => 'coming_soon',
        'slug' => 'sri-lanka-cs',
    ]);

    $hiddenDest = Destination::create([
        'country' => 'India',
        'city_region' => 'Agra',
        'status' => 'active',
        'listing_state' => 'hidden',
        'slug' => 'india-hidden',
    ]);

    // 1. Live dest, active package -> listed
    $validPkg = TourPackage::create([
        'destination_id' => $liveDest->id,
        'package_name' => 'Bangkok Live Package',
        'slug' => 'bangkok-live-pkg',
        'price' => 50000,
        'status' => 'active',
        'is_active' => true,
    ]);

    // 2. Live dest, inactive package -> excluded
    $inactivePkg = TourPackage::create([
        'destination_id' => $liveDest->id,
        'package_name' => 'Bangkok Inactive Package',
        'slug' => 'bangkok-inactive-pkg',
        'price' => 50000,
        'status' => 'inactive',
        'is_active' => true,
    ]);

    // 3. Live dest, is_active false -> excluded
    $notActivePkg = TourPackage::create([
        'destination_id' => $liveDest->id,
        'package_name' => 'Bangkok Not Active Package',
        'slug' => 'bangkok-not-active-pkg',
        'price' => 50000,
        'status' => 'active',
        'is_active' => false,
    ]);

    // 4. Coming soon dest, active package -> excluded
    $comingSoonPkg = TourPackage::create([
        'destination_id' => $comingSoonDest->id,
        'package_name' => 'Colombo Coming Soon Package',
        'slug' => 'colombo-coming-soon-pkg',
        'price' => 50000,
        'status' => 'active',
        'is_active' => true,
    ]);

    // 5. Hidden dest, active package -> excluded
    $hiddenPkg = TourPackage::create([
        'destination_id' => $hiddenDest->id,
        'package_name' => 'Agra Hidden Package',
        'slug' => 'agra-hidden-pkg',
        'price' => 50000,
        'status' => 'active',
        'is_active' => true,
    ]);

    $listed = TourPackage::publicListed()->get();

    expect($listed->pluck('id')->all())->toBe([$validPkg->id])
        ->and($listed->contains('id', $inactivePkg->id))->toBeFalse()
        ->and($listed->contains('id', $notActivePkg->id))->toBeFalse()
        ->and($listed->contains('id', $comingSoonPkg->id))->toBeFalse()
        ->and($listed->contains('id', $hiddenPkg->id))->toBeFalse();
});
