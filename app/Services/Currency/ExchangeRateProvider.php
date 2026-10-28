<?php

namespace App\Services\Currency;

use App\Enums\Currency;

/**
 * Contract for fetching exchange rates from any source.
 *
 * Implementations must return an associative array keyed by currency code
 * with decimal string values representing the rate to LKR.
 * LKR itself should always be '1.000000'.
 */
interface ExchangeRateProvider
{
    /**
     * Fetch the latest exchange rates.
     *
     * @return array<string, string> e.g. ['LKR' => '1.000000', 'USD' => '320.500000']
     *
     * @throws \RuntimeException if rates cannot be fetched
     */
    public function fetchRates(): array;
}
