<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTourPackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['super_admin', 'manager', 'staff']);
    }

    public function rules(): array
    {
        return [
            'destination_id' => ['required', 'exists:destinations,id'],
            'package_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'duration_days' => ['nullable', 'integer', 'min:1'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'price' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'available_seats' => ['nullable', 'integer', 'min:0', 'lte:capacity'],
            'hotel_information' => ['nullable', 'string'],
            'transportation_information' => ['nullable', 'string'],
            'meals' => ['nullable', 'string'],
            'included_items' => ['nullable', 'string'],
            'excluded_items' => ['nullable', 'string'],
            'terms' => ['nullable', 'string'],
            'status' => ['required', 'string', Rule::in(['active', 'inactive', 'archived'])],
        ];
    }
}
