<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'customer_id',
        'full_name',
        'nic',
        'passport_number',
        'dob',
        'gender',
        'nationality',
        'phone',
        'whatsapp',
        'email',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'status',
        'created_by',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'dob' => 'date',
    ];

    // ------------------------------------------------------------------
    // Relationships (minimal set for authorization policies — NT-005.3)
    // ------------------------------------------------------------------

    /**
     * The user account linked to this customer (if any).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The user who created this customer record.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the documents for the customer.
     */
    public function documents()
    {
        return $this->hasMany(CustomerDocument::class);
    }

    /**
     * Get the bookings for the customer.
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get the payments made by the customer.
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the inquiries made by the customer.
     */
    public function inquiries()
    {
        return $this->hasMany(Inquiry::class);
    }
}
