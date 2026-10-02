<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'package_name' => $this->package_name,
            'destination' => $this->whenLoaded('destination', fn() => $this->destination->country . ' - ' . $this->destination->city_region),
            'description' => $this->description,
            'short_description' => $this->short_description,
            'hero_image' => $this->hero_image,
            'gallery' => is_string($this->gallery) ? json_decode($this->gallery) : $this->gallery,
            'duration_days' => $this->duration_days,
            'start_date' => $this->start_date ? $this->start_date->format('Y-m-d') : null,
            'end_date' => $this->end_date ? $this->end_date->format('Y-m-d') : null,
            'price_from' => (float) ($this->price_from ?? $this->price),
            'currency' => $this->currency,
            'hotel_information' => $this->hotel_information,
            'transportation_information' => $this->transportation_information,
            'meals' => $this->meals,
            'included_items' => $this->included_items,
            'excluded_items' => $this->excluded_items,
            'terms' => $this->terms,
            'is_featured' => $this->is_featured,
            'available_seats' => $this->available_seats,
        ];
    }
}
