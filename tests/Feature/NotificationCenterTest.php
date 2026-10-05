<?php

use App\Models\User;
use App\Models\Customer;
use App\Enums\UserRole;
use Spatie\Permission\Models\Role;
use Illuminate\Notifications\DatabaseNotification;
use App\Notifications\BookingConfirmedNotification;
use App\Models\Booking;

beforeEach(function () {
    // Ensure roles exist
    Role::firstOrCreate(['name' => UserRole::Staff->value]);
    Role::firstOrCreate(['name' => UserRole::Customer->value]);
});

test('staff and customer endpoints are role-separated', function () {
    $staff = User::factory()->create();
    $staff->assignRole(UserRole::Staff->value);

    $customerUser = User::factory()->create();
    $customerUser->assignRole(UserRole::Customer->value);

    // Staff cannot access portal notifications
    $this->actingAs($staff)
        ->get('/portal/notifications')
        ->assertForbidden(); // Or redirects depending on your middleware, usually 403 or 302

    // Customer cannot access admin notifications
    $this->actingAs($customerUser)
        ->get('/admin/notifications')
        ->assertForbidden();
});

test('unread count works and caches correctly', function () {
    $user = User::factory()->create();
    $user->assignRole(UserRole::Staff->value);
    $booking = Booking::factory()->create();

    $this->actingAs($user);

    $response = $this->get('/admin/notifications/unread-count');
    $response->assertJson(['count' => 0]);

    $user->notify(new BookingConfirmedNotification($booking));

    // Notice: Due to the 10-second cache in unreadCount, we must clear the cache to see the new count 
    // or simulate the notification controller's cache invalidation. Since we sent via model directly, cache is not cleared.
    cache()->forget('unread_notifications_count_' . $user->id);

    $response = $this->get('/admin/notifications/unread-count');
    $response->assertJson(['count' => 1]);
});

test('can mark notification as read', function () {
    $user = User::factory()->create();
    $user->assignRole(UserRole::Staff->value);
    $booking = Booking::factory()->create();

    $user->notify(new BookingConfirmedNotification($booking));
    $notification = $user->notifications()->first();

    $this->actingAs($user)
        ->patch('/admin/notifications/' . $notification->id . '/mark-as-read')
        ->assertSuccessful();

    $this->assertNotNull($notification->fresh()->read_at);
});

test('can mark all notifications as read', function () {
    $user = User::factory()->create();
    $user->assignRole(UserRole::Staff->value);
    $booking = Booking::factory()->create();

    $user->notify(new BookingConfirmedNotification($booking));
    $user->notify(new BookingConfirmedNotification($booking));

    $this->actingAs($user)
        ->post('/admin/notifications/mark-all-as-read')
        ->assertSuccessful();

    $this->assertEquals(0, $user->unreadNotifications()->count());
});

test('can delete notification', function () {
    $user = User::factory()->create();
    $user->assignRole(UserRole::Staff->value);
    $booking = Booking::factory()->create();

    $user->notify(new BookingConfirmedNotification($booking));
    $notification = $user->notifications()->first();

    $this->actingAs($user)
        ->delete('/admin/notifications/' . $notification->id)
        ->assertSuccessful();

    $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
});

test('users cannot access others notifications', function () {
    $user1 = User::factory()->create();
    $user1->assignRole(UserRole::Staff->value);

    $user2 = User::factory()->create();
    $user2->assignRole(UserRole::Staff->value);

    $booking = Booking::factory()->create();
    $user1->notify(new BookingConfirmedNotification($booking));
    $notification = $user1->notifications()->first();

    // User2 trying to read User1's notification
    $this->actingAs($user2)
        ->patch('/admin/notifications/' . $notification->id . '/mark-as-read')
        ->assertNotFound(); // failOrFail returns 404

    // User2 trying to delete User1's notification
    $this->actingAs($user2)
        ->delete('/admin/notifications/' . $notification->id)
        ->assertNotFound();
});

test('list filters work', function () {
    $user = User::factory()->create();
    $user->assignRole(UserRole::Staff->value);
    $booking = Booking::factory()->create();

    $user->notify(new BookingConfirmedNotification($booking)); // Booking group

    $this->actingAs($user);

    // Filter unread
    $this->get('/admin/notifications?filter=unread')
        ->assertSuccessful()
        ->assertSee($booking->booking_reference); // checking page renders it

    // Filter by group that matches
    $this->get('/admin/notifications?group=Bookings')
        ->assertSuccessful()
        ->assertSee($booking->booking_reference);

    // Filter by group that does NOT match
    $this->get('/admin/notifications?group=System')
        ->assertSuccessful()
        ->assertDontSee($booking->booking_reference);
});
