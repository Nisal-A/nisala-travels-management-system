<?php

use App\Enums\Currency;
use App\Models\ExchangeRate;
use App\Services\Currency\ExchangeRateService;
use Brick\Math\BigDecimal;
use Carbon\Carbon;

beforeEach(function () {
    $this->service = app(ExchangeRateService::class);
});

test('rate lookup: LKR always returns 1.000000 regardless of database state', function () {
    $rate = $this->service->latest(Currency::LKR);

    expect($rate->isEqualTo(BigDecimal::one()))->toBeTrue();
});

test('rate lookup: retrieves the most recent rate for foreign currency', function () {
    ExchangeRate::create([
        'currency' => Currency::USD,
        'rate_to_lkr' => '300.000000',
        'source' => 'test',
        'fetched_at' => now()->subHours(2),
    ]);

    ExchangeRate::create([
        'currency' => Currency::USD,
        'rate_to_lkr' => '320.500000',
        'source' => 'test',
        'fetched_at' => now()->subHour(1),
    ]);

    $rate = $this->service->latest(Currency::USD);

    expect($rate->isEqualTo(BigDecimal::of('320.500000')))->toBeTrue();
});

test('rate lookup: fallback returns 1 when no rate is found', function () {
    $rate = $this->service->latest(Currency::THB);

    expect($rate->isEqualTo(BigDecimal::one()))->toBeTrue();
});

test('convertToLkr: LKR converts 1:1 with scale 2', function () {
    $converted = $this->service->convertToLkr('1500.50', Currency::LKR);

    expect((string) $converted)->toBe('1500.50');
});

test('convertToLkr: foreign currency uses BigDecimal math with HALF_UP rounding to 2 decimals', function () {
    ExchangeRate::create([
        'currency' => Currency::USD,
        'rate_to_lkr' => '320.500000',
        'source' => 'test',
        'fetched_at' => now(),
    ]);

    // 100.55 * 320.50 = 32226.275 -> rounded HALF_UP to 2 decimals = 32226.28
    $result = $this->service->convertToLkr('100.55', Currency::USD);

    expect((string) $result)->toBe('32226.28');
});

test('convertToLkr: historical rate lookup with timestamp uses rate at or before the timestamp', function () {
    $t1 = Carbon::parse('2026-01-01 10:00:00');
    $t2 = Carbon::parse('2026-02-01 10:00:00');

    ExchangeRate::create([
        'currency' => Currency::INR,
        'rate_to_lkr' => '3.500000',
        'source' => 'test',
        'fetched_at' => $t1,
    ]);

    ExchangeRate::create([
        'currency' => Currency::INR,
        'rate_to_lkr' => '3.800000',
        'source' => 'test',
        'fetched_at' => $t2,
    ]);

    // Conversion at t1 should use 3.500000: 100 * 3.5 = 350.00
    $resultAtT1 = $this->service->convertToLkr('100.00', Currency::INR, $t1);
    expect((string) $resultAtT1)->toBe('350.00');

    // Conversion at t2 should use 3.800000: 100 * 3.8 = 380.00
    $resultAtT2 = $this->service->convertToLkr('100.00', Currency::INR, $t2);
    expect((string) $resultAtT2)->toBe('380.00');
});

test('convertToLkr: fallback to 1 when no rate exists in database', function () {
    // No THB rates exist
    $result = $this->service->convertToLkr('500.00', Currency::THB);

    expect((string) $result)->toBe('500.00');
});
