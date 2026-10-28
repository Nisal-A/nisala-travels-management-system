<?php

namespace App\Http\Resources;

use App\Models\Destination;
use App\Services\PublicCatalogService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class DestinationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isComingSoon = $this->listing_state === Destination::LISTING_STATE_COMING_SOON || $this->status === 'coming_soon';

        $tourCount = $isComingSoon
            ? 0
            : (isset($this->tour_count) ? (int) $this->tour_count : $this->publicTourCount());

        $places = $isComingSoon
            ? []
            : (isset($this->places) && is_array($this->places) ? $this->places : app(PublicCatalogService::class)->computePlacesForDestination($this->resource));

        $commonInclusions = $isComingSoon
            ? []
            : (isset($this->common_inclusions) && is_array($this->common_inclusions) ? $this->common_inclusions : app(PublicCatalogService::class)->computeCommonInclusionsForDestination($this->resource));

        $recommendations = (!empty($this->recommendations) && is_array($this->recommendations))
            ? array_values($this->recommendations)
            : [];

        return [
            'slug' => $this->slug,
            'name' => $this->city_region,
            'country' => $this->country,
            'listing_state' => $this->listing_state ?? ($isComingSoon ? 'coming_soon' : 'live'),
            'tagline' => $this->tagline,
            'overview' => $this->description,
            'hero_image_url' => $this->formatImageUrl($this->hero_image),
            'gallery' => $this->formatGallery($this->gallery),
            'tour_count' => $tourCount,
            'places' => $places,
            'common_inclusions' => $commonInclusions,
            'recommendations' => $recommendations,
            'best_months' => $this->best_months,
        ];
    }

    protected function formatImageUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        if (str_starts_with($path, 'http')) {
            return $path;
        }

        $disk = config('filesystems.default_public_disk', 'public');
        $url = Storage::disk($disk)->url($path);

        if (!str_starts_with($url, 'http')) {
            return url($url);
        }

        return $url;
    }

    protected function formatGallery($gallery): array
    {
        if (empty($gallery) || !is_array($gallery)) {
            return [];
        }

        return array_values(array_map(fn ($img) => $this->formatImageUrl($img), $gallery));
    }
}
