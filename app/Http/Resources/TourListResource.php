<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'package_name' => $this->package_name,
            'destination' => $this->whenLoaded('destination', fn () => $this->destination->country.' - '.$this->destination->city_region),
            'short_description' => $this->short_description,
            'hero_image' => $this->hero_image,
            'duration_days' => $this->duration_days,
            'price_from' => (float) ($this->price_from ?? $this->price),
            'currency' => $this->currency,
            'is_featured' => $this->is_featured,
        ];
    }
}
