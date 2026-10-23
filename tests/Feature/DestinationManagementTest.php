<?php

use App\Enums\UserRole;
use App\Models\Destination;
use App\Models\TourPackage;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => UserRole::SuperAdmin->value, 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => UserRole::Manager->value, 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => UserRole::Staff->value, 'guard_name' => 'web']);

    $this->manager = User::factory()->create();
    $this->manager->assignRole(UserRole::Manager->value);

    Storage::fake('public');
});

test('manager can create a destination with all fields and hero image', function () {
    $heroFile = UploadedFile::fake()->image('ella_hero.jpg', 800, 600);
    $galleryFile = UploadedFile::fake()->image('ella_g1.webp', 800, 600);

    $response = $this->actingAs($this->manager)->post(route('destinations.store'), [
        'country' => 'Sri Lanka',
        'city_region' => 'Ella Central',
        'slug' => 'ella-central',
        'listing_state' => 'live',
        'status' => 'active',
        'region' => 'south-asia',
        'tagline' => 'Scenic tea country',
        'description' => 'A wonderful town in the central highlands.',
        'travel_information' => 'Take the scenic blue train from Kandy.',
        'best_months' => 'December to April',
        'highlights' => ['Nine Arches Bridge', 'Little Adams Peak'],
        'facts' => [
            ['label' => 'Elevation', 'value' => '1,041 m'],
            ['label' => 'Climate', 'value' => 'Subtropical highland'],
        ],
        'recommendations' => ['Hike early morning for sunrise views'],
        'sort_order' => 1,
        'hero_image' => $heroFile,
        'gallery_files' => [$galleryFile],
    ]);

    $response->assertRedirect(route('destinations.index'));
    $response->assertSessionHas('success');

    $destination = Destination::where('slug', 'ella-central')->first();
    expect($destination)->not->toBeNull()
        ->and($destination->country)->toBe('Sri Lanka')
        ->and($destination->city_region)->toBe('Ella Central')
        ->and($destination->listing_state)->toBe('live')
        ->and($destination->status)->toBe('active')
        ->and($destination->region)->toBe('south-asia')
        ->and($destination->highlights)->toBe(['Nine Arches Bridge', 'Little Adams Peak'])
        ->and($destination->facts)->toBe([
            ['label' => 'Elevation', 'value' => '1,041 m'],
            ['label' => 'Climate', 'value' => 'Subtropical highland'],
        ])
        ->and($destination->hero_image)->not->toBeNull();

    Storage::disk('public')->assertExists($destination->hero_image);
    expect($destination->gallery)->toBeArray()->toHaveCount(1);
    Storage::disk('public')->assertExists($destination->gallery[0]);
});

test('manager can edit an existing destination', function () {
    $destination = Destination::factory()->create([
        'country' => 'Sri Lanka',
        'city_region' => 'Kandy',
        'slug' => 'kandy-heritage',
        'listing_state' => 'coming_soon',
        'status' => 'active',
    ]);

    $response = $this->actingAs($this->manager)->put(route('destinations.update', $destination), [
        'country' => 'Sri Lanka',
        'city_region' => 'Kandy Royal City',
        'slug' => 'kandy-royal-city',
        'listing_state' => 'live',
        'status' => 'active',
        'tagline' => 'City of the Sacred Tooth Relic',
        'description' => 'Updated cultural capital description.',
    ]);

    $response->assertRedirect(route('destinations.index'));
    $response->assertSessionHas('success');

    $destination->refresh();
    expect($destination->city_region)->toBe('Kandy Royal City')
        ->and($destination->slug)->toBe('kandy-royal-city')
        ->and($destination->listing_state)->toBe('live')
        ->and($destination->tagline)->toBe('City of the Sacred Tooth Relic');
});

test('manager can delete a destination without tours', function () {
    $destination = Destination::factory()->create([
        'city_region' => 'Trincomalee',
        'slug' => 'trincomalee-beach',
    ]);

    $response = $this->actingAs($this->manager)->delete(route('destinations.destroy', $destination));

    $response->assertRedirect(route('destinations.index'));
    $response->assertSessionHas('success');

    $this->assertSoftDeleted('destinations', ['id' => $destination->id]);
});

test('a duplicate slug is rejected', function () {
    Destination::factory()->create([
        'city_region' => 'Sigiriya Rock',
        'slug' => 'sigiriya',
    ]);

    $response = $this->actingAs($this->manager)->post(route('destinations.store'), [
        'country' => 'Sri Lanka',
        'city_region' => 'Sigiriya Town',
        'slug' => 'sigiriya',
        'listing_state' => 'live',
        'status' => 'active',
    ]);

    $response->assertSessionHasErrors(['slug']);
});

test('a destination with tours cannot be deleted and tours are preserved', function () {
    $destination = Destination::factory()->create([
        'city_region' => 'Galle Fort',
        'slug' => 'galle-fort',
    ]);

    $tour = TourPackage::factory()->create([
        'destination_id' => $destination->id,
        'package_name' => 'Southern Coast Explorer',
    ]);

    $response = $this->actingAs($this->manager)->delete(route('destinations.destroy', $destination));

    $response->assertSessionHas('error', 'Remove or move its tours first.');

    // Destination and tour must remain intact
    expect(Destination::find($destination->id))->not->toBeNull();
    expect($tour->fresh())->not->toBeNull()
        ->and($tour->destination_id)->toBe($destination->id);
});

test('an invalid listing_state is rejected', function () {
    $response = $this->actingAs($this->manager)->post(route('destinations.store'), [
        'country' => 'Sri Lanka',
        'city_region' => 'Mirissa',
        'slug' => 'mirissa',
        'listing_state' => 'invalid_state',
        'status' => 'active',
    ]);

    $response->assertSessionHasErrors(['listing_state']);
});

test('an upload of a non-image is rejected', function () {
    $nonImage = UploadedFile::fake()->create('contract.pdf', 100, 'application/pdf');

    $response = $this->actingAs($this->manager)->post(route('destinations.store'), [
        'country' => 'Sri Lanka',
        'city_region' => 'Nuwara Eliya',
        'slug' => 'nuwara-eliya',
        'listing_state' => 'live',
        'status' => 'active',
        'hero_image' => $nonImage,
    ]);

    $response->assertSessionHasErrors(['hero_image']);
});

test('destination show route redirects to edit route', function () {
    $destination = Destination::factory()->create([
        'city_region' => 'Jaffna Peninsula',
        'slug' => 'jaffna',
    ]);

    $response = $this->actingAs($this->manager)->get(route('destinations.show', $destination));

    $response->assertRedirect(route('destinations.edit', $destination));
});
