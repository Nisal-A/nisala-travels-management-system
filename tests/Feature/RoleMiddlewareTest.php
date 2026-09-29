<?php

use App\Models\User;
use Database\Seeders\RoleSeeder;

/*
|--------------------------------------------------------------------------
| NT-005.2 Role Middleware Tests
|--------------------------------------------------------------------------
|
| Feature tests verifying the EnsureUserHasRole middleware:
|   - Authorized roles can access restricted routes
|   - Unauthorized roles receive 403 Forbidden
|   - Unauthenticated users are redirected to login
|   - Multiple-role middleware works correctly
|   - 403 responses do not leak internal information
|   - Each route group enforces the correct role restrictions
|
*/

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

// ------------------------------------------------------------------
// Core Middleware Behavior
// ------------------------------------------------------------------

test('authorized role can access a role-restricted route', function () {
    $user = User::factory()->superAdmin()->create();

    $response = $this->actingAs($user)->get('/admin');

    $response->assertStatus(200);
});

test('unauthorized role receives 403 on a role-restricted route', function () {
    $user = User::factory()->staff()->create();

    $response = $this->actingAs($user)->get('/admin');

    $response->assertStatus(403);
});

test('unauthenticated user is redirected to login on role-restricted route', function () {
    $response = $this->get('/admin');

    $response->assertRedirect('/login');
});

test('403 response body does not contain role names', function () {
    $user = User::factory()->customer()->create();

    $response = $this->actingAs($user)->get('/admin');

    $response->assertStatus(403);
    $content = $response->getContent();
    expect($content)->not->toContain('super_admin')
        ->and($content)->not->toContain('manager')
        ->and($content)->not->toContain('staff')
        ->and($content)->not->toContain('finance');
});

// ------------------------------------------------------------------
// Super Admin Access (full access to all routes)
// ------------------------------------------------------------------

test('super admin can access all protected route groups', function (string $route) {
    $user = User::factory()->superAdmin()->create();

    $response = $this->actingAs($user)->get($route);

    $response->assertStatus(200);
})->with([
    '/admin',
    '/settings',
    '/employees',
    '/customers',
    '/documents',
    '/tour-packages',
    '/bookings',
    '/payments',
    '/reports',
]);

// ------------------------------------------------------------------
// Manager Access
// ------------------------------------------------------------------

test('manager can access manager-permitted routes', function (string $route) {
    $user = User::factory()->manager()->create();

    $response = $this->actingAs($user)->get($route);

    $response->assertStatus(200);
})->with([
    '/employees',
    '/customers',
    '/documents',
    '/tour-packages',
    '/bookings',
    '/payments',
    '/reports',
]);

test('manager cannot access super admin only routes', function (string $route) {
    $user = User::factory()->manager()->create();

    $response = $this->actingAs($user)->get($route);

    $response->assertStatus(403);
})->with([
    '/admin',
    '/settings',
]);

// ------------------------------------------------------------------
// Staff Access
// ------------------------------------------------------------------

test('staff can access staff-permitted routes', function (string $route) {
    $user = User::factory()->staff()->create();

    $response = $this->actingAs($user)->get($route);

    $response->assertStatus(200);
})->with([
    '/customers',
    '/documents',
    '/tour-packages',
    '/bookings',
]);

test('staff cannot access restricted routes', function (string $route) {
    $user = User::factory()->staff()->create();

    $response = $this->actingAs($user)->get($route);

    $response->assertStatus(403);
})->with([
    '/admin',
    '/settings',
    '/employees',
    '/payments',
    '/reports',
]);

// ------------------------------------------------------------------
// Finance Access
// ------------------------------------------------------------------

test('finance can access finance-permitted routes', function (string $route) {
    $user = User::factory()->finance()->create();

    $response = $this->actingAs($user)->get($route);

    $response->assertStatus(200);
})->with([
    '/payments',
    '/reports',
]);

test('finance cannot access non-finance routes', function (string $route) {
    $user = User::factory()->finance()->create();

    $response = $this->actingAs($user)->get($route);

    $response->assertStatus(403);
})->with([
    '/admin',
    '/settings',
    '/employees',
    '/customers',
    '/documents',
    '/tour-packages',
    '/bookings',
]);

// ------------------------------------------------------------------
// Customer Access
// ------------------------------------------------------------------

test('customer cannot access any office routes', function (string $route) {
    $user = User::factory()->customer()->create();

    $response = $this->actingAs($user)->get($route);

    $response->assertStatus(403);
})->with([
    '/admin',
    '/settings',
    '/employees',
    '/customers',
    '/documents',
    '/tour-packages',
    '/bookings',
    '/payments',
    '/reports',
]);

test('customer can access the dashboard', function () {
    $user = User::factory()->customer()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertStatus(200);
});

// ------------------------------------------------------------------
// Dashboard (accessible to all authenticated users regardless of role)
// ------------------------------------------------------------------

test('dashboard is accessible to all authenticated roles', function (string $role) {
    $user = User::factory()->{$role}()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertStatus(200);
})->with([
    'superAdmin',
    'manager',
    'staff',
    'finance',
    'customer',
]);

// ------------------------------------------------------------------
// Edge Cases
// ------------------------------------------------------------------

test('user with no role receives 403 on role-restricted route', function () {
    $user = User::factory()->create(); // No role assigned

    $response = $this->actingAs($user)->get('/admin');

    $response->assertStatus(403);
});

test('user with no role can still access the dashboard', function () {
    $user = User::factory()->create(); // No role assigned

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertStatus(200);
});
