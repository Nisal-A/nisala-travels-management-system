<?php

use App\Models\User;
use Database\Seeders\RoleSeeder;

/*
|--------------------------------------------------------------------------
| NT-004.6 / NT-005.2 Protected Routes Tests
|--------------------------------------------------------------------------
|
| Tests to ensure that all authenticated routes enforce the 'auth' middleware
| properly, and that unauthenticated users are redirected. Updated in
| NT-005.2 to use a super admin user since routes now enforce role checks.
|
*/

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

dataset('protected_routes', [
    ['/admin'],
    ['/customers'],
    ['/documents'],
    ['/tours'],
    ['/bookings'],
    ['/payments'],
    ['/employees'],
    ['/reports'],
    ['/settings'],
]);

test('guests are redirected to login when accessing protected routes', function (string $route) {
    $response = $this->get($route);

    $response->assertRedirect('/login');
    $this->assertGuest();
})->with('protected_routes');

test('authorized users can access protected routes', function (string $route) {
    $user = User::factory()->superAdmin()->create();

    $response = $this->actingAs($user)->get($route);

    $response->assertStatus(200);
})->with('protected_routes');

test('public routes remain accessible without authentication', function () {
    $this->withoutVite();
    $response = $this->get('/login');

    $response->assertStatus(200);
});

