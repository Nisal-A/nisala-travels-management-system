<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLocalizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('super_admin');
    }

    public function rules(): array
    {
        return [
            'language' => ['required', 'string', 'in:en,si,ta'],
            'currency' => ['required', 'string', 'in:LKR,USD'],
            'date_format' => ['required', 'string'],
            'timezone' => ['required', 'string'],
        ];
    }
}
