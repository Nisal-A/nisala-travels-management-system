<?php

namespace App\Http\Requests;

use App\Models\Destination;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateDestinationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['super_admin', 'manager', 'staff']);
    }

    protected function prepareForValidation(): void
    {
        if (!$this->filled('slug') && $this->filled('city_region')) {
            $this->merge([
                'slug' => Str::slug($this->input('city_region')),
            ]);
        }
    }

    public function rules(): array
    {
        $destination = $this->route('destination');
        $id = $destination instanceof Destination ? $destination->id : $destination;

        $rules = [
            'country' => ['required', 'string', 'max:255'],
            'city_region' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('destinations', 'slug')->ignore($id)],
            'listing_state' => ['required', 'string', Destination::listingStateRule()],
            'status' => ['required', 'string', Rule::in(['active', 'inactive'])],
            'region' => ['nullable', 'string', Rule::in(['south-asia', 'southeast-asia'])],
            'tagline' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'travel_information' => ['nullable', 'string'],
            'best_months' => ['nullable', 'string', 'max:255'],
            'highlights' => ['nullable', 'array'],
            'highlights.*' => ['nullable', 'string', 'max:255'],
            'facts' => ['nullable', 'array'],
            'facts.*.label' => ['nullable', 'string', 'max:255'],
            'facts.*.value' => ['nullable', 'string', 'max:255'],
            'recommendations' => ['nullable', 'array'],
            'recommendations.*' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
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

