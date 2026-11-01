<?php

use App\Enums\UserRole;
use App\Models\User;
use App\Reports\ReportRegistry;
use Database\Seeders\ReportPermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(ReportPermissionSeeder::class);
});

/**
 * Build the full matrix of [role, route, expected_status].
 */
function reportRouteMatrixDataset(): array
{
    // Boot a registry instance to get all registered reports
    $registry = new ReportRegistry();
    $reports = $registry->all();

    $roles = [
        'guest',
        'customer',
        'super_admin',
        'manager',
        'staff',
        'finance',
    ];

    $matrix = [];

    foreach ($roles as $role) {
        // 1. Hub route: /reports
        $hubStatus = match ($role) {
            'guest' => 302,
            'customer' => 403,
            'super_admin', 'manager', 'staff', 'finance' => 200,
        };
        $matrix["{$role} -> GET /reports [{$hubStatus}]"] = [
            'role' => $role,
            'route' => '/reports',
            'expectedStatus' => $hubStatus,
        ];

        // 2. Each registered report's endpoints
        foreach ($reports as $key => $report) {
            $isFinancial = $report->category() === 'financial';
            $isOperational = $report->category() === 'operational';

            $expectedStatus = match ($role) {
                'guest' => 302,
                'customer' => 403,
                'super_admin', 'manager' => 200,
                'staff' => $isOperational ? 200 : 403,
                'finance' => $isFinancial ? 200 : 403,
            };

            // View route
            $matrix["{$role} -> GET /reports/{$key} [{$expectedStatus}]"] = [
                'role' => $role,
                'route' => "/reports/{$key}",
                'expectedStatus' => $expectedStatus,
            ];

            // Data route
            $matrix["{$role} -> GET /reports/{$key}/data [{$expectedStatus}]"] = [
                'role' => $role,
                'route' => "/reports/{$key}/data",
                'expectedStatus' => $expectedStatus,
            ];

            // Export route (CSV)
            $matrix["{$role} -> GET /reports/{$key}/export/csv [{$expectedStatus}]"] = [
                'role' => $role,
                'route' => "/reports/{$key}/export/csv",
                'expectedStatus' => $expectedStatus,
            ];
        }
    }

    return $matrix;
}

test('report route matrix: every report route x every role returns expected status', function (string $role, string $route, int $expectedStatus) {
    $request = match ($role) {
        'guest' => $this,
        'customer' => $this->actingAs(User::factory()->customer()->create()),
        'super_admin' => $this->actingAs(User::factory()->superAdmin()->create()),
        'manager' => $this->actingAs(User::factory()->manager()->create()),
        'staff' => $this->actingAs(User::factory()->staff()->create()),
        'finance' => $this->actingAs(User::factory()->finance()->create()),
    };

    $response = $request->get($route);

    if ($expectedStatus === 302) {
        $response->assertRedirect('/login');
    } else {
        $response->assertStatus($expectedStatus);
    }
})->with(reportRouteMatrixDataset());

test('summary tiles are cached for 5 minutes in database cache keyed by report filters and role', function () {
    $staff = User::factory()->staff()->create();
    $report = (new ReportRegistry())->get('booking-register');

    expect($report)->not->toBeNull();

    $filters = ['status' => 'confirmed'];
    $cacheKey = $report->summaryCacheKey($filters, $staff);

    // Initial state: cache key does not exist
    Cache::store('database')->forget($cacheKey);
    expect(Cache::store('database')->has($cacheKey))->toBeFalse();

    // Call data endpoint
    $response = $this->actingAs($staff)->getJson('/reports/booking-register/data?status=confirmed');
    $response->assertOk();

    // Summary tiles must now be in database cache
    expect(Cache::store('database')->has($cacheKey))->toBeTrue();

    $cached = Cache::store('database')->get($cacheKey);
    expect($cached)->toBeArray();
    expect($cached)->toEqual($response->json('summary'));
});

test('row data is never cached when fetching reports', function () {
    $staff = User::factory()->staff()->create();
    $report = (new ReportRegistry())->get('booking-register');

    $filters = [];
    $cacheKey = $report->summaryCacheKey($filters, $staff);

    $response1 = $this->actingAs($staff)->getJson('/reports/booking-register/data');
    $response1->assertOk();
    $initialTotal = $response1->json('total');

    // Create a new booking
    \App\Models\Booking::factory()->create();

    // Next request: summary may be cached, but row data / total must be live
    $response2 = $this->actingAs($staff)->getJson('/reports/booking-register/data');
    $response2->assertOk();

    // Total rows increased immediately because row data is never cached
    expect($response2->json('total'))->toBe($initialTotal + 1);
});

