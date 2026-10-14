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
        Cache::forget('public.tours.all');

        if (!empty($tourPackage->slug)) {
            Cache::forget("public.tour.{$tourPackage->slug}");
        }

        $originalSlug = $tourPackage->getOriginal('slug');
        if (!empty($originalSlug) && $originalSlug !== $tourPackage->slug) {
            Cache::forget("public.tour.{$originalSlug}");
        }

        RevalidateNextJs::dispatch(['tours'])->afterCommit();
    }
}
