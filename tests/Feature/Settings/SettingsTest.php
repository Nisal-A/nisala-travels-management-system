<?php

use App\Models\AppSetting;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

/* =========================================================================
 * 1. Authorization: Only super_admin can open or save settings
 * ========================================================================= */

test('only super_admin can open settings page', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $manager = User::factory()->manager()->create();
    $staff = User::factory()->staff()->create();
    $finance = User::factory()->finance()->create();
    $customer = User::factory()->customer()->create();

    // Guests redirected to login
    $this->get(route('settings.index'))
        ->assertRedirect('/login');

    // Non-super-admins get 403 Forbidden
    $this->actingAs($manager)->get(route('settings.index'))->assertStatus(403);
    $this->actingAs($staff)->get(route('settings.index'))->assertStatus(403);
    $this->actingAs($finance)->get(route('settings.index'))->assertStatus(403);
    $this->actingAs($customer)->get(route('settings.index'))->assertStatus(403);

    // Super Admin gets 200 OK
    $this->actingAs($superAdmin)->get(route('settings.index'))->assertStatus(200);
});

test('only super_admin can save settings', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $manager = User::factory()->manager()->create();
    $staff = User::factory()->staff()->create();

    $payload = [
        'company_name' => 'Updated Company Ltd',
        'company_phone' => '+94 77 123 4567',
        'company_whatsapp_number' => '+94 77 765 4321',
        'company_support_email' => 'support@updated.com',
        'company_address' => '123 New Road, Colombo',
        'company_office_hours' => 'Mon - Fri: 9:00 AM - 5:00 PM',
    ];

    // Guests
    $this->put(route('settings.update'), $payload)
        ->assertRedirect('/login');

    // Staff & Manager
    $this->actingAs($staff)->put(route('settings.update'), $payload)->assertStatus(403);
    $this->actingAs($manager)->put(route('settings.update'), $payload)->assertStatus(403);

    // Super Admin
    $this->actingAs($superAdmin)
        ->put(route('settings.update'), $payload)
        ->assertRedirect();

    expect(AppSetting::get('company_name'))->toBe('Updated Company Ltd');
    expect(AppSetting::get('company_phone'))->toBe('+94 77 123 4567');
});

test('only super_admin can clear public website cache', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $manager = User::factory()->manager()->create();

    // Manager gets 403
    $this->actingAs($manager)->post(route('settings.clear-cache'))->assertStatus(403);

    // Super Admin gets redirect
    $this->actingAs($superAdmin)->post(route('settings.clear-cache'))->assertRedirect();
});

/* =========================================================================
 * 2. Helper & Config Fallback: Helper falls back to config/company.php
 * ========================================================================= */

test('the helper falls back to config', function () {
    // Ensure table is empty
    AppSetting::truncate();

    // Verify company_setting falls back to config/company.php
    expect(company_setting('name'))->toBe(config('company.name'));
    expect(company_setting('phone'))->toBe(config('company.phone'));
    expect(company_setting('whatsapp_number'))->toBe(config('company.whatsapp_number'));
    expect(company_setting('whatsapp_url'))->toBe(config('company.whatsapp_url'));
    expect(company_setting('support_email'))->toBe(config('company.support_email'));
    expect(company_setting('address'))->toBe(config('company.address'));
    expect(company_setting('brand_color'))->toBe(config('company.brand_color'));
    expect(company_setting('logo_url'))->toBe(config('company.logo_url'));

    // Verify AppSetting::get also falls back
    expect(AppSetting::get('company_name'))->toBe(config('company.name'));
    expect(AppSetting::get('name'))->toBe(config('company.name'));
    expect(AppSetting::get('phone'))->toBe(config('company.phone'));
});

/* =========================================================================
 * 3. Saved values override config
 * ========================================================================= */

test('saved values override config', function () {
    AppSetting::truncate();

    AppSetting::set('company_name', 'Nisala Luxury Expeditions');
    AppSetting::set('company_phone', '+94 11 222 3344');
    AppSetting::set('company_support_email', 'help@nisalaexpeditions.com');

    // Both helper and model return the saved values
    expect(company_setting('name'))->toBe('Nisala Luxury Expeditions');
    expect(company_setting('company_name'))->toBe('Nisala Luxury Expeditions');
    expect(AppSetting::get('name'))->toBe('Nisala Luxury Expeditions');
    expect(AppSetting::get('company_name'))->toBe('Nisala Luxury Expeditions');

    expect(company_setting('phone'))->toBe('+94 11 222 3344');
    expect(AppSetting::get('company_phone'))->toBe('+94 11 222 3344');

    expect(company_setting('support_email'))->toBe('help@nisalaexpeditions.com');

    // Unset keys still fall back to config
    expect(company_setting('address'))->toBe(config('company.address'));
});

/* =========================================================================
 * 4. API Key Security: API key value never appears in any response
 * ========================================================================= */

test('the API key value never appears in any response', function () {
    $secretKey = 'super-secret-production-nisala-api-key-99999';
    config(['services.nisala_web.key' => $secretKey]);

    $superAdmin = User::factory()->superAdmin()->create();

    $response = $this->actingAs($superAdmin)->get(route('settings.index'));

    $response->assertStatus(200);

    // Assert that the secret key string NEVER appears in the HTML / JSON / Inertia payload
    $response->assertDontSee($secretKey);

    // Assert that only whether it is configured (boolean) is provided
    $page = $response->viewData('page');
    expect($page['props']['publicWebsite']['isApiKeyConfigured'])->toBeTrue();
    expect(json_encode($page))->not->toContain($secretKey);
});

/* =========================================================================
 * 5. Cache Clear: The cache button clears the public catalog cache
 * ========================================================================= */

test('the cache button clears the public catalog cache', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    // Populate public catalog cache
    Cache::put('public.destinations.all', ['dest1', 'dest2'], 3600);
    Cache::put('public.tours.all', ['tour1', 'tour2'], 3600);

    expect(Cache::has('public.destinations.all'))->toBeTrue();
    expect(Cache::has('public.tours.all'))->toBeTrue();

    // Trigger clear cache action
    $response = $this->actingAs($superAdmin)
        ->post(route('settings.clear-cache'));

    $response->assertRedirect();
    $response->assertSessionHas('success');

    // Assert cache was cleared
    expect(Cache::has('public.destinations.all'))->toBeFalse();
    expect(Cache::has('public.tours.all'))->toBeFalse();
});
