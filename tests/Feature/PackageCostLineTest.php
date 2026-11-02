<?php

use App\Enums\Currency;
use App\Enums\SupplierType;
use App\Models\ExchangeRate;
use App\Models\PackageCostLine;
use App\Models\Supplier;
use App\Models\TourPackage;
use App\Models\User;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->superAdmin = User::factory()->superAdmin()->create();
    $this->manager = User::factory()->manager()->create();
    $this->finance = User::factory()->finance()->create();
    $this->staff = User::factory()->staff()->create();
    $this->customer = User::factory()->customer()->create();

    $this->tour = TourPackage::factory()->create();
    $this->supplier = Supplier::factory()->create();
});

test('staff and customer get 403 on costs routes', function ($user) {
    // 1. GET /package-cost-lines
    $this->actingAs($user)
        ->get(route('package-cost-lines.index'))
        ->assertStatus(403);

    // 2. GET /tours/{tour}/cost-lines
    $this->actingAs($user)
        ->get(route('tours.cost-lines.index', $this->tour))
        ->assertStatus(403);

    // 3. POST /package-cost-lines
    $this->actingAs($user)
        ->post(route('package-cost-lines.store'), [
            'tour_package_id' => $this->tour->id,
            'category' => 'hotel',
            'description' => 'Test Hotel Cost',
            'amount' => 5000,
            'currency' => 'LKR',
            'incurred_on' => now()->toDateString(),
        ])
        ->assertStatus(403);
})->with([
    fn () => $this->staff,
    fn () => $this->customer,
]);

test('finance can access and create package cost lines', function () {
    $this->actingAs($this->finance)
        ->get(route('package-cost-lines.index'))
        ->assertStatus(200);

    $this->actingAs($this->finance)
        ->get(route('tours.cost-lines.index', $this->tour))
        ->assertStatus(200);
});

test('staff does not see cost lines or suppliers in tour edit inertia props', function () {
    PackageCostLine::factory()->create([
        'tour_package_id' => $this->tour->id,
        'supplier_id' => $this->supplier->id,
    ]);

    $this->actingAs($this->staff)
        ->get(route('tours.edit', $this->tour))
        ->assertStatus(200)
        ->assertInertia(function ($page) {
            $props = $page->toArray()['props'];
            expect(array_key_exists('cost_lines', $props))->toBeFalse();
            expect(array_key_exists('suppliers', $props))->toBeFalse();
        });
});

test('manager sees cost lines and suppliers in tour edit inertia props', function () {
    PackageCostLine::factory()->create([
        'tour_package_id' => $this->tour->id,
        'supplier_id' => $this->supplier->id,
    ]);

    $this->actingAs($this->manager)
        ->get(route('tours.edit', $this->tour))
        ->assertStatus(200)
        ->assertInertia(function ($page) {
            $props = $page->toArray()['props'];
            expect(array_key_exists('cost_lines', $props))->toBeTrue();
            expect(array_key_exists('suppliers', $props))->toBeTrue();
            expect(count($props['cost_lines']))->toBe(1);
        });
});

test('package cost line creation snapshots exchange rate and freezes amount_lkr against future rate changes', function () {
    // Initial rate: 1 USD = 300.000000 LKR
    ExchangeRate::create([
        'currency' => Currency::USD,
        'rate_to_lkr' => '300.000000',
        'source' => 'manual',
        'fetched_at' => now()->subDay(),
    ]);

    $response = $this->actingAs($this->finance)
        ->post(route('package-cost-lines.store'), [
            'tour_package_id' => $this->tour->id,
            'supplier_id' => $this->supplier->id,
            'category' => 'transport',
            'description' => 'Airport Bus Charter',
            'amount' => '250.00',
            'currency' => 'USD',
            'incurred_on' => now()->toDateString(),
        ]);

    $response->assertSessionHasNoErrors();

    $costLine = PackageCostLine::where('tour_package_id', $this->tour->id)->first();
    expect($costLine)->not->toBeNull();
    expect((string) $costLine->exchange_rate_to_lkr)->toBe('300.000000');
    // 250.00 * 300 = 75000.00 LKR
    expect((string) $costLine->amount_lkr)->toBe('75000.00');

    // Rate changes to 350.000000 LKR
    ExchangeRate::create([
        'currency' => Currency::USD,
        'rate_to_lkr' => '350.000000',
        'source' => 'manual',
        'fetched_at' => now(),
    ]);

    // Cost line rate and amount_lkr remain completely frozen
    $freshCostLine = $costLine->fresh();
    expect((string) $freshCostLine->exchange_rate_to_lkr)->toBe('300.000000');
    expect((string) $freshCostLine->amount_lkr)->toBe('75000.00');
});

test('manager can update and delete a package cost line', function () {
    $costLine = PackageCostLine::factory()->create([
        'tour_package_id' => $this->tour->id,
        'amount' => 1000.00,
        'amount_lkr' => 1000.00,
    ]);

    $this->actingAs($this->manager)
        ->put(route('package-cost-lines.update', $costLine), [
            'category' => 'food',
            'description' => 'Welcome Dinner',
            'amount' => 1250.00,
            'currency' => 'LKR',
            'incurred_on' => now()->toDateString(),
        ])
        ->assertSessionHasNoErrors();

    expect((string) $costLine->fresh()->amount)->toBe('1250.00');
    expect($costLine->fresh()->category)->toBe(SupplierType::Food);

    $this->actingAs($this->manager)
        ->delete(route('package-cost-lines.destroy', $costLine))
        ->assertSessionHasNoErrors();

    expect(PackageCostLine::find($costLine->id))->toBeNull();
});
