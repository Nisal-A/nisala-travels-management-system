<?php

namespace App\Http\Requests;

use App\Enums\TravelerType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_id' => ['sometimes', 'required', 'exists:customers,id'],
            'tour_package_id' => ['sometimes', 'required', 'exists:tour_packages,id'],
            'booking_date' => ['sometimes', 'required', 'date'],
            'travel_date' => ['sometimes', 'required', 'date'],
            'return_date' => ['nullable', 'date', 'after_or_equal:travel_date'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'assigned_to' => ['nullable', 'exists:employees,id'],

            'travelers' => ['sometimes', 'required', 'array', 'min:1'],
            'travelers.*.id' => ['nullable', 'exists:booking_travelers,id'],
            'travelers.*.full_name' => ['required_with:travelers', 'string', 'max:255'],
            'travelers.*.dob' => ['nullable', 'date'],
            'travelers.*.gender' => ['nullable', 'string', 'in:Male,Female,Other'],
            'travelers.*.nationality' => ['nullable', 'string', 'max:255'],
            'travelers.*.nic' => ['nullable', 'string', 'max:20'],
            'travelers.*.passport_number' => ['nullable', 'string', 'max:50'],
            'travelers.*.passport_expiry' => ['nullable', 'date'],
            'travelers.*.relationship_to_primary' => ['nullable', 'string', 'max:255'],
            'travelers.*.traveler_type' => ['required_with:travelers', 'string', Rule::enum(TravelerType::class)],
            'travelers.*.contact_information' => ['nullable', 'string', 'max:255'],
            'travelers.*.special_requirements' => ['nullable', 'string'],
            'travelers.*.notes' => ['nullable', 'string'],

            'extras' => ['nullable', 'array'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
