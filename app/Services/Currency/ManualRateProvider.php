<?php

namespace App\Services\Currency;

use App\Enums\Currency;
use App\Models\ExchangeRate;

/**
 * Reads rates saved manually by a Super Admin in the exchange_rates table.
 *
 * For each supported currency, returns the most recent rate_to_lkr value.
 * LKR is always 1.000000 regardless of what's stored.
 */
class ManualRateProvider implements ExchangeRateProvider
{
    /**
     * @return array<string, string>
     */
    public function fetchRates(): array
    {
        $rates = ['LKR' => '1.000000'];

        $supported = config('currency.supported', ['LKR', 'USD', 'INR', 'THB']);

        foreach ($supported as $code) {
            if ($code === 'LKR') {
                continue;
            }

            $latest = ExchangeRate::where('currency', $code)
                ->orderByDesc('fetched_at')
                ->first();

            if ($latest) {
                $rates[$code] = $latest->getRawOriginal('rate_to_lkr');
            }
        }

        return $rates;
    }
}
