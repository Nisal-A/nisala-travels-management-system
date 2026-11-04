<?php

namespace App\Providers;

use App\Contracts\NotificationServiceInterface;
use App\Listeners\LogNotificationDelivery;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Models\Destination;
use App\Models\Inquiry;
use App\Models\PackageCostLine;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\Supplier;
use App\Models\TourPackage;
use App\Observers\DestinationObserver;
use App\Observers\TourPackageObserver;
use App\Policies\BookingPolicy;
use App\Policies\CustomerDocumentPolicy;
use App\Policies\CustomerPolicy;
use App\Policies\InquiryPolicy;
use App\Policies\PackageCostLinePolicy;
use App\Policies\PaymentPolicy;
use App\Policies\RefundPolicy;
use App\Policies\SupplierPolicy;
use App\Services\NotificationService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
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

        $this->app->singleton(\App\Reports\ReportRegistry::class);
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

        Gate::policy(Booking::class, BookingPolicy::class);
        Gate::policy(Customer::class, CustomerPolicy::class);
        Gate::policy(CustomerDocument::class, CustomerDocumentPolicy::class);
        Gate::policy(Payment::class, PaymentPolicy::class);
        Gate::policy(Supplier::class, SupplierPolicy::class);
        Gate::policy(PackageCostLine::class, PackageCostLinePolicy::class);
        Gate::policy(Refund::class, RefundPolicy::class);
        Gate::policy(Inquiry::class, InquiryPolicy::class);
    }
}
