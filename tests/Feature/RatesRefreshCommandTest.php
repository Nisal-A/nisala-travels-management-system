<?php

use App\Console\Commands\RefreshExchangeRates;
use App\Enums\Currency;
use App\Models\ExchangeRate;
use App\Services\Currency\ExchangeRateProvider;
use Illuminate\Support\Facades\Log;

test('rates:refresh successfully stores new rates returned by the provider', function () {
    // Mock provider
    $mockProvider = Mockery::mock(ExchangeRateProvider::class);
    $mockProvider->shouldReceive('fetchRates')
        ->once()
        ->andReturn([
            'LKR' => '1.000000',
            'USD' => '325.750000',
            'INR' => '3.850000',
            'THB' => '9.200000',
        ]);

    $this->app->instance(ExchangeRateProvider::class, $mockProvider);

    $this->artisan('rates:refresh')
        ->assertExitCode(0);

    // Verify exchange_rates table has the entries
    $usd = ExchangeRate::where('currency', Currency::USD)->latest('id')->first();
    expect($usd)->not->toBeNull();
    expect((string) $usd->rate_to_lkr)->toBe('325.750000');
    expect($usd->source)->toContain('Mockery');

    $inr = ExchangeRate::where('currency', Currency::INR)->latest('id')->first();
    expect($inr)->not->toBeNull();
    expect((string) $inr->rate_to_lkr)->toBe('3.850000');

    $thb = ExchangeRate::where('currency', Currency::THB)->latest('id')->first();
    expect($thb)->not->toBeNull();
    expect((string) $thb->rate_to_lkr)->toBe('9.200000');

    // LKR should not be inserted (it's always 1 by definition)
    expect(ExchangeRate::where('currency', Currency::LKR)->count())->toBe(0);
});

test('rates:refresh failure logs a warning, keeps last rates, and does not crash', function () {
    // Seed an existing rate
    ExchangeRate::create([
        'currency' => Currency::USD,
        'rate_to_lkr' => '315.000000',
        'source' => 'initial',
        'fetched_at' => now()->subDay(),
    ]);

    // Provider that throws an exception
    $failingProvider = Mockery::mock(ExchangeRateProvider::class);
    $failingProvider->shouldReceive('fetchRates')
        ->once()
        ->andThrow(new \RuntimeException('Connection to exchange rate feed timed out'));

    $this->app->instance(ExchangeRateProvider::class, $failingProvider);

    Log::shouldReceive('warning')
        ->once()
        ->withArgs(function ($message, $context) {
            return str_contains($message, 'Exchange rate refresh failed')
                && str_contains($context['error'], 'timed out');
        });

    $this->artisan('rates:refresh')
        ->expectsOutputToContain('Rate refresh failed: Connection to exchange rate feed timed out')
        ->expectsOutputToContain('Keeping the last stored rates.')
        ->assertExitCode(0);

    // Verify last rates are still intact
    $usd = ExchangeRate::where('currency', Currency::USD)->latest('id')->first();
    expect((string) $usd->rate_to_lkr)->toBe('315.000000');
    expect(ExchangeRate::where('currency', Currency::USD)->count())->toBe(1);
});
