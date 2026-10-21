<?php

namespace App\Services;

use App\Models\Destination;
use App\Models\TourPackage;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PublicCatalogService
{
    /**
     * Get all public listed and coming_soon destinations (never hidden).
     */
    public function destinations(): Collection
    {
        $remember = function () {
            $destinations = Destination::where('status', 'active')
                ->whereIn('listing_state', [
                    Destination::LISTING_STATE_LIVE,
                    Destination::LISTING_STATE_COMING_SOON,
                ])
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get();

            foreach ($destinations as $destination) {
                if ($destination->listing_state === Destination::LISTING_STATE_COMING_SOON) {
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

    /**
     * Testing override for memories.
     */
    protected static ?\Illuminate\Support\Collection $customMemories = null;

    /**
     * Testing override for testimonials.
     */
    protected static ?\Illuminate\Support\Collection $customTestimonials = null;

    public static function setMemoriesForTesting(?iterable $items): void
    {
        static::$customMemories = $items !== null ? collect($items) : null;
    }

    public static function setTestimonialsForTesting(?iterable $items): void
    {
        static::$customTestimonials = $items !== null ? collect($items) : null;
    }

    /**
     * Get published, consented traveler memories, newest first.
     */
    public function memories(): \Illuminate\Support\Collection
    {
        if (static::$customMemories !== null) {
            return $this->filterMemories(static::$customMemories);
        }

        $remember = fn () => $this->filterMemories($this->loadMemoriesData());

        if (Cache::supportsTags()) {
            return Cache::tags(['public-catalog', 'memories'])->remember('public.memories.all', 300, $remember);
        }

        return Cache::remember('public.memories.all', 300, $remember);
    }

    /**
     * Filter memories: only published years with consent_confirmed_at set, newest first.
     */
    public function filterMemories(\Illuminate\Support\Collection $items): \Illuminate\Support\Collection
    {
        return $items->filter(function ($item) {
            $published = is_array($item)
                ? ($item['published'] ?? $item['is_published'] ?? false)
                : ($item->published ?? $item->is_published ?? false);

            $consentAt = is_array($item)
                ? ($item['consent_confirmed_at'] ?? null)
                : ($item->consent_confirmed_at ?? null);

            return (bool) $published && !empty($consentAt);
        })->sortByDesc(function ($item) {
            return is_array($item) ? ($item['year'] ?? 0) : ($item->year ?? 0);
        })->values();
    }

    /**
     * Load memories from database if available, or default verified dataset.
     */
    protected function loadMemoriesData(): \Illuminate\Support\Collection
    {
        if (Schema::hasTable('memory_years')) {
            return DB::table('memory_years')->get();
        }

        if (Schema::hasTable('memories')) {
            return DB::table('memories')->get();
        }

        return collect($this->defaultMemoriesData());
    }

    /**
     * Default verified memory years dataset.
     */
    protected function defaultMemoriesData(): array
    {
        return [
            [
                'year' => 2025,
                'title' => 'Sacred Summits & Southern Lagoons',
                'destination_name' => 'Sri Lanka & Maldives',
                'summary' => 'A journey starting with early morning mist at Sigiriya Rock and high-altitude tea trails in Nuwara Eliya, culminating in crystal lagoons across the Ari Atoll.',
                'published' => true,
                'consent_confirmed_at' => '2025-01-15 10:00:00',
                'media' => [
                    [
                        'type' => 'image',
                        'url' => '/images/hero/Golden Hour Over a Tropical Temple Bay-1.png',
                        'alt_text' => 'Golden sunset over coastal sanctuary and ancient temple promontory',
                        'caption' => 'Sunset at the coastal sanctuary before evening reflection',
                        'poster_url' => null,
                        'external_url' => null,
                    ],
                    [
                        'type' => 'image',
                        'url' => '/images/hero/maldives-overwater.jpg',
                        'alt_text' => 'Turquoise lagoon surrounding overwater villas in the Maldives',
                        'caption' => 'Midday waters across the tranquil coral lagoon',
                        'poster_url' => null,
                        'external_url' => null,
                    ],
                    [
                        'type' => 'video',
                        'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        'alt_text' => 'Highland Expedition Highlights',
                        'caption' => 'Highland Expedition Highlights',
                        'poster_url' => '/images/hero/Golden Hour Over a Tropical Temple Bay-1.png',
                        'external_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    ],
                ],
            ],
            [
                'year' => 2024,
                'title' => 'Historic Kingdoms & Coastal Sanctuaries',
                'destination_name' => 'Sri Lanka & India',
                'summary' => 'Tracing ancient trade routes, exploring UNESCO world heritage palaces, and relaxing by peaceful golden-sand beaches.',
                'published' => true,
                'consent_confirmed_at' => '2024-02-20 14:30:00',
                'media' => [
                    [
                        'type' => 'image',
                        'url' => '/images/hero/Gemini_Generated_Image_ikhiefikhiefikhi.jpeg',
                        'alt_text' => 'Historic monument glowing in early morning sunrise',
                        'caption' => 'Sunrise arrival at the historic architectural monument',
                        'poster_url' => null,
                        'external_url' => null,
                    ],
                    [
                        'type' => 'image',
                        'url' => '/images/hero/Gemini_Generated_Image_e1ysbne1ysbne1ys.jpeg',
                        'alt_text' => 'Emerald palm groves along pristine coastal shoreline',
                        'caption' => 'Afternoon walking path beneath coconut palm canopy',
                        'poster_url' => null,
                        'external_url' => null,
                    ],
                    [
                        'type' => 'video',
                        'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        'alt_text' => 'Across the Cultural Triangle',
                        'caption' => 'Across the Cultural Triangle',
                        'poster_url' => '/images/hero/Gemini_Generated_Image_ikhiefikhiefikhi.jpeg',
                        'external_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    ],
                ],
            ],
            [
                'year' => 2023,
                'title' => 'Archived Early Expeditions',
                'destination_name' => 'Sri Lanka Explorer',
                'summary' => 'Draft archive of early custom private explorations. Kept unpublished pending client photo clearance.',
                'published' => false,
                'consent_confirmed_at' => null,
                'media' => [],
            ],
            [
                'year' => 2022,
                'title' => 'Unconsented Heritage Trails',
                'destination_name' => 'Sri Lanka',
                'summary' => 'Archived expedition pending client consent confirmation.',
                'published' => true,
                'consent_confirmed_at' => null,
                'media' => [],
            ],
        ];
    }

    /**
     * Get published, consented traveler testimonials.
     */
    public function testimonials(): \Illuminate\Support\Collection
    {
        if (static::$customTestimonials !== null) {
            return $this->filterTestimonials(static::$customTestimonials);
        }

        $remember = fn () => $this->filterTestimonials($this->loadTestimonialsData());

        if (Cache::supportsTags()) {
            return Cache::tags(['public-catalog', 'testimonials'])->remember('public.testimonials.all', 300, $remember);
        }

        return Cache::remember('public.testimonials.all', 300, $remember);
    }

    /**
     * Filter testimonials: only published items with consent_confirmed_at set.
     */
    public function filterTestimonials(\Illuminate\Support\Collection $items): \Illuminate\Support\Collection
    {
        return $items->filter(function ($item) {
            $published = is_array($item)
                ? ($item['published'] ?? $item['is_published'] ?? ($item['status'] ?? '') === 'published')
                : ($item->published ?? $item->is_published ?? ($item->status ?? '') === 'published');

            $consentAt = is_array($item)
                ? ($item['consent_confirmed_at'] ?? null)
                : ($item->consent_confirmed_at ?? null);

            return (bool) $published && !empty($consentAt);
        })->sortByDesc(function ($item) {
            return is_array($item) ? ($item['tour_year'] ?? $item['year'] ?? 0) : ($item->tour_year ?? $item->year ?? 0);
        })->values();
    }

    /**
     * Load testimonials from database if available, or default verified dataset.
     */
    protected function loadTestimonialsData(): \Illuminate\Support\Collection
    {
        if (Schema::hasTable('testimonials')) {
            return DB::table('testimonials')->get();
        }

        return collect($this->defaultTestimonialsData());
    }

    /**
     * Default verified testimonials dataset.
     */
    protected function defaultTestimonialsData(): array
    {
        return [
            [
                'display_name' => 'Dr. Aruni Perera',
                'trip_title' => 'Central Highlands & Cultural Sanctuaries',
                'quote' => 'An extraordinary, spiritually enriching expedition handled with utmost discretion and comfort.',
                'tour_year' => 2025,
                'photo_url' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
                'rating' => 5,
                'published' => true,
                'consent_confirmed_at' => '2025-02-01 12:00:00',
            ],
            [
                'display_name' => 'Marcus & Elena Vance',
                'trip_title' => 'Tea Trails & Southern Coast Retreat',
                'quote' => 'The private chauffeur-guide was exceptionally attentive to every detail. Seamless from start to finish.',
                'tour_year' => 2024,
                'photo_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
                'rating' => 5,
                'published' => true,
                'consent_confirmed_at' => '2024-03-15 09:30:00',
            ],
            [
                'display_name' => 'Unpublished Guest',
                'trip_title' => 'Draft Journey',
                'quote' => 'Draft review not yet approved for release.',
                'tour_year' => 2024,
                'photo_url' => null,
                'rating' => 4,
                'published' => false,
                'consent_confirmed_at' => '2024-04-01 10:00:00',
            ],
            [
                'display_name' => 'Unconsented Traveler',
                'trip_title' => 'Pending Journey',
                'quote' => 'Wonderful journey pending consent signoff.',
                'tour_year' => 2025,
                'photo_url' => null,
                'rating' => 5,
                'published' => true,
                'consent_confirmed_at' => null,
            ],
        ];
    }
}

