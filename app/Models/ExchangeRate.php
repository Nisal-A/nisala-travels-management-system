<?php

namespace App\Models;

use App\Enums\Currency;
use Illuminate\Database\Eloquent\Model;

class ExchangeRate extends Model
{
    protected $fillable = [
        'currency',
        'rate_to_lkr',
        'source',
        'fetched_at',
    ];

    protected function casts(): array
    {
        return [
            'currency' => Currency::class,
            'rate_to_lkr' => 'decimal:6',
            'fetched_at' => 'datetime',
        ];
    }
}
