<?php

use App\Models\Customer;
use App\Models\User;
use App\Enums\UserRole;

use Spatie\Permission\Models\Role;

function actAsRole(string $roleName): User {
    Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
    $user = User::factory()->create();
    $user->assignRole($roleName);
    return $user;
}

test('office users can view customer list', function () {
    $user = actAsRole(UserRole::Manager->value);
    
    $response = $this->actingAs($user)->get('/customers');

    $response->assertStatus(200);
});

test('finance users cannot view customer list', function () {
    $user = actAsRole(UserRole::Finance->value);
    
    $response = $this->actingAs($user)->get('/customers');

    $response->assertStatus(403);
});

test('customer users cannot view customer list', function () {
    $user = actAsRole(UserRole::Customer->value);
    
    $response = $this->actingAs($user)->get('/customers');

    $response->assertStatus(403);
});

test('manager can create customer', function () {
    $user = actAsRole(UserRole::Manager->value);
    
    $response = $this->actingAs($user)->post('/customers', [
        'full_name' => 'John Doe',
        'email' => 'john@example.com',
        'phone' => '+1234567890',
        'status' => 'active',
    ]);

    $response->assertRedirect('/customers');
    $this->assertDatabaseHas('customers', [
        'full_name' => 'John Doe',
        'email' => 'john@example.com',
    ]);
});

test('manager can update customer', function () {
    $user = actAsRole(UserRole::Manager->value);
    $customer = Customer::factory()->create();
    
    $response = $this->actingAs($user)->put("/customers/{$customer->id}", [
        'full_name' => 'Updated Name',
        'email' => 'updated@example.com',
        'phone' => '+1234567890',
        'status' => 'active',
    ]);

    $response->assertRedirect('/customers');
    $this->assertDatabaseHas('customers', [
        'id' => $customer->id,
        'full_name' => 'Updated Name',
    ]);
});

test('manager can delete customer', function () {
    $user = actAsRole(UserRole::Manager->value);
    $customer = Customer::factory()->create();
    
    $response = $this->actingAs($user)->delete("/customers/{$customer->id}");

    $response->assertRedirect('/customers');
    $this->assertSoftDeleted('customers', [
        'id' => $customer->id,
    ]);
});

test('staff cannot delete customer', function () {
    $user = actAsRole(UserRole::Staff->value);
    $customer = Customer::factory()->create();
    
    $response = $this->actingAs($user)->delete("/customers/{$customer->id}");

    $response->assertStatus(403);
});

test('validation prevents duplicate nic on creation', function () {
    $user = actAsRole(UserRole::Manager->value);
    Customer::factory()->create(['nic' => '12345V']);
    
    $response = $this->actingAs($user)->post('/customers', [
        'full_name' => 'John Doe',
        'email' => 'john@example.com',
        'phone' => '+1234567890',
        'status' => 'active',
        'nic' => '12345V',
    ]);

    $response->assertSessionHasErrors(['nic']);
});

test('users can search customers', function () {
    $user = actAsRole(UserRole::Manager->value);
    
    Customer::factory()->create(['full_name' => 'John Doe']);
    Customer::factory()->create(['full_name' => 'Jane Smith']);
    
    $response = $this->actingAs($user)->get('/customers?search=John');
    
    $response->assertStatus(200);
    $response->assertSee('John Doe');
    $response->assertDontSee('Jane Smith');
});

test('users can filter customers by status', function () {
    $user = actAsRole(UserRole::Manager->value);
    
    Customer::factory()->create(['full_name' => 'Active Customer', 'status' => 'active']);
    Customer::factory()->create(['full_name' => 'Inactive Customer', 'status' => 'inactive']);
    
    $response = $this->actingAs($user)->get('/customers?status=active');
    
    $response->assertStatus(200);
    $response->assertSee('Active Customer');
    $response->assertDontSee('Inactive Customer');
});
