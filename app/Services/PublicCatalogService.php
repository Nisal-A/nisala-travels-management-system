<?php

namespace App\Services;

use App\Models\Destination;
use App\Models\TourPackage;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class PublicCatalogService
{
    /**
     * Get all public listed and coming_soon destinations (never hidden).
     */
    public function destinations(): Collection
    {
        $remember = function () {
            $destinations = Destination::whereIn('status', ['active', 'coming_soon'])
                ->whereIn('listing_state', [
                    Destination::LISTING_STATE_LIVE,
                    Destination::LISTING_STATE_COMING_SOON,
                ])
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get();

            foreach ($destinations as $destination) {
                if ($destination->listing_state === Destination::LISTING_STATE_COMING_SOON || $destination->status === 'coming_soon') {
                    $destination->tour_count = 0;
                    $destination->places = [];
                    $destination->common_inclusions = [];
                } else {
                    $destination->tour_count = $destination->publicTourCount();
                    $destination->places = $this->computePlacesForDestination($destination);
                    $destination->common_inclusions = $this->computeCommonInclusionsForDestination($destination);
                }
            }

            return $destinations;
        };

        if (Cache::supportsTags()) {
            return Cache::tags(['public-catalog', 'destinations'])->remember('public.destinations.all', 300, $remember);
        }

        return Cache::remember('public.destinations.all', 300, $remember);
    }

    /**
     * Unique values from the highlights of live, published tours in this country, in tour order, max 12.
     */
    public function computePlacesForDestination(Destination $destination): array
    {
        if ($destination->listing_state !== Destination::LISTING_STATE_LIVE) {
            return [];
        }

        $tours = TourPackage::published()
            ->whereHas('destination', function ($q) use ($destination) {
                $q->where('status', 'active')
                    ->where('listing_state', Destination::LISTING_STATE_LIVE)
                    ->where('country', $destination->country);
            })
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $places = [];
        foreach ($tours as $tour) {
            $highlights = $tour->highlights;
            if (is_array($highlights)) {
                foreach ($highlights as $highlight) {
                    $val = trim((string) $highlight);
                    if ($val !== '' && !in_array($val, $places, true)) {
                        $places[] = $val;
                        if (count($places) >= 12) {
                            return $places;
                        }
                    }
                }
            }
        }

        return $places;
    }

    /**
     * Lines from included_items that appear in at least 2 live tours of this country, max 8.
     */
    public function computeCommonInclusionsForDestination(Destination $destination): array
    {
        if ($destination->listing_state !== Destination::LISTING_STATE_LIVE) {
            return [];
        }

        $tours = TourPackage::published()
            ->whereHas('destination', function ($q) use ($destination) {
                $q->where('status', 'active')
                    ->where('listing_state', Destination::LISTING_STATE_LIVE)
                    ->where('country', $destination->country);
            })
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $lineCounts = [];
        $firstSeen = [];

        foreach ($tours as $tour) {
            $text = $tour->included_items;
            if (empty($text)) {
                continue;
            }

            if (is_array($text)) {
                $lines = array_values(array_filter(
                    array_map('trim', $text),
                    fn ($line) => $line !== ''
                ));
            } else {
                $lines = array_values(array_filter(
                    array_map('trim', preg_split('/\r\n|\r|\n/', (string) $text)),
                    fn ($line) => $line !== ''
                ));
            }

            $uniqueLinesInTour = array_unique($lines);

            foreach ($uniqueLinesInTour as $line) {
                if (!isset($lineCounts[$line])) {
                    $lineCounts[$line] = 0;
                    $firstSeen[] = $line;
                }
                $lineCounts[$line]++;
            }
        }

        $common = [];
        foreach ($firstSeen as $line) {
            if ($lineCounts[$line] >= 2) {
                $common[] = $line;
                if (count($common) >= 8) {
                    break;
                }
            }
        }

        return $common;
    }

    /**
     * Get public listed tours with optional filters.
     * Note: Only tours from live listed destinations are included.
     */
    public function tours(array $filters = []): Collection
    {
        $hasFilters = !empty(array_filter($filters));

        if (! $hasFilters) {
            $remember = function () {
                return $this->buildToursQuery()->get();
            };

            if (Cache::supportsTags()) {
                return Cache::tags(['public-catalog', 'tours'])->remember('public.tours.all', 300, $remember);
            }

            return Cache::remember('public.tours.all', 300, $remember);
        }

        return $this->buildToursQuery($filters)->get();
    }

    /**
     * Get a single public listed tour by its slug.
     */
    public function tourBySlug(string $slug): TourPackage
    {
        if (is_numeric($slug)) {
            abort(404);
        }

        $remember = function () use ($slug) {
            return TourPackage::publicListed()
                ->with('destination')
                ->where('slug', $slug)
                ->firstOrFail();
        };

        if (Cache::supportsTags()) {
            return Cache::tags(['public-catalog', 'tours'])->remember("public.tour.{$slug}", 300, $remember);
        }

        return Cache::remember("public.tour.{$slug}", 300, $remember);
    }

    /**
     * Get featured public listed tours.
     */
    public function featuredTours(int $limit = 6): Collection
    {
        $remember = function () use ($limit) {
            return TourPackage::publicListed()
                ->with('destination')
                ->where('is_featured', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->take($limit)
                ->get();
        };

        if (Cache::supportsTags()) {
            return Cache::tags(['public-catalog', 'tours'])->remember("public.tours.featured.{$limit}", 300, $remember);
        }

        return Cache::remember("public.tours.featured.{$limit}", 300, $remember);
    }

    /**
     * Build the query for public listed tours.
     */
    protected function buildToursQuery(array $filters = [])
    {
        $query = TourPackage::publicListed()
            ->with('destination')
            ->orderBy('sort_order')
            ->orderBy('id');

        if (!empty($filters['destination'])) {
            $query->whereHas('destination', function ($q) use ($filters) {
                $q->where('slug', $filters['destination'])
                    ->orWhere('id', $filters['destination']);
            });
        }

        if (!empty($filters['tier'])) {
            $query->where('tier', $filters['tier']);
        }

        if (isset($filters['featured'])) {
            $query->where('is_featured', filter_var($filters['featured'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query;
    }
}
