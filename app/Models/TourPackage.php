<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TourPackage extends Model
{
    use HasFactory;

    protected $guarded = [];

    /**
     * Get the bookings for this tour package.
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
