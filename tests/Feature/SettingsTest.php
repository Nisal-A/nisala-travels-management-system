<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_super_admin_can_update_general_settings()
    {
        $admin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($admin)->post(route('settings.general.update'), [
            'company_name' => 'Nisala Travels Updated',
            'contact_phone' => '+94771234567',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('settings', [
            'key' => 'company_name',
            'value' => 'Nisala Travels Updated',
        ]);
    }

    public function test_staff_cannot_update_general_settings()
    {
        $staff = User::factory()->staff()->create();

        $response = $this->actingAs($staff)->post(route('settings.general.update'), [
            'company_name' => 'Hacked Name',
        ]);

        $response->assertForbidden();
    }

    public function test_staff_can_update_appearance_settings()
    {
        $staff = User::factory()->staff()->create();

        $response = $this->actingAs($staff)->put(route('settings.appearance.update'), [
            'theme' => 'dark',
            'density' => 'compact',
        ]);

        $response->assertSessionHasNoErrors();
        
        $staff->refresh();
        $this->assertEquals('dark', $staff->preferences['theme']);
        $this->assertEquals('compact', $staff->preferences['density']);
    }

    public function test_staff_can_access_settings_page()
    {
        $staff = User::factory()->staff()->create();
        
        $response = $this->actingAs($staff)->get(route('settings.index'));
        
        $response->assertOk();
    }
}
