<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class TourDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'title' => $this->package_name,
            'summary' => $this->short_description,
            'destination' => [
                'slug' => $this->destination?->slug,
                'name' => $this->destination?->city_region,
                'country' => $this->destination?->country,
            ],
            'duration_days' => $this->duration_days,
            'duration_nights' => $this->duration_nights,
            'price' => (float) ($this->price_from ?? $this->price),
            'price_from_label' => !is_null($this->price_from),
            'currency' => $this->currency,
            'hero_image_url' => $this->formatImageUrl($this->hero_image),
            'tags' => $this->tags ?? [],
            'featured' => (bool) $this->is_featured,

            'overview' => $this->description,
            'accommodation' => $this->hotel_information,
            'included' => $this->splitLines($this->included_items),
            'excluded' => $this->splitLines($this->excluded_items),
            'highlights' => $this->highlights ?? [],
            'itinerary' => $this->itinerary ?? [],
            'group_min' => $this->group_min,
            'group_max' => $this->capacity,
            'departure_months' => $this->departure_months ?? [],
            'gallery' => $this->formatGallery($this->gallery),
            'faqs' => $this->faqs ?? [],
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

    protected function splitLines(?string $text): array
    {
        if (empty($text)) {
            return [];
        }

        return array_values(array_filter(
            array_map('trim', preg_split('/\r\n|\r|\n/', $text)),
            fn ($line) => $line !== ''
        ));
    }
}
