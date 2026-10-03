<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerRequest extends FormRequest
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
            'full_name' => ['required', 'string', 'max:255'],
            'nic' => ['nullable', 'string', 'max:20', 'unique:customers,nic,'.$this->customer->id],
            'passport_number' => ['nullable', 'string', 'max:20', 'unique:customers,passport_number,'.$this->customer->id],
            'dob' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'string', 'in:Male,Female,Other'],
            'nationality' => ['nullable', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:20'],
            'whatsapp' => ['nullable', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:20'],
            'status' => ['required', 'string', 'in:active,inactive'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
