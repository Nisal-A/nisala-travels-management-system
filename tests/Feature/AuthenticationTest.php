<?php

use App\Enums\UserStatus;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| NT-004.1 Authentication Tests
|--------------------------------------------------------------------------
|
| Feature tests verifying the authentication foundation:
|   - Login page rendering
|   - Successful authentication
|   - Failed authentication (wrong password)
|   - Post-login redirect to dashboard
|   - Logout
|   - Guest redirect from protected routes
|   - Inactive/Suspended user rejection
|
*/

test('login page can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('Auth/Login'));
});

test('users can authenticate with valid credentials', function () {
    $user = User::factory()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard'));
});

test('users cannot authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users cannot authenticate with nonexistent email', function () {
    $response = $this->post('/login', [
        'email' => 'nobody@example.com',
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('email');
});

test('authenticated users can access the dashboard', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('Dashboard'));
});

test('authenticated users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});

test('guests cannot access the dashboard', function () {
    $response = $this->get('/dashboard');

    $response->assertRedirect('/login');
});

test('guests are redirected to login', function () {
    $response = $this->get('/dashboard');

    $response->assertRedirect('/login');
    $this->assertGuest();
});

test('inactive users cannot authenticate', function () {
    $user = User::factory()->inactive()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('email');
});

test('suspended users cannot authenticate', function () {
    $user = User::factory()->suspended()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('email');
});

test('authenticated users are redirected away from login page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/login');

    $response->assertRedirect('/dashboard');
});

test('login requires email field', function () {
    $response = $this->post('/login', [
        'email' => '',
        'password' => 'password',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('login requires password field', function () {
    $response = $this->post('/login', [
        'email' => 'admin@nisalatravels.lk',
        'password' => '',
    ]);

    $response->assertSessionHasErrors('password');
    $this->assertGuest();
});

test('auth user data is shared with inertia pages', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->has('auth.user')
        ->where('auth.user.id', $user->id)
        ->where('auth.user.name', $user->name)
        ->where('auth.user.email', $user->email)
    );
});

test('login attempts are rate limited', function () {
    $user = User::factory()->create();

    for ($i = 0; $i < 5; $i++) {
        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);
        
        $response->assertSessionHasErrors('email');
    }

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertStringContainsString(
        'Too many login attempts.',
        session('errors')->get('email')[0]
    );
});
