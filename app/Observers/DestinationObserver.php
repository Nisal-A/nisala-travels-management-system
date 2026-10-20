<?php

namespace App\Observers;

use App\Jobs\RevalidateNextJs;
use App\Models\Destination;
use Illuminate\Support\Facades\Cache;

class DestinationObserver
{
    public function saved(Destination $destination): void
    {
        $this->clearCacheAndRevalidate($destination);
    }

    public function deleted(Destination $destination): void
    {
        $this->clearCacheAndRevalidate($destination);
    }

    public function restored(Destination $destination): void
    {
        $this->clearCacheAndRevalidate($destination);
    }

    protected function clearCacheAndRevalidate(Destination $destination): void
    {
        if (Cache::supportsTags()) {
            Cache::tags(['public-catalog', 'destinations', 'tours'])->flush();
        } else {
            Cache::forget('public.destinations.all');
            Cache::forget('public.tours.all');
        }

        RevalidateNextJs::dispatch(['destinations'])->afterCommit();
    }
}
