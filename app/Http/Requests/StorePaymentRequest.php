<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Handled in controller via policy
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'booking_id' => ['required', 'exists:bookings,id'],
            'amount' => ['required', 'numeric', 'min:1'],
            'payment_method' => ['required', 'string', Rule::enum(PaymentMethod::class)],
            'payment_date' => ['required', 'date', 'before_or_equal:today'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
