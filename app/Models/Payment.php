<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use Filterable, \Illuminate\Database\Eloquent\Factories\HasFactory, SoftDeletes;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'exchange_rate_to_lkr' => 'decimal:6',
            'amount_lkr' => 'decimal:2',
            'payment_date' => 'date',
            'payment_method' => PaymentMethod::class,
            'status' => PaymentStatus::class,
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

    /**
     * The receipt generated for this payment.
     */
    public function receipt(): HasOne
    {
        return $this->hasOne(PaymentReceipt::class);
    }

    // Filterable configuration
    public function getSearchableColumns()
    {
        return ['receipt.receipt_number', 'reference_number', 'customer.full_name', 'booking.booking_reference'];
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
