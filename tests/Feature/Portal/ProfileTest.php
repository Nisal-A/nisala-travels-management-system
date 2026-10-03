<?php

namespace Tests\Feature\Portal;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // create roles
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
    }

    public function test_profile_update_validation()
    {
        $user = User::factory()->create();
        $user->assignRole('customer');
        $customer = Customer::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->patch(route('portal.profile.update'), [
            'full_name' => '', // Required
            'email' => 'invalid-email', // Must be valid email
        ]);

        $response->assertSessionHasErrors(['full_name', 'email']);
    }

    public function test_profile_update_success()
    {
        $user = User::factory()->create();
        $user->assignRole('customer');
        $customer = Customer::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->patch(route('portal.profile.update'), [
            'full_name' => 'New Name',
            'email' => 'newemail@example.com',
            'phone' => '1234567890',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'New Name', 'email' => 'newemail@example.com']);
        $this->assertDatabaseHas('customers', ['id' => $customer->id, 'full_name' => 'New Name', 'phone' => '1234567890']);
    }

    public function test_password_change_rules()
    {
        $user = User::factory()->create([
            'password' => Hash::make('OldPassword123!'),
        ]);
        $user->assignRole('customer');
        $customer = Customer::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->put(route('portal.password.update'), [
            'current_password' => 'WrongPassword!',
            'password' => 'New', // Too short
            'password_confirmation' => 'New',
        ]);

        $response->assertSessionHasErrors(['current_password', 'password']);

        // Correct format but no match
        $response = $this->actingAs($user)->put(route('portal.password.update'), [
            'current_password' => 'OldPassword123!',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'DifferentPassword123!',
        ]);

        $response->assertSessionHasErrors(['password']);

        // Success
        $response = $this->actingAs($user)->put(route('portal.password.update'), [
            'current_password' => 'OldPassword123!',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertTrue(Hash::check('NewPassword123!', $user->fresh()->password));
    }
}
