<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'staff']);
        Role::firstOrCreate(['name' => 'super_admin']);
        Role::firstOrCreate(['name' => 'manager']);
        Role::firstOrCreate(['name' => 'finance']);
    }

    public function test_profile_page_is_displayed()
    {
        $user = User::factory()->create();
        $user->assignRole('staff');

        $response = $this->actingAs($user)->get('/profile');

        $response->assertStatus(200);
    }

    public function test_profile_information_can_be_updated()
    {
        $user = User::factory()->create();
        $user->assignRole('staff');

        $response = $this->actingAs($user)->patch('/profile', [
            'name' => 'Test User',
            'phone' => '1234567890',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('1234567890', $user->phone);
    }

    public function test_password_can_be_updated()
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
        ]);
        $user->assignRole('staff');

        $response = $this->actingAs($user)->put('/profile/password', [
            'current_password' => 'password123',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertTrue(Hash::check('new-password', $user->refresh()->password));
    }

    public function test_correct_password_must_be_provided_to_update_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
        ]);
        $user->assignRole('staff');

        $response = $this->actingAs($user)->put('/profile/password', [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertSessionHasErrors('current_password');
    }

    public function test_avatar_can_be_uploaded_and_deleted()
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $user->assignRole('staff');

        $file = UploadedFile::fake()->create('avatar.jpg', 1500, 'image/jpeg');

        $response = $this->actingAs($user)->post('/profile/avatar', [
            'avatar' => $file,
        ]);

        $response->assertSessionHasNoErrors();
        
        $user->refresh();
        $this->assertNotNull($user->avatar_path);
        Storage::disk('public')->assertExists($user->avatar_path);

        // Test delete
        $response = $this->actingAs($user)->delete('/profile/avatar');
        
        $response->assertSessionHasNoErrors();
        
        Storage::disk('public')->assertMissing($user->avatar_path);
        $user->refresh();
        $this->assertNull($user->avatar_path);
    }
    
    public function test_avatar_validation_fails_for_large_file()
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $user->assignRole('staff');

        // 3MB file
        $file = UploadedFile::fake()->create('avatar.jpg', 3000, 'image/jpeg');

        $response = $this->actingAs($user)->post('/profile/avatar', [
            'avatar' => $file,
        ]);

        $response->assertSessionHasErrors('avatar');
    }
}
