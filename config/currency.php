<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Base Currency
    |--------------------------------------------------------------------------
    |
    | All exchange rates are expressed relative to this currency.
    | LKR is always 1.000000.
    |
    */
    'base' => 'LKR',

    /*
    |--------------------------------------------------------------------------
    | Supported Currencies
    |--------------------------------------------------------------------------
    |
    | The list of currencies the system supports. Each must have a matching
    | case in App\Enums\Currency.
    |
    */
    'supported' => ['LKR', 'USD', 'INR', 'THB'],

    /*
    |--------------------------------------------------------------------------
    | Refresh Schedule (Asia/Colombo)
    |--------------------------------------------------------------------------
    |
    | Times at which the rates:refresh command runs automatically.
    |
    */
    'refresh_times' => ['06:00', '14:00'],

    /*
    |--------------------------------------------------------------------------
    | Rate Provider
    |--------------------------------------------------------------------------
    |
    | The fully qualified class name of the exchange rate provider to use.
    | The default "manual" provider reads rates saved by a Super Admin.
    | To switch providers, change this value to any class implementing
    | App\Services\Currency\ExchangeRateProvider.
    |
    */
    'provider' => \App\Services\Currency\ManualRateProvider::class,
];
