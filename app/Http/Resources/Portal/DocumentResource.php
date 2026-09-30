<?php

namespace App\Http\Resources\Portal;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'document_type' => $this->documentType?->name,
            'original_filename' => $this->original_filename,
            'expiry_date' => $this->expiry_date?->format('Y-m-d'),
            'verification_status' => $this->verification_status,
            'rejection_reason' => $this->rejection_reason,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
