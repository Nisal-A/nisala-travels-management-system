<?php

use App\Enums\UserRole;
use App\Models\Destination;
use App\Models\Inquiry;
use App\Models\NotificationPreference;
use App\Models\TourPackage;
use App\Models\User;
use App\Notifications\NewInquiryNotification;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(function () {
    config([
        'services.nisala_web.key' => 'test-valid-api-key',
        'services.nisala_web.ip_salt' => 'test-ip-salt',
    ]);
    $this->seed(RoleSeeder::class);
});

function validLeadPayload(array $overrides = []): array
{
    return array_merge([
        'interest' => 'A specific tour',
        'tour_slug' => 'thailand-heritage-tour',
        'destination_slug' => 'thailand',
        'start_date' => now()->addDays(7)->format('Y-m-d'),
        'end_date' => now()->addDays(14)->format('Y-m-d'),
        'flexible_dates' => false,
        'adults' => 2,
        'children' => 0,
        'full_name' => 'Alice Wanderer',
        'email' => 'alice.wanderer@example.com',
        'phone' => '+94771239876',
        'preferred_contact' => 'whatsapp',
        'country' => 'United Kingdom',
        'message' => 'Looking for a private chauffeur-guided tour.',
        'budget_range' => 'LKR 150,000 to 300,000',
        'referral_source' => 'Google search',
        'privacy_consent' => true,
        'marketing_consent' => true,
    ], $overrides);
}

function createLeadTourAndDestination(): array
{
    $destination = Destination::create([
        'slug' => 'thailand',
        'country' => 'Thailand',
        'city_region' => 'Bangkok & Central',
        'status' => 'active',
    ]);

    $tour = TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Thailand Heritage Tour',
        'slug' => 'thailand-heritage-tour',
        'price' => 120000,
        'status' => 'active',
        'is_active' => true,
    ]);

    return [$destination, $tour];
}

test('users with super_admin, manager, and staff receive exactly one notification while finance and customer receive none', function () {
    createLeadTourAndDestination();

    $superAdmin = User::factory()->superAdmin()->create();
    $manager = User::factory()->manager()->create();
    $staff = User::factory()->staff()->create();
    $finance = User::factory()->finance()->create();
    $customer = User::factory()->customer()->create();

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->postJson('/api/public/inquiries', validLeadPayload());

    $response->assertStatus(201);

    expect($superAdmin->notifications()->count())->toBe(1)
        ->and($manager->notifications()->count())->toBe(1)
        ->and($staff->notifications()->count())->toBe(1)
        ->and($finance->notifications()->count())->toBe(0)
        ->and($customer->notifications()->count())->toBe(0);
});

test('notifications table stores row with correct type, relative URL, and privacy-safe body', function () {
    createLeadTourAndDestination();

    $staff = User::factory()->staff()->create();

    $payload = validLeadPayload([
        'full_name' => 'Bob Explorer',
        'email' => 'bob.secret@example.com',
        'phone' => '+94770001122',
        'message' => 'Super confidential trip instructions',
    ]);

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->postJson('/api/public/inquiries', $payload);

    $response->assertStatus(201);
    $reference = $response->json('reference');
    $inquiry = Inquiry::where('reference', $reference)->firstOrFail();

    $notification = DB::table('notifications')
        ->where('notifiable_id', $staff->id)
        ->where('type', NewInquiryNotification::class)
        ->first();

    expect($notification)->not->toBeNull();

    $data = json_decode($notification->data, true);

    expect($data['url'])->toBe("/admin/inquiries/{$inquiry->id}")
        ->and($data['type'])->toBe('NewInquiryNotification')
        ->and($data['title'])->toBe('New enquiry received')
        ->and($data['body'])->toContain('Bob Explorer')
        ->and($data['body'])->toContain($reference)
        ->and($data['body'])->not->toContain('bob.secret@example.com')
        ->and($data['body'])->not->toContain('+94770001122')
        ->and($data['body'])->not->toContain('Super confidential trip instructions')
        ->and($data['data']['id'])->toBe($inquiry->id)
        ->and($data['data']['reference'])->toBe($reference);
});

test('staff unread notifications count increments by one', function () {
    createLeadTourAndDestination();

    $staff = User::factory()->staff()->create();
    expect($staff->unreadNotifications()->count())->toBe(0);

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->postJson('/api/public/inquiries', validLeadPayload());

    $response->assertStatus(201);

    expect($staff->unreadNotifications()->count())->toBe(1);
});

test('if staff user preference for new_inquiry on database channel is disabled, no row is stored for that user', function () {
    createLeadTourAndDestination();

    $staff = User::factory()->staff()->create();

    NotificationPreference::create([
        'user_id' => $staff->id,
        'type' => 'new_inquiry',
        'channel' => 'database',
        'enabled' => false,
    ]);
    Cache::forget("user_{$staff->id}_notification_prefs");

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->postJson('/api/public/inquiries', validLeadPayload());

    $response->assertStatus(201);

    expect($staff->notifications()->count())->toBe(0);
});
