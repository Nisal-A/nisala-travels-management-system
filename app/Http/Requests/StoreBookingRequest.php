<?php

namespace App\Http\Requests;

use App\Enums\TravelerType;
use App\Models\Booking;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBookingRequest extends FormRequest
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
            'customer_id' => ['required', 'exists:customers,id'],
            'tour_package_id' => [
                'required',
                Rule::exists('tour_packages', 'id')
                    ->where('status', 'active')
                    ->where('is_active', true),
            ],
            'booking_date' => ['required', 'date'],
            'travel_date' => ['required', 'date', 'after_or_equal:booking_date'],
            'return_date' => ['nullable', 'date', 'after_or_equal:travel_date'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'assigned_to' => ['nullable', 'exists:employees,id'],

            'travelers' => ['required', 'array', 'min:1'],
            'travelers.*.full_name' => ['required', 'string', 'max:255'],
            'travelers.*.dob' => ['nullable', 'date'],
            'travelers.*.gender' => ['nullable', 'string', 'in:Male,Female,Other'],
            'travelers.*.nationality' => ['nullable', 'string', 'max:255'],
            'travelers.*.nic' => ['nullable', 'string', 'max:20'],
            'travelers.*.passport_number' => ['nullable', 'string', 'max:50'],
            'travelers.*.passport_expiry' => ['nullable', 'date'],
            'travelers.*.relationship_to_primary' => ['nullable', 'string', 'max:255'],
            'travelers.*.traveler_type' => ['required', 'string', Rule::enum(TravelerType::class)],
            'travelers.*.contact_information' => ['nullable', 'string', 'max:255'],
            'travelers.*.special_requirements' => ['nullable', 'string'],
            'travelers.*.notes' => ['nullable', 'string'],

            'extras' => ['nullable', 'array'],
            'extras.*.name' => ['required_with:extras', 'string'],
            'extras.*.price' => ['required_with:extras', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],

            'payment_plan' => ['nullable', 'string'],
            'deposit_amount' => ['nullable', 'numeric', 'min:0'],
            'payment_schedules' => ['nullable', 'array'],
            'payment_schedules.*.description' => ['required_with:payment_schedules', 'string'],
            'payment_schedules.*.amount' => ['required_with:payment_schedules', 'numeric', 'min:0'],
            'payment_schedules.*.due_date' => ['required_with:payment_schedules', 'date'],

            'record_payment' => ['nullable', 'boolean'],
            'payment_amount' => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['nullable', 'string'],
            'payment_reference' => ['nullable', 'string'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $discount = (float) $this->input('discount_amount', 0);
            if ($discount > 0) {
                if (! $this->user() || ! $this->user()->can('applyDiscount', Booking::class)) {
                    $validator->errors()->add('discount_amount', 'You do not have permission to apply discounts. Only managers can authorize discounts.');
                }
            }
        });
    }
}
