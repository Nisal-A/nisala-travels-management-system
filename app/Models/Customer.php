<?php

namespace App\Models;

use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class Customer extends Model
{
    use Filterable, HasFactory, Notifiable, SoftDeletes;

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
        'source',
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
     * Get the refunds for the customer.
     */
    public function refunds()
    {
        return $this->hasMany(Refund::class);
    }

    /**
     * Get the inquiries made by the customer.
     */
    public function inquiries()
    {
        return $this->hasMany(Inquiry::class);
    }

    // Filterable configuration
    public function getSearchableColumns()
    {
        return ['full_name', 'email', 'phone', 'passport_number', 'nic', 'customer_id'];
    }

    public function getFilterableColumns()
    {
        return ['status', 'gender'];
    }

    public function getSortableColumns()
    {
        return ['full_name', 'email', 'created_at', 'status', 'customer_id'];
    }
}
