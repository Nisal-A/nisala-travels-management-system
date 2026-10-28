<?php

namespace App\Console\Commands;

use App\Models\ExchangeRate;
use App\Services\Currency\ExchangeRateProvider;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RefreshExchangeRates extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'rates:refresh';

    /**
     * The console command description.
     */
    protected $description = 'Refresh exchange rates from the configured provider';

    public function handle(ExchangeRateProvider $provider): int
    {
        $this->info('Refreshing exchange rates...');

        try {
            $rates = $provider->fetchRates();
        } catch (\Throwable $e) {
            Log::warning('Exchange rate refresh failed, keeping last rates.', [
                'error' => $e->getMessage(),
                'provider' => get_class($provider),
            ]);

            $this->warn('Rate refresh failed: '.$e->getMessage());
            $this->warn('Keeping the last stored rates.');

            return self::SUCCESS;
        }

        $now = now();
        $source = class_basename($provider);
        $count = 0;

        foreach ($rates as $code => $rateValue) {
            if ($code === 'LKR') {
                continue;
            }

            ExchangeRate::create([
                'currency' => $code,
                'rate_to_lkr' => $rateValue,
                'source' => $source,
                'fetched_at' => $now,
            ]);

            $count++;
        }

        $this->info("Stored {$count} exchange rate(s) from {$source}.");

        return self::SUCCESS;
    }
}
