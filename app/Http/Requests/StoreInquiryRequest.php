<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $merge = [];

        if (!$this->has('children') || $this->input('children') === null) {
            $merge['children'] = 0;
        }

        if ($this->has('phone') && is_string($this->input('phone'))) {
            $cleanedPhone = preg_replace('/[\s\-]+/', '', $this->input('phone'));
            $merge['phone'] = $cleanedPhone === '' ? null : $cleanedPhone;
        }

        if ($this->has('message') && is_string($this->input('message'))) {
            $merge['message'] = strip_tags($this->input('message'));
        }

        if (!empty($merge)) {
            $this->merge($merge);
        }
    }

    public function rules(): array
    {
        return [
            'interest' => ['required', Rule::in(config('public_inquiry.interests', []))],
            'tour_slug' => [
                'nullable',
                'string',
                Rule::exists('tour_packages', 'slug')
                    ->where('status', 'active')
                    ->where('is_active', true)
                    ->whereNull('deleted_at'),
            ],
            'destination_slug' => [
                'nullable',
                'string',
                Rule::exists('destinations', 'slug')
                    ->whereIn('status', ['active', 'coming_soon'])
                    ->whereNull('deleted_at'),
            ],
            'start_date' => ['nullable', 'date', 'after_or_equal:today'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'flexible_dates' => ['nullable', 'boolean'],
            'adults' => ['required', 'integer', 'between:1,30'],
            'children' => ['integer', 'between:0,20'],
            'child_ages' => ['nullable', 'array'],
            'child_ages.*' => ['integer', 'between:0,17'],
            'full_name' => ['required', 'string', 'between:2,80'],
            'email' => ['required', 'email', 'max:254'],
            'phone' => [
                in_array($this->input('preferred_contact'), ['whatsapp', 'phone'], true) ? 'required' : 'nullable',
                'string',
                'regex:/^\+?[0-9]{9,15}$/',
            ],
            'preferred_contact' => ['required', Rule::in(config('public_inquiry.preferred_contact', []))],
            'country' => ['nullable', 'string', 'max:80'],
            'message' => ['nullable', 'string', 'max:1000'],
            'budget_range' => ['nullable', Rule::in(config('public_inquiry.budget_ranges', []))],
            'referral_source' => ['nullable', Rule::in(config('public_inquiry.referral_sources', []))],
            'privacy_consent' => ['accepted'],
            'marketing_consent' => ['nullable', 'boolean'],
            'website' => ['nullable'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $children = (int) $this->input('children', 0);
            $childAges = $this->input('child_ages');

            if ($children === 0) {
                if (!empty($childAges)) {
                    $validator->errors()->add('child_ages', 'Child ages must be empty when there are no children.');
                }
            } else {
                $count = is_array($childAges) ? count($childAges) : 0;
                if ($count !== $children) {
                    $validator->errors()->add('child_ages', "The count of child ages ({$count}) must equal the number of children ({$children}).");
                }
            }
        });
    }
}
