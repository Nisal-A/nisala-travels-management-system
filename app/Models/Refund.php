<?php

namespace App\Models;

use App\Enums\Currency;
use App\Enums\RefundStatus;
use App\Services\Currency\ExchangeRateService;
use App\Services\NumberGenerator;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Refund extends Model
{
    use HasFactory, SoftDeletes, Filterable;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'cancellation_charge' => 'decimal:2',
            'exchange_rate_to_lkr' => 'decimal:6',
            'amount_lkr' => 'decimal:2',
            'status' => RefundStatus::class,
            'approved_at' => 'datetime',
            'paid_on' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Refund $refund) {
            if (empty($refund->refund_number)) {
                $year = $refund->created_at ? (int) $refund->created_at->format('Y') : (int) now()->format('Y');
                $refund->refund_number = app(NumberGenerator::class)->refund($year);
            }

            if (empty($refund->currency)) {
                $refund->currency = $refund->booking?->currency ?? 'LKR';
            }

            if (empty($refund->exchange_rate_to_lkr) || empty($refund->amount_lkr)) {
                $exchangeService = app(ExchangeRateService::class);
                $currencyEnum = Currency::tryFrom($refund->currency) ?? Currency::LKR;
                $rate = $exchangeService->latest($currencyEnum);
                $amountLkr = $exchangeService->convertToLkr((string) $refund->amount, $currencyEnum);

                $refund->exchange_rate_to_lkr = (string) $rate;
                $refund->amount_lkr = (string) $amountLkr;
            }
        });
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function activityLogs(): MorphMany
    {
        return $this->morphMany(ActivityLog::class, 'subject');
    }

    public function getSearchableColumns(): array
    {
        return ['refund_number', 'reason', 'notes', 'customer.full_name', 'booking.booking_reference'];
    }

    public function getFilterableColumns(): array
    {
        return ['status', 'currency', 'booking_id', 'customer_id'];
    }

    public function getSortableColumns(): array
    {
        return ['refund_number', 'amount', 'status', 'created_at', 'approved_at', 'paid_on'];
    }
}
