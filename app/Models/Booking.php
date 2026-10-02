<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\BookingStatus;
use App\Traits\Filterable;

class Booking extends Model
{
    use SoftDeletes, HasFactory, Filterable;

    protected $guarded = [];

    protected $casts = [
        'booking_date' => 'date',
        'travel_date' => 'date',
        'return_date' => 'date',
        'booking_status' => BookingStatus::class,
        'base_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'extras_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'balance_amount' => 'decimal:2',
        'extras' => 'array',
    ];

    /**
     * The customer this booking belongs to.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * The tour package this booking is for.
     */
    public function tourPackage(): BelongsTo
    {
        return $this->belongsTo(TourPackage::class);
    }

    /**
     * The staff member assigned to this booking.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'assigned_to');
    }

    /**
     * The travelers associated with this booking.
     */
    public function travelers(): HasMany
    {
        return $this->hasMany(BookingTraveler::class);
    }

    /**
     * The payments for this booking.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * The payment schedule installments for this booking.
     */
    public function paymentSchedules(): HasMany
    {
        return $this->hasMany(PaymentSchedule::class)->orderBy('due_date', 'asc');
    }

    /**
     * Threaded internal notes and timeline for this booking.
     */
    public function bookingNotes(): HasMany
    {
        return $this->hasMany(BookingNote::class)->whereNull('parent_id')->with(['user:id,name,email', 'replies'])->orderBy('created_at', 'desc');
    }

    /**
     * User who created the booking.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * User who last updated the booking.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Filterable configuration
    public function getSearchableColumns()
    {
        return ['booking_reference', 'customer.full_name', 'customer.first_name', 'customer.last_name', 'tourPackage.name'];
    }

    public function getFilterableColumns()
    {
        return ['booking_status'];
    }

    public function getSortableColumns()
    {
        return ['booking_reference', 'travel_date', 'booking_date', 'final_amount', 'booking_status', 'created_at'];
    }
}
