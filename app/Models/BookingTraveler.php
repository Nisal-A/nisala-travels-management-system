<?php

namespace App\Models;

use App\Enums\TravelerType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingTraveler extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'dob' => 'date',
        'passport_expiry' => 'date',
        'traveler_type' => TravelerType::class,
    ];

    /**
     * The booking this traveler is part of.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * The customer this traveler might be linked to (if any).
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
