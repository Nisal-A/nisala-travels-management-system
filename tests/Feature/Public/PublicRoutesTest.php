<?php

use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['services.nisala_web.key' => 'test-valid-api-key']);
});

test('get api public tours with no key returns 401', function () {
    $response = $this->getJson('/api/public/tours');

    $response->assertStatus(401)
        ->assertJson(['message' => 'Unauthorized']);
});

test('get api public tours with wrong key returns 401', function () {
    $response = $this->withHeader('X-Nisala-Key', 'wrong-key')->getJson('/api/public/tours');

    $response->assertStatus(401)
        ->assertJson(['message' => 'Unauthorized']);
});

test('get api public tours with empty key in config returns 401', function () {
    config(['services.nisala_web.key' => '']);

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')->getJson('/api/public/tours');

    $response->assertStatus(401)
        ->assertJson(['message' => 'Unauthorized']);
});

test('get api public tours with correct key returns 200', function () {
    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')->getJson('/api/public/tours');

    $response->assertStatus(200);
});

test('post api public inquiries with correct key and website filled returns 201 with reference and stores no inquiry', function () {
    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')->postJson('/api/public/inquiries', [
        'website' => 'bot-value',
        'name' => 'Spam Bot',
        'email' => 'bot@example.com',
    ]);

    $response->assertStatus(201);
    expect($response->json('reference'))->toMatch('/^NT-[A-Z0-9]{8}$/');

    if (Schema::hasTable('inquiries')) {
        $this->assertDatabaseCount('inquiries', 0);
    }
    if (Schema::hasTable('customers')) {
        $this->assertDatabaseCount('customers', 0);
    }
});

test('post inquiries web route returns 404', function () {
    $response = $this->postJson('/inquiries', []);

    $response->assertStatus(404);
});

test('guest get / redirects to login', function () {
    $response = $this->get('/');

    $response->assertRedirect('/login');
    $this->assertGuest();
});

test('authenticated staff user get / redirects to dashboard', function () {
    if (Role::count() === 0) {
        $this->seed(RoleSeeder::class);
    }

    $user = User::factory()->create();
    $user->assignRole(UserRole::Staff->value);

    $response = $this->actingAs($user)->get('/');

    $response->assertRedirect(route('dashboard'));
});

test('authenticated customer get / redirects to customer portal dashboard', function () {
    if (Role::count() === 0) {
        $this->seed(RoleSeeder::class);
    }

    $user = User::factory()->create();
    $user->assignRole(UserRole::Customer->value);

    $response = $this->actingAs($user)->get('/');

    $response->assertRedirect(route('portal.dashboard'));
});

test('legacy inertia public marketing routes are removed', function () {
    $routes = [
        ['GET', '/our-destinations'],
        ['GET', '/our-tours'],
        ['GET', '/our-tours/sri-lanka-round-trip'],
        ['GET', '/about'],
        ['GET', '/memories'],
        ['GET', '/travel-guides'],
        ['GET', '/contact'],
        ['POST', '/contact'],
        ['GET', '/privacy-policy'],
        ['GET', '/terms'],
    ];

    foreach ($routes as [$method, $uri]) {
        $this->call($method, $uri)->assertStatus(404);
    }
});

test('legacy inertia public marketing files are removed', function () {
    expect(file_exists(resource_path('js/Pages/Public/Home.tsx')))->toBeFalse();
    expect(file_exists(resource_path('js/Pages/Public/Placeholder.tsx')))->toBeFalse();
    expect(file_exists(resource_path('js/components/layouts/PublicLayout.tsx')))->toBeFalse();
    expect(file_exists(app_path('Http/Controllers/PublicController.php')))->toBeFalse();
});

test('dev styleguide returns 404 when APP_ENV=production', function () {
    config(['app.env' => 'production']);

    $response = $this->get('/dev/styleguide');

    $response->assertStatus(404);
});

test('whatsapp URL in config is https://wa.me/94761277010', function () {
    expect(config('company.whatsapp_url'))->toBe('https://wa.me/94761277010');
    expect(config('company.whatsapp_number'))->toBe('+94 76 127 7010');
    expect(config('company.phone'))->toBe('+94 71 995 1812');
    expect(config('company.address'))->toBe('Air port road, Hingurakgoda.');
});

test('login page shares company config', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->where('company.name', config('company.name'))
        ->where('company.whatsapp_url', 'https://wa.me/94761277010')
        ->where('company.phone', '+94 71 995 1812')
        ->where('company.address', 'Air port road, Hingurakgoda.')
        ->where('company.facebook', 'https://www.facebook.com/share/19ZiDiqSzv/?mibextid=wwXIfr')
        ->where('company.youtube', 'https://youtube.com/@nisalatravels?si=W2gymBC8SHYFm4JI')
    );
});

test('staff routes redirect guests to login', function () {
    $staffRoutes = [
        '/admin',
        '/customers',
        '/documents',
        '/tours',
        '/bookings',
        '/payments',
        '/employees',
        '/settings',
    ];

    foreach ($staffRoutes as $route) {
        $response = $this->get($route);
        $response->assertRedirect('/login');
    }
    $this->assertGuest();
});
