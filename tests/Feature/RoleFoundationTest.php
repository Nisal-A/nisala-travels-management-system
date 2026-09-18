<?php

use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Spatie\Permission\Models\Role;

/*
|--------------------------------------------------------------------------
| NT-005.1 Role Foundation Tests
|--------------------------------------------------------------------------
|
| Feature tests verifying the role and permission foundation:
|   - Role seeder correctness
|   - Role assignment and retrieval
|   - Factory role states
|   - Invalid role handling
|   - Inertia shared role props
|   - Security: no sensitive data leakage
|
*/

// ------------------------------------------------------------------
// Setup: Seed roles before each test in this file
// ------------------------------------------------------------------
beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

// ------------------------------------------------------------------
// Seeder Tests
// ------------------------------------------------------------------

test('role seeder creates exactly five roles', function () {
    expect(Role::count())->toBe(5);
});

test('role seeder creates all expected role names', function () {
    $expectedRoles = collect(UserRole::cases())->pluck('value')->sort()->values();
    $actualRoles = Role::pluck('name')->sort()->values();

    expect($actualRoles->toArray())->toBe($expectedRoles->toArray());
});

test('role seeder is idempotent', function () {
    // Seed a second time
    $this->seed(RoleSeeder::class);

    expect(Role::count())->toBe(5);
});

test('all seeded roles use the web guard', function () {
    $guards = Role::pluck('guard_name')->unique();

    expect($guards)->toHaveCount(1)
        ->and($guards->first())->toBe('web');
});

// ------------------------------------------------------------------
// Role Assignment Tests
// ------------------------------------------------------------------

test('a user can be assigned a role', function () {
    $user = User::factory()->create();
    $user->assignRole(UserRole::Staff->value);

    expect($user->hasRole(UserRole::Staff->value))->toBeTrue();
});

test('a user can have their role checked via hasRole', function () {
    $user = User::factory()->create();
    $user->assignRole(UserRole::Manager->value);

    expect($user->hasRole(UserRole::Manager->value))->toBeTrue()
        ->and($user->hasRole(UserRole::Finance->value))->toBeFalse();
});

test('a user role can be retrieved via getRoleNames', function () {
    $user = User::factory()->create();
    $user->assignRole(UserRole::SuperAdmin->value);

    $roles = $user->getRoleNames();

    expect($roles)->toContain(UserRole::SuperAdmin->value)
        ->and($roles)->toHaveCount(1);
});

test('assigning a non-existent role throws an exception', function () {
    $user = User::factory()->create();

    $user->assignRole('nonexistent_role');
})->throws(Spatie\Permission\Exceptions\RoleDoesNotExist::class);

test('duplicate role assignment does not create duplicates', function () {
    $user = User::factory()->create();
    $user->assignRole(UserRole::Staff->value);
    $user->assignRole(UserRole::Staff->value);

    expect($user->getRoleNames())->toHaveCount(1);
});

// ------------------------------------------------------------------
// Factory State Tests
// ------------------------------------------------------------------

test('superAdmin factory state assigns super_admin role', function () {
    $user = User::factory()->superAdmin()->create();

    expect($user->hasRole(UserRole::SuperAdmin->value))->toBeTrue();
});

test('manager factory state assigns manager role', function () {
    $user = User::factory()->manager()->create();

    expect($user->hasRole(UserRole::Manager->value))->toBeTrue();
});

test('staff factory state assigns staff role', function () {
    $user = User::factory()->staff()->create();

    expect($user->hasRole(UserRole::Staff->value))->toBeTrue();
});

test('finance factory state assigns finance role', function () {
    $user = User::factory()->finance()->create();

    expect($user->hasRole(UserRole::Finance->value))->toBeTrue();
});

test('customer factory state assigns customer role', function () {
    $user = User::factory()->customer()->create();

    expect($user->hasRole(UserRole::Customer->value))->toBeTrue();
});

// ------------------------------------------------------------------
// Inertia Shared Props Tests
// ------------------------------------------------------------------

test('authenticated user inertia props include roles array', function () {
    $user = User::factory()->superAdmin()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->has('auth.user.roles')
        ->where('auth.user.roles', $user->getRoleNames())
    );
});

test('authenticated user inertia props include permissions array', function () {
    $user = User::factory()->staff()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->has('auth.user.permissions')
    );
});

test('role data shared via inertia does not expose internal ids', function () {
    $user = User::factory()->manager()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertInertia(function ($page) {
        $roles = $page->toArray()['props']['auth']['user']['roles'];

        // Roles should be a flat array of strings, not objects with ids
        foreach ($roles as $role) {
            expect($role)->toBeString();
        }
    });
});

test('unauthenticated user does not receive role data', function () {
    $this->withoutVite();
    $response = $this->get('/login');

    $response->assertInertia(fn ($page) => $page
        ->where('auth.user', null)
    );
});

// ------------------------------------------------------------------
// UserRole Enum Tests
// ------------------------------------------------------------------

test('UserRole enum defines exactly five roles', function () {
    expect(UserRole::cases())->toHaveCount(5);
});

test('UserRole enum values match seeded role names', function () {
    foreach (UserRole::cases() as $role) {
        expect(Role::where('name', $role->value)->exists())->toBeTrue(
            "Role '{$role->value}' should exist in the database"
        );
    }
});

test('UserRole officeRoles excludes customer', function () {
    $officeRoles = UserRole::officeRoles();

    expect($officeRoles)->not->toContain(UserRole::Customer)
        ->and($officeRoles)->toContain(UserRole::SuperAdmin)
        ->and($officeRoles)->toContain(UserRole::Manager)
        ->and($officeRoles)->toContain(UserRole::Staff)
        ->and($officeRoles)->toContain(UserRole::Finance);
});

// ------------------------------------------------------------------
// Security Tests
// ------------------------------------------------------------------

test('super_admin role exists and is protected in seed data', function () {
    $superAdminRole = Role::findByName(UserRole::SuperAdmin->value, 'web');

    expect($superAdminRole)->not->toBeNull()
        ->and($superAdminRole->name)->toBe('super_admin');
});

test('user password is not exposed in inertia shared props', function () {
    $user = User::factory()->superAdmin()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertInertia(function ($page) {
        $userData = $page->toArray()['props']['auth']['user'];

        expect($userData)->not->toHaveKey('password')
            ->and($userData)->not->toHaveKey('remember_token');
    });
});
