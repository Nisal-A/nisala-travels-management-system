<?php

use App\Models\Booking;
use App\Models\CustomerDocument;
use App\Models\Payment;
use App\Models\PaymentSchedule;
use App\Models\Inquiry;
use App\Models\User;
use App\Notifications\BookingConfirmedNotification;
use App\Notifications\DocumentRejectedNotification;
use App\Notifications\TripReminderNotification;
use Illuminate\Support\Facades\Notification;

test('booking confirmed mailable renders correctly and prevents html injection', function () {
    $user = User::factory()->make();
    $user->full_name = 'John <script>alert("xss")</script> Doe';
    $booking = Booking::factory()->make(['booking_reference' => 'BK-123']);

    $notification = new BookingConfirmedNotification($booking);
    $mail = $notification->toMail($user);

    expect($mail->subject)->toBe('Booking Confirmed: BK-123');
    
    $rendered = $mail->render();
    
    // Check that the script tag is escaped (blade's {{ }} automatically escapes)
    expect($rendered)->toContain('John &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; Doe');
    expect($rendered)->toContain('BK-123');
});

test('trip reminder mailable renders correctly', function () {
    $user = User::factory()->make();
    $user->full_name = 'Jane Doe';
    $booking = Booking::factory()->make(['start_date' => now()->addDays(7)]);

    $notification = new TripReminderNotification($booking, 7);
    $mail = $notification->toMail($user);

    expect($mail->subject)->toBe('Upcoming Trip Reminder: 7 Days to Go!');
    
    $rendered = $mail->render();
    expect($rendered)->toContain('7 Days to Go!');
});
