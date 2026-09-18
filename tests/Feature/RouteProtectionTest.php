<?php

use App\Models\User;

/*
|--------------------------------------------------------------------------
| NT-004.6 Protected Routes Tests
|--------------------------------------------------------------------------
|
| Tests to ensure that all authenticated routes enforce the 'auth' middleware
| properly, and that unauthenticated users are redirected.
|
*/

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

test('authenticated users can access protected routes', function (string $route) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get($route);

    $response->assertStatus(200);
})->with('protected_routes');

test('public routes remain accessible without authentication', function () {
    $this->withoutVite();
    $response = $this->get('/login');

    $response->assertStatus(200);
});
