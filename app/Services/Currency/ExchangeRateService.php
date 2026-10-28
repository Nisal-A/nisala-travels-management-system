<?php

namespace App\Services\Currency;

use App\Enums\Currency;
use App\Models\ExchangeRate;
use Brick\Math\BigDecimal;
use Brick\Math\RoundingMode;
use Carbon\CarbonInterface;

class ExchangeRateService
{
    /**
     * Get the latest exchange rate for a given currency.
     *
     * Returns the rate as a BigDecimal. For LKR this is always 1.
     */
    public function latest(Currency $currency): BigDecimal
    {
        if ($currency === Currency::LKR) {
            return BigDecimal::one();
        }

        $rate = ExchangeRate::where('currency', $currency->value)
            ->orderByDesc('fetched_at')
            ->first();

        if (! $rate) {
            return BigDecimal::one();
        }

        return BigDecimal::of($rate->getRawOriginal('rate_to_lkr'));
    }

    /**
     * Convert an amount in a given currency to LKR.
     *
     * Uses BigDecimal arithmetic with HALF_UP rounding to 2 decimal places.
     * If a specific point-in-time is provided, uses the rate closest to (but not after) that timestamp.
     *
     * @param  string  $amount  The amount as a string to avoid floating-point issues.
     * @param  Currency  $currency  The source currency.
     * @param  CarbonInterface|null  $at  Optional point-in-time for the rate lookup.
     */
    public function convertToLkr(string $amount, Currency $currency, ?CarbonInterface $at = null): BigDecimal
    {
        if ($currency === Currency::LKR) {
            return BigDecimal::of($amount)->toScale(2, RoundingMode::HALF_UP);
        }

        $rate = $this->rateAt($currency, $at);

        return BigDecimal::of($amount)
            ->multipliedBy($rate)
            ->toScale(2, RoundingMode::HALF_UP);
    }

    /**
     * Look up the exchange rate for a currency, optionally at a specific time.
     */
    private function rateAt(Currency $currency, ?CarbonInterface $at = null): BigDecimal
    {
        $query = ExchangeRate::where('currency', $currency->value);

        if ($at !== null) {
            $query->where('fetched_at', '<=', $at);
        }

        $rate = $query->orderByDesc('fetched_at')->first();

        if (! $rate) {
            // Fallback: try the latest available rate regardless of time
            $rate = ExchangeRate::where('currency', $currency->value)
                ->orderByDesc('fetched_at')
                ->first();
        }

        if (! $rate) {
            return BigDecimal::one();
        }

        return BigDecimal::of($rate->getRawOriginal('rate_to_lkr'));
    }
}
