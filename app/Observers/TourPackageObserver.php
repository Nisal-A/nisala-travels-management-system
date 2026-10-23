<?php

namespace App\Observers;

use App\Jobs\RevalidateNextJs;
use App\Models\TourPackage;
use Illuminate\Support\Facades\Cache;

class TourPackageObserver
{
    public function saved(TourPackage $tourPackage): void
    {
        $this->clearCacheAndRevalidate($tourPackage);
    }

    public function deleted(TourPackage $tourPackage): void
    {
        $this->clearCacheAndRevalidate($tourPackage);
    }

    public function restored(TourPackage $tourPackage): void
    {
        $this->clearCacheAndRevalidate($tourPackage);
    }

    protected function clearCacheAndRevalidate(TourPackage $tourPackage): void
    {
        if (Cache::supportsTags()) {
            Cache::tags(['public-catalog', 'tours', 'destinations'])->flush();
        } else {
            Cache::forget('public.tours.all');
            Cache::forget('public.destinations.all');

            if (!empty($tourPackage->slug)) {
                Cache::forget("public.tour.{$tourPackage->slug}");
            }

            $originalSlug = $tourPackage->getOriginal('slug');
            if (!empty($originalSlug) && $originalSlug !== $tourPackage->slug) {
                Cache::forget("public.tour.{$originalSlug}");
            }
        }

        RevalidateNextJs::dispatch(['tours'])->afterCommit();
    }
}
