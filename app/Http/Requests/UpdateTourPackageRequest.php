<?php

namespace App\Http\Requests;

use App\Models\Destination;
use App\Models\TourPackage;
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

            'group_min' => ['nullable', 'integer', 'min:1'],
            'group_max' => [
                'nullable',
                'integer',
                'min:1',
                function ($attribute, $value, $fail) {
                    $min = $this->input('group_min');
                    if ($min === null && $this->route('tour')) {
                        $tour = $this->route('tour') instanceof TourPackage
                            ? $this->route('tour')
                            : TourPackage::find($this->route('tour'));
                        $min = $tour?->group_min;
                    }
                    if ($value !== null && $min !== null && $value < $min) {
                        $fail('The group max must be greater than or equal to group min.');
                    }
                },
            ],
            'tier' => [
                'nullable',
                'string',
                Rule::in(array_keys(config('tour_tiers.tiers', []))),
                function ($attribute, $value, $fail) {
                    if (empty($value)) {
                        return;
                    }

                    $destinationId = $this->input('destination_id');
                    if (! $destinationId && $this->route('tour')) {
                        $tour = $this->route('tour') instanceof TourPackage
                            ? $this->route('tour')
                            : TourPackage::find($this->route('tour'));
                        $destinationId = $tour?->destination_id;
                    }

                    if (! $destinationId) {
                        return;
                    }

                    $destination = Destination::find($destinationId);
                    if (! $destination) {
                        return;
                    }

                    $allowedTiers = config("tour_tiers.allowed_by_destination.{$destination->slug}", []);
                    if (! in_array($value, $allowedTiers, true)) {
                        $fail("The selected tier is not allowed for destination {$destination->city_region}.");
                    }
                },
            ],
        ];
    }
}
