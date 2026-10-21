<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TestimonialResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * Rules:
     * - Fields: display_name, trip_title, quote, tour_year, photo_url.
     * - No rating field.
     * - Never return consent fields or internal metadata.
     */
    public function toArray(Request $request): array
    {
        $displayName = is_array($this->resource)
            ? ($this->resource['display_name'] ?? $this->resource['name'] ?? '')
            : ($this->display_name ?? $this->name ?? '');

        $tripTitle = is_array($this->resource)
            ? ($this->resource['trip_title'] ?? $this->resource['tour_title'] ?? '')
            : ($this->trip_title ?? $this->tour_title ?? '');

        $quote = is_array($this->resource)
            ? ($this->resource['quote'] ?? $this->resource['content'] ?? '')
            : ($this->quote ?? $this->content ?? '');

        $tourYear = is_array($this->resource)
            ? ($this->resource['tour_year'] ?? $this->resource['year'] ?? null)
            : ($this->tour_year ?? $this->year ?? null);

        $photoUrl = is_array($this->resource)
            ? ($this->resource['photo_url'] ?? $this->resource['avatar_url'] ?? null)
            : ($this->photo_url ?? $this->avatar_url ?? null);

        return [
            'display_name' => (string) $displayName,
            'trip_title' => (string) $tripTitle,
            'quote' => (string) $quote,
            'tour_year' => $tourYear !== null ? (int) $tourYear : null,
            'photo_url' => $photoUrl ? (string) $photoUrl : null,
        ];
    }
}
