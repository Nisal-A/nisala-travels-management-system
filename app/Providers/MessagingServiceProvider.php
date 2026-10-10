<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Contracts\MessagingProvider;
use App\Services\Messaging\Providers\LogProvider;
use App\Services\Messaging\Providers\NullProvider;
use App\Services\Messaging\Providers\TwilioProvider;

class MessagingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(MessagingProvider::class, function ($app) {
            $provider = config('messaging.default', 'log');

            return match ($provider) {
                'twilio' => new TwilioProvider(),
                'null' => new NullProvider(),
                default => new LogProvider(),
            };
        });
    }

    public function boot(): void
    {
        //
    }
}
