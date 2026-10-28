<?php

use App\Models\Employee;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

/* =========================================================================
 * 1. Each staff role can view and update their profile
 * ========================================================================= */

test('each staff role can view and update their profile', function () {
    $roles = [
        'super_admin' => fn () => User::factory()->superAdmin()->create(),
        'manager' => fn () => User::factory()->manager()->create(),
        'staff' => fn () => User::factory()->staff()->create(),
        'finance' => fn () => User::factory()->finance()->create(),
    ];

    foreach ($roles as $roleName => $factory) {
        $user = $factory();

        // 1. Can view profile
        $response = $this->actingAs($user)->get('/profile');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Profile/Edit')
            ->has('user')
            ->where('user.name', $user->name)
            ->where('user.email', $user->email)
        );

        // 2. Can update profile
        $newName = "Updated {$roleName} Name";
        $newPhone = '+94 77 123 4567';

        $updateResponse = $this->actingAs($user)->patch('/profile', [
            'name' => $newName,
            'phone' => $newPhone,
        ]);

        $updateResponse->assertRedirect();
        $updateResponse->assertSessionHas('success');

        expect($user->fresh()->name)->toBe($newName);

        $employee = Employee::where('user_id', $user->id)->first();
        expect($employee)->not->toBeNull();
        expect($employee->phone)->toBe($newPhone);
    }
});

/* =========================================================================
 * 2. Email cannot be changed here
 * ========================================================================= */

test('email cannot be changed here', function () {
    $staff = User::factory()->staff()->create([
        'name' => 'Original Staff Name',
        'email' => 'original.staff@nisalatravels.lk',
    ]);

    $response = $this->actingAs($staff)->patch('/profile', [
        'name' => 'Changed Staff Name',
        'email' => 'hacked.email@otherdomain.com',
        'phone' => '+94 71 000 0000',
    ]);

    $response->assertRedirect();

    $staff->refresh();

    // Name updated, but email remained strictly unchanged
    expect($staff->name)->toBe('Changed Staff Name');
    expect($staff->email)->toBe('original.staff@nisalatravels.lk');
});

/* =========================================================================
 * 3. Password update rules & wrong current password rejected
 * ========================================================================= */

test('a wrong current password is rejected', function () {
    $staff = User::factory()->staff()->create([
        'password' => Hash::make('correct-password'),
    ]);

    // Attempt with wrong current password
    $response = $this->actingAs($staff)->put('/profile/password', [
        'current_password' => 'wrong-current-password',
        'password' => 'new-secret-password-123',
        'password_confirmation' => 'new-secret-password-123',
    ]);

    $response->assertSessionHasErrors(['current_password']);
    expect(Hash::check('correct-password', $staff->fresh()->password))->toBeTrue();

    // Attempt with correct current password
    $successResponse = $this->actingAs($staff)->put('/profile/password', [
        'current_password' => 'correct-password',
        'password' => 'new-secret-password-123',
        'password_confirmation' => 'new-secret-password-123',
    ]);

    $successResponse->assertRedirect();
    $successResponse->assertSessionHas('success');
    expect(Hash::check('new-secret-password-123', $staff->fresh()->password))->toBeTrue();
});

/* =========================================================================
 * 4. Authorization: A customer cannot use the staff routes
 * ========================================================================= */

test('a customer cannot use the staff routes', function () {
    $customer = User::factory()->customer()->create();

    // GET /profile -> 403 Forbidden
    $this->actingAs($customer)
        ->get('/profile')
        ->assertStatus(403);

    // PATCH /profile -> 403 Forbidden
    $this->actingAs($customer)
        ->patch('/profile', ['name' => 'Customer Hacker'])
        ->assertStatus(403);

    // PUT /profile/password -> 403 Forbidden
    $this->actingAs($customer)
        ->put('/profile/password', [
            'current_password' => 'password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])
        ->assertStatus(403);

    // DELETE /profile/sessions -> 403 Forbidden
    $this->actingAs($customer)
        ->delete('/profile/sessions')
        ->assertStatus(403);

    // Guest redirected to login
    $this->app['auth']->logout();
    $this->get('/profile')->assertRedirect('/login');
    $this->patch('/profile', ['name' => 'Guest'])->assertRedirect('/login');
    $this->put('/profile/password', [])->assertRedirect('/login');
});
