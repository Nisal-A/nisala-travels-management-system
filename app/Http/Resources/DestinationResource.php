<?php

namespace App\Http\Resources;

use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class DestinationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'name' => $this->city_region,
            'country' => $this->country,
            'region' => $this->region,
            'tagline' => $this->tagline,
            'overview' => $this->description,
            'travel_information' => $this->travel_information,
            'best_months' => $this->best_months,
            'facts' => $this->facts ?? [],
            'highlights' => $this->highlights ?? [],
            'hero_image_url' => $this->formatImageUrl($this->hero_image),
            'gallery' => $this->formatGallery($this->gallery),
            'tour_count' => $this->listing_state === Destination::LISTING_STATE_LIVE ? $this->publicTourCount() : 0,
            'listing_state' => $this->listing_state,
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
