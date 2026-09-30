<?php

namespace Database\Factories;

use App\Models\CustomerDocument;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CustomerDocument>
 */
class CustomerDocumentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'document_id' => 'DOC-' . $this->faker->unique()->numberBetween(10000, 99999),
            'customer_id' => \App\Models\Customer::factory(),
            'document_type_id' => \App\Models\DocumentType::factory(),
            'storage_path' => 'customers/documents/dummy.pdf',
            'original_filename' => 'document.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 1024,
            'file_extension' => 'pdf',
            'document_status' => 'active',
            'verification_status' => 'Pending',
        ];
    }
}
