<?php

namespace App\Events;

use App\Models\Booking;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TripReminderDue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $booking;
    public $daysBefore;

    public function __construct(Booking $booking, int $daysBefore)
    {
        $this->booking = $booking;
        $this->daysBefore = $daysBefore;
    }
}
