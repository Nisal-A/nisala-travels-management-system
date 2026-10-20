<?php

namespace App\Services;

use App\Models\Destination;
use App\Models\TourPackage;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class PublicCatalogService
{
    /**
     * Get all public listed destinations.
     */
    public function destinations(): Collection
    {
        $remember = function () {
            return Destination::publicListed()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get();
        };

        if (Cache::supportsTags()) {
            return Cache::tags(['public-catalog', 'destinations'])->remember('public.destinations.all', 300, $remember);
        }

        return Cache::remember('public.destinations.all', 300, $remember);
    }

    /**
     * Get public listed tours with optional filters.
     * Note: Packages on Sri Lanka or unlisted destinations are strictly excluded.
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
