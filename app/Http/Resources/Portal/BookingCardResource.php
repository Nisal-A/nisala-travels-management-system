<?php

namespace App\Http\Resources\Portal;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingCardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_reference' => $this->booking_reference,
            'tour_name' => $this->tourPackage?->name,
            'travel_date' => $this->travel_date?->format('Y-m-d'),
            'return_date' => $this->return_date?->format('Y-m-d'),
            'booking_status' => $this->booking_status,
            'payment_status' => $this->payment_status,
            'number_of_travelers' => $this->number_of_travelers,
            // Only expose necessary fields for the portal
        ];
    }
}
