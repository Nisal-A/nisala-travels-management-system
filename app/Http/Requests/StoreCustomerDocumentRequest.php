<?php

namespace App\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

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
                'mimes:pdf,jpg,jpeg,png,webp',
                'max:10240', // 10MB max
                function (string $attribute, mixed $value, Closure $fail): void {
                    if (! $value instanceof UploadedFile) {
                        return;
                    }

                    $ext = strtolower((string) $value->getClientOriginalExtension());
                    $name = strtolower((string) $value->getClientOriginalName());
                    $mime = strtolower((string) $value->getMimeType());

                    $blockedExtensions = ['svg', 'svgz', 'php', 'phtml', 'phar', 'sh', 'exe', 'bat', 'cmd', 'com', 'msi', 'js', 'html', 'htm'];

                    if (
                        in_array($ext, $blockedExtensions, true)
                        || preg_match('/\.(svg|svgz|php\d?|phtml|phar|sh|exe|bat|cmd|com|msi|js|html?)\b/i', $name)
                        || str_contains($mime, 'svg')
                        || str_contains($mime, 'php')
                        || str_contains($mime, 'x-executable')
                        || str_contains($mime, 'x-msdownload')
                        || str_contains($mime, 'x-sh')
                    ) {
                        $fail('Executable or SVG uploads are not allowed.');
                    }
                },
            ],
            'notes' => ['nullable', 'string', 'max:1000'],
            'expiry_date' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.mimes' => 'The document must be a PDF, JPG, JPEG, PNG, or WEBP file.',
            'file.max' => 'The document size must not exceed 10MB.',
        ];
    }
}
