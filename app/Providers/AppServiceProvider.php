<?php

namespace App\Providers;

use App\Contracts\NotificationServiceInterface;
use App\Listeners\LogNotificationDelivery;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Event;
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
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::subscribe(LogNotificationDelivery::class);
    }
}
