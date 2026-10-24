<?php

namespace App\Http\Requests;

use App\Models\Destination;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreTourPackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['super_admin', 'manager', 'staff']);
    }

    protected function prepareForValidation(): void
    {
        $merge = [];
        if (!$this->filled('slug') && $this->filled('package_name')) {
            $merge['slug'] = Str::slug($this->input('package_name'));
        }
        if (!$this->filled('currency')) {
            $merge['currency'] = 'LKR';
        }
        if ($this->has('is_active')) {
            $merge['is_active'] = $this->boolean('is_active');
        }
        if ($this->has('is_featured')) {
            $merge['is_featured'] = $this->boolean('is_featured');
        }
        if (!empty($merge)) {
            $this->merge($merge);
        }
    }

    public function rules(): array
    {
        $rules = [
            // Basics
            'destination_id' => [
                'required',
                Rule::exists('destinations', 'id')->where('status', 'active'),
            ],
            'package_name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', 'unique:tour_packages,slug'],
            'status' => ['required', 'string', Rule::in(['active', 'inactive', 'archived'])],
            'is_active' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],

            // Pricing and seats
            'price' => ['required', 'numeric', 'min:0'],
            'price_from' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'max:3'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'available_seats' => [
                'nullable',
                'integer',
                'min:0',
                function ($attribute, $value, $fail) {
                    $capacity = $this->input('capacity');
                    if ($value !== null && $capacity !== null && (int) $value > (int) $capacity) {
                        $fail('The available seats must not exceed capacity.');
                    }
                },
            ],
            'group_min' => ['nullable', 'integer', 'min:1'],
            'group_max' => [
                'nullable',
                'integer',
                'min:1',
                function ($attribute, $value, $fail) {
                    $min = $this->input('group_min');
                    if ($value !== null && $min !== null && (int) $value < (int) $min) {
                        $fail('The group max must be greater than or equal to group min.');
                    }
                },
            ],

            // Tier
            'tier' => [
                'nullable',
                'string',
                Rule::in(array_keys(config('tour_tiers.tiers', []))),
                function ($attribute, $value, $fail) {
                    if (empty($value)) {
                        return;
                    }

                    $destinationId = $this->input('destination_id');
                    if (!$destinationId) {
                        return;
                    }

                    $destination = Destination::find($destinationId);
                    if (!$destination) {
                        return;
                    }

                    $allowedTiers = config("tour_tiers.allowed_by_destination.{$destination->slug}", []);
                    if (!in_array($value, $allowedTiers, true)) {
                        $fail("The selected tier is not allowed for destination {$destination->city_region}.");
                    }
                },
            ],

            // Duration and dates
            'duration_days' => ['nullable', 'integer', 'min:1'],
            'duration_nights' => ['nullable', 'integer', 'min:0'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'departure_months' => ['nullable', 'array'],
            'departure_months.*' => ['nullable', 'string', 'max:50'],

            // Content
            'short_description' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'highlights' => ['nullable', 'array'],
            'highlights.*' => ['nullable', 'string', 'max:255'],
            'itinerary' => ['nullable', 'array'],
            'itinerary.*.day' => ['nullable', 'integer', 'min:1'],
            'itinerary.*.title' => ['nullable', 'string', 'max:255'],
            'itinerary.*.description' => ['nullable', 'string'],
            'included_items' => ['nullable', 'string'],
            'excluded_items' => ['nullable', 'string'],
            'hotel_information' => ['nullable', 'string'],
            'transportation_information' => ['nullable', 'string'],
            'meals' => ['nullable', 'string'],
            'terms' => ['nullable', 'string'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['nullable', 'string', 'max:100'],
            'faqs' => ['nullable', 'array'],
            'faqs.*.question' => ['nullable', 'string', 'max:500'],
            'faqs.*.answer' => ['nullable', 'string'],

            // Images
            'gallery' => ['nullable', 'array'],
            'gallery_files' => ['nullable', 'array'],
            'gallery_files.*' => ['file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
        ];

        if ($this->hasFile('hero_image')) {
            $rules['hero_image'] = ['file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'];
        } else {
            $rules['hero_image'] = ['nullable', 'string', 'max:500'];
        }

        if ($this->hasFile('gallery')) {
            $rules['gallery.*'] = ['file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'];
        }

        return $rules;
    }
}
