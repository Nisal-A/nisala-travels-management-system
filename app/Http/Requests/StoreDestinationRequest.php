<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDestinationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['super_admin', 'manager', 'staff']);
    }

    public function rules(): array
    {
        return [
            'country' => ['required', 'string', 'max:255'],
            'city_region' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'travel_information' => ['nullable', 'string'],
            'status' => ['required', 'string', Rule::in(['active', 'inactive'])],
        ];
    }
}
