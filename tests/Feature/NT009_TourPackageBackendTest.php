<?php

use App\Enums\UserRole;
use App\Models\Destination;
use App\Models\TourCategory;
use App\Models\TourPackage;
use App\Models\User;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);

    $this->manager = User::factory()->create();
    $this->manager->assignRole(UserRole::Manager->value);

    $this->staff = User::factory()->create();
    $this->staff->assignRole(UserRole::Staff->value);

    $this->destination = Destination::create(['country' => 'Sri Lanka', 'city_region' => 'Colombo']);
    $this->category = TourCategory::create(['name' => 'Luxury']);

    $this->packageData = [
        'package_name' => 'Test Package',
        'destination_id' => $this->destination->id,
        'tour_category_id' => $this->category->id,
        'duration_days' => 5,
        'duration_nights' => 4,
        'price' => 500.00,
        'currency' => 'USD',
        'capacity' => 10,
        'status' => 'active',
        'itineraries' => [
            [
                'day_number' => 1,
                'title' => 'Arrival',
            ],
            [
                'day_number' => 2,
                'title' => 'City Tour',
            ]
        ]
    ];
});

test('manager can create tour package', function () {
    $response = $this->actingAs($this->manager)->post('/tour-packages', $this->packageData);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('tour_packages', [
        'package_name' => 'Test Package',
        'created_by' => $this->manager->id,
    ]);

    $this->assertDatabaseHas('tour_itineraries', [
        'day_number' => 1,
        'title' => 'Arrival'
    ]);
});

test('staff cannot create tour package', function () {
    $response = $this->actingAs($this->staff)->post('/tour-packages', $this->packageData);
    $response->assertForbidden();
});

test('manager can update tour package', function () {
    $createData = $this->packageData;
    unset($createData['itineraries']);
    $package = TourPackage::create(array_merge($createData, ['created_by' => $this->manager->id, 'package_id' => 'PKG-00001']));

    $updateData = $this->packageData;
    $updateData['package_name'] = 'Updated Package';

    $response = $this->actingAs($this->manager)->put("/tour-packages/{$package->id}", $updateData);

    $response->assertRedirect();
    $this->assertDatabaseHas('tour_packages', [
        'id' => $package->id,
        'package_name' => 'Updated Package',
        'updated_by' => $this->manager->id,
    ]);
});

test('staff cannot update tour package', function () {
    $createData = $this->packageData;
    unset($createData['itineraries']);
    $package = TourPackage::create(array_merge($createData, ['created_by' => $this->manager->id, 'package_id' => 'PKG-00001']));

    $updateData = $this->packageData;
    $updateData['package_name'] = 'Updated Package';

    $response = $this->actingAs($this->staff)->put("/tour-packages/{$package->id}", $updateData);
    $response->assertForbidden();
});

test('manager can change status', function () {
    $createData = $this->packageData;
    unset($createData['itineraries']);
    $package = TourPackage::create(array_merge($createData, ['created_by' => $this->manager->id, 'package_id' => 'PKG-00001']));

    $response = $this->actingAs($this->manager)->patch("/tour-packages/{$package->id}/status", ['status' => 'archived']);

    $response->assertRedirect();
    $this->assertDatabaseHas('tour_packages', [
        'id' => $package->id,
        'status' => 'archived',
    ]);
});

test('manager can soft delete package', function () {
    $createData = $this->packageData;
    unset($createData['itineraries']);
    $package = TourPackage::create(array_merge($createData, ['created_by' => $this->manager->id, 'package_id' => 'PKG-00001']));

    $response = $this->actingAs($this->manager)->delete("/tour-packages/{$package->id}");

    $response->assertRedirect();
    $this->assertSoftDeleted('tour_packages', ['id' => $package->id]);
});

test('manager can restore package', function () {
    $createData = $this->packageData;
    unset($createData['itineraries']);
    $package = TourPackage::create(array_merge($createData, ['created_by' => $this->manager->id, 'package_id' => 'PKG-00001']));
    $package->delete();

    $response = $this->actingAs($this->manager)->post("/tour-packages/{$package->id}/restore");

    $response->assertRedirect();
    $this->assertNotSoftDeleted('tour_packages', ['id' => $package->id]);
});

test('staff can view packages', function () {
    $response = $this->actingAs($this->staff)->get('/tour-packages');
    $response->assertOk(); // Since we are returning json, it's 200 OK.
});

test('negative price is rejected', function () {
    $badData = $this->packageData;
    $badData['price'] = -50;

    $response = $this->actingAs($this->manager)->post('/tour-packages', $badData);
    $response->assertSessionHasErrors('price');
});

test('invalid duration is rejected', function () {
    $badData = $this->packageData;
    $badData['duration_days'] = 0;

    $response = $this->actingAs($this->manager)->post('/tour-packages', $badData);
    $response->assertSessionHasErrors('duration_days');
});
