<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTourPackageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\TourPackage::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'package_name' => ['required', 'string', 'max:255'],
            'destination_id' => ['required', 'exists:destinations,id'],
            'tour_category_id' => ['required', 'exists:tour_categories,id'],
            'description' => ['nullable', 'string'],
            'duration_days' => ['required', 'integer', 'min:1'],
            'duration_nights' => ['required', 'integer', 'min:0'],
            'price' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'capacity' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'in:draft,active,inactive,archived'],
            'included_items' => ['nullable', 'string'],
            'excluded_items' => ['nullable', 'string'],
            'terms' => ['nullable', 'string'],
            'itineraries' => ['nullable', 'array'],
            'itineraries.*.day_number' => ['required_with:itineraries', 'integer', 'min:1'],
            'itineraries.*.title' => ['required_with:itineraries', 'string', 'max:255'],
            'itineraries.*.activities' => ['nullable', 'string'],
            'itineraries.*.accommodation' => ['nullable', 'string'],
            'itineraries.*.meals' => ['nullable', 'string'],
            'itineraries.*.transportation' => ['nullable', 'string'],
            'itineraries.*.description' => ['nullable', 'string'],
            'itineraries.*.notes' => ['nullable', 'string'],
        ];
    }
}
