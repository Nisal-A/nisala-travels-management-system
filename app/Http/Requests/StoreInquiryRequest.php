<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => ['required', 'string', 'max:255'],
            'tour_package_id' => 'nullable|exists:tour_packages,id',
            'destination_interest' => 'nullable|string|max:255',
            'preferred_travel_month' => 'nullable|string|max:255',
            'number_of_travelers' => 'nullable|integer|min:1|max:50',
            'message' => 'nullable|string|max:2000',
            'consent' => 'accepted',
            'website_field' => 'nullable|string',
        ];
    }
    
    protected function prepareForValidation()
    {
        if ($this->has('message')) {
            $this->merge([
                'message' => strip_tags($this->message),
            ]);
        }
    }
}
