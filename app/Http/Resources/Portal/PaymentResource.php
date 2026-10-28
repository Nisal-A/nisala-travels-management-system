<?php

namespace App\Http\Resources\Portal;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'receipt_number' => $this->receipt?->receipt_number ?? 'RCP-'.$this->id,
            'amount' => (float) $this->amount,
            'payment_date' => $this->payment_date?->format('M d, Y'),
            'payment_method' => $this->payment_method instanceof \BackedEnum
                ? str_replace('_', ' ', $this->payment_method->value)
                : ($this->payment_method ?? 'unknown'),
            'status' => $this->status instanceof \BackedEnum
                ? $this->status->value
                : ($this->status ?? 'pending'),
            'booking' => [
                'id' => $this->booking?->id,
                'booking_reference' => $this->booking?->booking_reference,
                'tour_package' => $this->booking?->tourPackage ? [
                    'name' => $this->booking->tourPackage->package_name ?? $this->booking->tourPackage->name ?? null,
                ] : null,
            ],
        ];
    }
}
