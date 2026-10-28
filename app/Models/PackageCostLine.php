<?php

namespace App\Models;

use App\Enums\Currency;
use App\Enums\SupplierType;
use App\Services\Currency\ExchangeRateService;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackageCostLine extends Model
{
    use HasFactory, Filterable;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'exchange_rate_to_lkr' => 'decimal:6',
            'amount_lkr' => 'decimal:2',
            'incurred_on' => 'date',
            'paid_on' => 'date',
            'category' => SupplierType::class,
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (PackageCostLine $costLine) {
            if (empty($costLine->currency)) {
                $costLine->currency = 'LKR';
            }

            if (empty($costLine->exchange_rate_to_lkr) || empty($costLine->amount_lkr)) {
                $exchangeService = app(ExchangeRateService::class);
                $currencyEnum = Currency::tryFrom($costLine->currency) ?? Currency::LKR;
                $rate = $exchangeService->latest($currencyEnum);
                $amountLkr = $exchangeService->convertToLkr((string) $costLine->amount, $currencyEnum);

                $costLine->exchange_rate_to_lkr = (string) $rate;
                $costLine->amount_lkr = (string) $amountLkr;
            }
        });
    }

    public function tourPackage(): BelongsTo
    {
        return $this->belongsTo(TourPackage::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function getSearchableColumns(): array
    {
        return ['description', 'notes', 'supplier.name'];
    }

    public function getFilterableColumns(): array
    {
        return ['category', 'currency', 'tour_package_id', 'supplier_id'];
    }

    public function getSortableColumns(): array
    {
        return ['incurred_on', 'paid_on', 'amount', 'amount_lkr', 'category', 'created_at'];
    }
}
