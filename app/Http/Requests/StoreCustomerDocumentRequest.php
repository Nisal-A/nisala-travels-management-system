<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorized via controller
    }

    public function rules(): array
    {
        return [
            'document_type_id' => ['required', 'integer', 'exists:document_types,id'],
            'file' => [
                'required',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:10240', // 10MB max
            ],
            'notes' => ['nullable', 'string', 'max:1000'],
            'expiry_date' => ['nullable', 'date'],
        ];
    }
    
    public function messages(): array
    {
        return [
            'file.mimes' => 'The document must be a PDF, JPG, or PNG file.',
            'file.max' => 'The document size must not exceed 10MB.',
        ];
    }
}
