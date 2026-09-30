<?php

namespace App\Http\Resources\Portal;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_reference' => $this->booking_reference,
            'tour_package' => $this->tourPackage ? [
                'id' => $this->tourPackage->id,
                'name' => $this->tourPackage->name,
            ] : null,
            'travelers' => $this->travelers->map(fn($t) => [
                'first_name' => $t->first_name,
                'last_name' => $t->last_name,
                'traveler_type' => $t->traveler_type,
            ]),
            'booking_date' => $this->booking_date?->format('Y-m-d'),
            'travel_date' => $this->travel_date?->format('Y-m-d'),
            'return_date' => $this->return_date?->format('Y-m-d'),
            'booking_status' => $this->booking_status,
            'payment_status' => $this->payment_status,
            'number_of_travelers' => $this->number_of_travelers,
            'notes' => $this->notes, // Assuming these are customer-facing notes
        ];
    }
}
