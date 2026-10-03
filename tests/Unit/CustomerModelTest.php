<?php

use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('can create customer with factory', function () {
    $customer = Customer::factory()->create();

    expect($customer)->toBeInstanceOf(Customer::class)
        ->and($customer->customer_id)->not->toBeNull()
        ->and($customer->full_name)->not->toBeNull()
        ->and($customer->status)->toBe('active');

    $this->assertModelExists($customer);
});

test('nic must be unique', function () {
    Customer::factory()->create(['nic' => '123456789V']);

    // Attempt to create another with the same NIC
    expect(fn () => Customer::factory()->create(['nic' => '123456789V']))
        ->toThrow(QueryException::class, 'Integrity constraint violation');
});

test('can have creator', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create(['created_by' => $user->id]);

    expect($customer->creator)->toBeInstanceOf(User::class)
        ->and($customer->creator->id)->toBe($user->id);
});

test('can soft delete customer', function () {
    $customer = Customer::factory()->create();

    $customer->delete();

    $this->assertSoftDeleted($customer);
});
