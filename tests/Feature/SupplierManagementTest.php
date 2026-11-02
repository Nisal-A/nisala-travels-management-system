<?php

use App\Enums\SupplierType;
use App\Models\Supplier;
use App\Models\User;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->superAdmin = User::factory()->superAdmin()->create();
    $this->manager = User::factory()->manager()->create();
    $this->finance = User::factory()->finance()->create();
    $this->staff = User::factory()->staff()->create();
    $this->customer = User::factory()->customer()->create();
});

test('supplier numbers are generated matching SUP-NNNN', function () {
    $supplier1 = Supplier::create([
        'name' => 'Supplier Alpha',
        'type' => SupplierType::Hotel,
        'default_currency' => 'LKR',
    ]);

    $supplier2 = Supplier::create([
        'name' => 'Supplier Beta',
        'type' => SupplierType::Transport,
        'default_currency' => 'USD',
    ]);

    expect($supplier1->supplier_code)->toMatch('/^SUP-\d{4}$/');
    expect($supplier2->supplier_code)->toMatch('/^SUP-\d{4}$/');
    expect($supplier1->supplier_code)->not->toEqual($supplier2->supplier_code);
});

test('allowed roles (super_admin, manager, finance) can view suppliers list', function ($user) {
    Supplier::factory()->count(2)->create();

    $this->actingAs($user)
        ->get(route('suppliers.index'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page->component('Suppliers/Index'));
})->with([
    fn () => $this->superAdmin,
    fn () => $this->manager,
    fn () => $this->finance,
]);

test('staff and customer receive 403 on suppliers list', function ($user) {
    $this->actingAs($user)
        ->get(route('suppliers.index'))
        ->assertStatus(403);
})->with([
    fn () => $this->staff,
    fn () => $this->customer,
]);

test('finance can create a supplier', function () {
    $response = $this->actingAs($this->finance)
        ->post(route('suppliers.store'), [
            'name' => 'Blue Water Resort',
            'type' => 'hotel',
            'contact_name' => 'John Perera',
            'phone' => '+94771234567',
            'email' => 'contact@bluewater.lk',
            'default_currency' => 'LKR',
            'is_active' => true,
            'notes' => 'Preferred beach hotel',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('suppliers.index'));

    $supplier = Supplier::where('name', 'Blue Water Resort')->first();
    expect($supplier)->not->toBeNull();
    expect($supplier->supplier_code)->toMatch('/^SUP-\d{4}$/');
    expect($supplier->type)->toBe(SupplierType::Hotel);
});

test('manager can update a supplier', function () {
    $supplier = Supplier::factory()->create([
        'name' => 'Old Name',
        'is_active' => true,
    ]);

    $response = $this->actingAs($this->manager)
        ->put(route('suppliers.update', $supplier), [
            'name' => 'Updated Resort',
            'type' => 'hotel',
            'default_currency' => 'USD',
            'is_active' => false,
        ]);

    $response->assertSessionHasNoErrors();
    $supplier->refresh();
    expect($supplier->name)->toBe('Updated Resort');
    expect($supplier->is_active)->toBeFalse();
});

test('super admin can delete a supplier via soft delete', function () {
    $supplier = Supplier::factory()->create();

    $response = $this->actingAs($this->superAdmin)
        ->delete(route('suppliers.destroy', $supplier));

    $response->assertSessionHasNoErrors();
    expect($supplier->fresh()->trashed())->toBeTrue();
});
