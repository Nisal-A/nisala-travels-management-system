<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
        'group_min' => 'integer',
        'group_max' => 'integer',
    ];

    /**
     * Scope to published packages (status = active AND is_active = true).
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'active')->where('is_active', true);
    }

    /**
     * Scope to public listed packages (active, is_active, and destination is publicListed).
     */
    public function scopePublicListed($query)
    {
        return $query->where('status', 'active')
            ->where('is_active', true)
            ->whereHas('destination', function ($q) {
                $q->publicListed();
            });
    }

    /**
     * Human-readable tier label from config.
     */
    public function getTierLabelAttribute(): ?string
    {
        return $this->tier ? config("tour_tiers.tiers.{$this->tier}.label") : null;
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

    /**
     * Get the cost lines for this tour package.
     */
    public function costLines()
    {
        return $this->hasMany(PackageCostLine::class);
    }
}
