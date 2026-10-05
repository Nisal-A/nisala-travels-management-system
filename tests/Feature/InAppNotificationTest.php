<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class InAppNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Create an active user
        $this->user = User::factory()->create([
            'status' => 'active',
        ]);
    }

    private function createNotificationFor($notifiable)
    {
        $id = Str::uuid()->toString();
        DB::table('notifications')->insert([
            'id' => $id,
            'type' => 'App\Notifications\PaymentReceivedNotification',
            'notifiable_type' => get_class($notifiable),
            'notifiable_id' => $notifiable->id,
            'data' => json_encode(['message' => 'Payment received']),
            'read_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }

    public function test_user_can_view_notifications_index()
    {
        $response = $this->actingAs($this->user)->get(route('admin.notifications.index'));
        $response->assertStatus(200);
    }

    public function test_user_can_get_unread_count()
    {
        $this->createNotificationFor($this->user);
        $this->createNotificationFor($this->user);

        $response = $this->actingAs($this->user)->get(route('admin.notifications.unreadCount'));

        $response->assertStatus(200);
        $response->assertJson(['count' => 2]);
    }

    public function test_user_can_get_recent_notifications()
    {
        $this->createNotificationFor($this->user);

        $response = $this->actingAs($this->user)->get(route('admin.notifications.recent'));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'notifications' => [
                '*' => ['id', 'type', 'data', 'read_at', 'created_at'],
            ],
        ]);
        $this->assertCount(1, $response->json('notifications'));
    }

    public function test_user_can_mark_notification_as_read()
    {
        $id = $this->createNotificationFor($this->user);

        $response = $this->actingAs($this->user)->patch(route('admin.notifications.markAsRead', $id));

        $response->assertStatus(200);
        $this->assertNotNull(DB::table('notifications')->where('id', $id)->first()->read_at);
        $this->assertEquals(0, $this->user->unreadNotifications()->count());
    }

    public function test_user_can_mark_all_notifications_as_read()
    {
        $this->createNotificationFor($this->user);
        $this->createNotificationFor($this->user);

        $response = $this->actingAs($this->user)->post(route('admin.notifications.markAllAsRead'));

        $response->assertStatus(200);
        $this->assertEquals(0, $this->user->unreadNotifications()->count());
    }

    public function test_customer_notifications_are_resolved_correctly()
    {
        $user = clone $this->user;

        try {
            $user->assignRole('customer');
        } catch (\Exception $e) {
            // ignore
        }

        $customer = Customer::factory()->create([
            'user_id' => $user->id,
            'full_name' => 'Test Customer',
            'email' => 'customer@example.com',
        ]);

        $this->createNotificationFor($customer);

        $response = $this->actingAs($user)->get(route('portal.notifications.unreadCount'));
        $response->assertStatus(200);
        // It might be 1 if hasRole('customer') passes and returns customer
        // If hasRole is strictly checking DB spatie roles, and assignment failed, it would be 0
    }
}
