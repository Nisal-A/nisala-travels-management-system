<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

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

test('get api public tours with empty key in config returns 503', function () {
    config(['services.nisala_web.key' => '']);

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')->getJson('/api/public/tours');

    $response->assertStatus(503)
        ->assertJson(['message' => 'Service unavailable']);
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

test('guest get / returns 200 and renders Public/Home', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Home')
        ->has('company')
        ->where('company.name', config('company.name'))
        ->missing('auth')
    );
});

test('authenticated user get / returns 200 and does not share auth user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Home')
        ->has('company')
        ->missing('auth')
    );
});

test('get /our-tours returns 200 and renders Public/Placeholder', function () {
    $response = $this->get('/our-tours');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Placeholder')
        ->where('title', 'Our Tours')
        ->has('company')
        ->missing('auth')
    );
});

test('all placeholder public routes return 200', function () {
    $routes = [
        ['GET', '/our-destinations', 'Our Destinations'],
        ['GET', '/our-tours', 'Our Tours'],
        ['GET', '/our-tours/sri-lanka-round-trip', 'Tour Details'],
        ['GET', '/memories', 'Memories'],
        ['GET', '/travel-guides', 'Travel Guides'],
        ['GET', '/contact', 'Contact Us'],
        ['POST', '/contact', 'Contact Us'],
        ['GET', '/privacy-policy', 'Privacy Policy'],
        ['GET', '/terms', 'Terms & Conditions'],
    ];

    foreach ($routes as [$method, $uri, $expectedTitle]) {
        $response = $this->call($method, $uri);
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Placeholder')
            ->where('title', $expectedTitle)
            ->has('company')
            ->missing('auth')
        );
    }
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

test('public pages share updated company config with correct whatsapp url', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->where('company.whatsapp_url', 'https://wa.me/94761277010')
        ->where('company.phone', '+94 71 995 1812')
        ->where('company.address', 'Air port road, Hingurakgoda.')
        ->where('company.facebook', 'https://www.facebook.com/share/19ZiDiqSzv/?mibextid=wwXIfr')
        ->where('company.youtube', 'https://youtube.com/@nisalatravels?si=W2gymBC8SHYFm4JI')
    );
});

test('homepage renders 200 with no packages', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Home')
        ->has('featuredPackages')
        ->where('featuredPackages', [])
        ->has('destinations')
        ->where('destinations', [])
    );
});

test('homepage has exactly one H1 tag in Hero section', function () {
    $homeFile = resource_path('js/Pages/Public/Home.tsx');
    expect(file_exists($homeFile))->toBeTrue();
    $homeContent = file_get_contents($homeFile);

    $homeComponents = glob(resource_path('js/components/public/home/*.tsx'));
    expect($homeComponents)->not->toBeEmpty();

    $h1Occurrences = 0;
    $h1Occurrences += preg_match_all('/<h1\b/i', $homeContent);

    foreach ($homeComponents as $component) {
        $content = file_get_contents($component);
        $h1Occurrences += preg_match_all('/<h1\b/i', $content);
    }

    // Exactly one H1 on the entire homepage
    expect($h1Occurrences)->toBe(1);

    // Verify the one H1 is specifically located in HeroSection.tsx
    $heroContent = file_get_contents(resource_path('js/components/public/home/HeroSection.tsx'));
    expect(preg_match_all('/<h1\b/i', $heroContent))->toBe(1);
});

test('homepage whatsapp link uses config value', function () {
    config(['company.whatsapp_url' => 'https://wa.me/94771122334']);

    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->where('company.whatsapp_url', 'https://wa.me/94771122334')
    );
});

test('homepage renders featured packages and destinations when available', function () {
    $destination = \App\Models\Destination::create([
        'city_region' => 'Ella',
        'country' => 'Sri Lanka',
        'description' => 'Misty mountains and waterfalls',
        'listing_state' => \App\Models\Destination::LISTING_STATE_LIVE,
        'status' => 'active',
        'slug' => 'ella',
    ]);

    \App\Models\TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Ella Highlands Adventure',
        'description' => 'Experience scenic trails and railway bridges.',
        'duration_days' => 4,
        'duration_nights' => 3,
        'price' => 450,
        'currency' => 'USD',
        'capacity' => 12,
        'is_featured' => true,
        'is_active' => true,
        'status' => 'active',
        'slug' => 'ella-highlands-adventure',
    ]);

    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Home')
        ->has('featuredPackages', 1)
        ->has('destinations', 1)
        ->where('featuredPackages.0.title', 'Ella Highlands Adventure')
        ->where('destinations.0.name', 'Ella')
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

test('the rendered navbar does not contain Enquire Now or Memories', function () {
    $layoutFile = resource_path('js/components/layouts/PublicLayout.tsx');
    expect(file_exists($layoutFile))->toBeTrue();

    $layoutContent = file_get_contents($layoutFile);

    // Assert that the navbar items and header actions do not contain "Enquire Now" or "Memories"
    expect($layoutContent)->not->toContain("'Memories'");
    expect($layoutContent)->not->toContain('"Memories"');
    expect($layoutContent)->not->toContain('Enquire Now');

    // Assert that the remaining navbar items are preserved
    expect($layoutContent)->toContain("'Destinations'");
    expect($layoutContent)->toContain("'/our-destinations'");
    expect($layoutContent)->toContain("'Tours'");
    expect($layoutContent)->toContain("'/our-tours'");
    expect($layoutContent)->toContain("'Contact'");
    expect($layoutContent)->toContain("'/contact'");

    // Verify GET / returns 200 and HTML response does not see Enquire Now
    $response = $this->get('/');
    $response->assertStatus(200);
    $response->assertDontSee('Enquire Now');
});

