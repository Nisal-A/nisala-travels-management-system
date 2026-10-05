<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingReminder extends Model
{
    protected $fillable = ['booking_id', 'days_before'];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
