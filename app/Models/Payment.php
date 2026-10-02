<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Filterable;

class Payment extends Model
{
    use SoftDeletes, \Illuminate\Database\Eloquent\Factories\HasFactory, Filterable;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'payment_date' => 'date',
            'payment_method' => \App\Enums\PaymentMethod::class,
            'status' => \App\Enums\PaymentStatus::class,
        ];
    }

    // ------------------------------------------------------------------
    // Relationships (minimal set for authorization policies — NT-005.3)
    // ------------------------------------------------------------------

    /**
     * The customer this payment belongs to.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * The booking this payment is associated with.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * The user who recorded this payment.
     */
    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    // Filterable configuration
    public function getSearchableColumns()
    {
        return ['receipt_number', 'reference_number', 'customer.full_name', 'customer.first_name', 'customer.last_name', 'booking.booking_reference'];
    }

    public function getFilterableColumns()
    {
        return ['status', 'payment_method'];
    }

    public function getSortableColumns()
    {
        return ['receipt_number', 'payment_date', 'amount', 'status', 'created_at'];
    }
}
