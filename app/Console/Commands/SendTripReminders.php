<?php

namespace App\Console\Commands;

use App\Enums\BookingStatus;
use App\Events\TripReminderDue;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SendTripReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:trip-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send trip reminders to customers 14, 7, and 1 days before departure';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $milestones = [14, 7, 1];
        $today = Carbon::today();
        
        $count = 0;

        foreach ($milestones as $days) {
            $targetDate = $today->copy()->addDays($days);

            $bookings = Booking::where('booking_status', BookingStatus::Confirmed)
                ->whereDate('travel_date', $targetDate)
                ->whereDoesntHave('reminders', function ($query) use ($days) {
                    $query->where('days_before', $days);
                })
                ->get();

            foreach ($bookings as $booking) {
                // Record the reminder so it's not sent again
                DB::table('booking_reminders')->insert([
                    'booking_id' => $booking->id,
                    'days_before' => $days,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                TripReminderDue::dispatch($booking, $days);
                $count++;
            }
        }

        $this->info("Sent {$count} trip reminders.");
    }
}
