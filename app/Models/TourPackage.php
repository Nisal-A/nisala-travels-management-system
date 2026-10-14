<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;

class TourPackage extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];


    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'itinerary' => 'array',
        'highlights' => 'array',
        'tags' => 'array',
        'departure_months' => 'array',
        'faqs' => 'array',
        'gallery' => 'array',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function scopePublished($query)
    {
        return $query->where('status', 'active')->where('is_active', true);
    }

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
