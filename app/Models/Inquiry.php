<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use RuntimeException;

class Inquiry extends Model
{
    use HasFactory;

    protected $fillable = [
        // Existing columns
        'customer_id',
        'name',
        'contact_information',
        'destination',
        'package_interest',
        'travel_date',
        'number_of_travelers',
        'message',
        'status',
        'assigned_to',
        'source',
        'follow_up_information',

        // Step 1C columns
        'reference',
        'interest',
        'tour_package_id',
        'destination_id',
        'email',
        'phone',
        'preferred_contact',
        'country',
        'start_date',
        'end_date',
        'flexible_dates',
        'adults',
        'children',
        'child_ages',
        'budget_range',
        'referral_source',
        'privacy_consent_at',
        'marketing_consent_at',
        'ip_hash',
        'user_agent',
        'submitted_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'travel_date' => 'date',
        'flexible_dates' => 'boolean',
        'child_ages' => 'array',
        'privacy_consent_at' => 'datetime',
        'marketing_consent_at' => 'datetime',
        'submitted_at' => 'datetime',
    ];

    public function tourPackage(): BelongsTo
    {
        return $this->belongsTo(TourPackage::class);
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'assigned_to');
    }

    public static function generateReference(): string
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $reference = 'NT-'.Str::upper(Str::random(8));

            if (!static::where('reference', $reference)->exists()) {
                return $reference;
            }
        }

        throw new RuntimeException('Failed to generate a unique inquiry reference after 5 attempts.');
    }
}
