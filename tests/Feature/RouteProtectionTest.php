<?php

use App\Models\User;
use Database\Seeders\RoleSeeder;

/*
|--------------------------------------------------------------------------
| NT-004.6 / NT-005.2 / NT-005.4 Protected Routes Tests
|--------------------------------------------------------------------------
|
| Tests to ensure that all authenticated routes enforce the 'auth' middleware
| properly, and that unauthenticated users are redirected. Updated in
| NT-005.4 to include customer portal routes.
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
    ['/portal'],
    ['/portal/bookings'],
    ['/portal/documents'],
    ['/portal/payments'],
]);

test('guests are redirected to login when accessing protected routes', function (string $route) {
    $response = $this->get($route);

    $response->assertRedirect('/login');
    $this->assertGuest();
})->with('protected_routes');

test('super admin can access office protected routes', function () {
    $this->withoutVite();
    $user = User::factory()->superAdmin()->create();

    $officeRoutes = ['/admin', '/customers', '/documents', '/tours',
                     '/bookings', '/payments', '/employees', '/reports', '/settings'];

    foreach ($officeRoutes as $route) {
        $response = $this->actingAs($user)->get($route);
        $response->assertStatus(200);
    }
});

test('customer can access portal routes', function () {
    $this->withoutVite();
    $user = User::factory()->customer()->create();

    $portalRoutes = ['/portal', '/portal/bookings', '/portal/documents', '/portal/payments'];

    foreach ($portalRoutes as $route) {
        $response = $this->actingAs($user)->get($route);
        $response->assertStatus(200);
    }
});

test('public routes remain accessible without authentication', function () {
    $this->withoutVite();
    $response = $this->get('/login');

    $response->assertStatus(200);
});
