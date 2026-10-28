<?php

namespace App\Providers;

use App\Contracts\NotificationServiceInterface;
use App\Listeners\LogNotificationDelivery;
use App\Models\Destination;
use App\Models\TourPackage;
use App\Observers\DestinationObserver;
use App\Observers\TourPackageObserver;
use App\Services\NotificationService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            NotificationServiceInterface::class,
            NotificationService::class
        );

        $this->app->bind(
            \App\Services\Currency\ExchangeRateProvider::class,
            fn () => new (config('currency.provider', \App\Services\Currency\ManualRateProvider::class))
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::subscribe(LogNotificationDelivery::class);

        RateLimiter::for('public-inquiry', fn (Request $r) => Limit::perMinutes(10, 5)->by(hash('sha256', $r->attributes->get('client_ip', $r->ip()))));

        TourPackage::observe(TourPackageObserver::class);
        Destination::observe(DestinationObserver::class);
    }
}
