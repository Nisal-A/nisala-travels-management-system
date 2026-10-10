<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppearanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Any staff can update their own appearance preferences
        return $this->user()->hasAnyRole(['super_admin', 'manager', 'staff', 'finance']);
    }

    public function rules(): array
    {
        return [
            'theme' => ['required', 'in:light,dark,system'],
            'density' => ['required', 'in:comfortable,compact'],
        ];
    }
}
