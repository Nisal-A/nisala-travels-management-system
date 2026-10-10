<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['super_admin', 'manager', 'staff', 'finance']);
    }

    public function rules(): array
    {
        return [
            'notifications' => ['required', 'array'],
        ];
    }
}
