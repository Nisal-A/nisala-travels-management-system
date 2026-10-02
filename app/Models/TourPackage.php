<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Cache;

class TourPackage extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected static function booted()
    {
        static::saved(function ($package) {
            Cache::flush(); // Simple cache clear for public pages
        });
        
        static::deleted(function ($package) {
            Cache::flush();
        });
    }

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function destination()
    {
        return $this->belongsTo(Destination::class);
    }

    /**
     * Get the bookings for this tour package.
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
