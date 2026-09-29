<?php

use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Models\DocumentType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('document type can be created and retrieved', function () {
    $type = DocumentType::create([
        'name' => 'Passport',
        'description' => 'National Passport',
        'is_required' => true,
        'tracks_expiry' => true,
    ]);

    expect($type->id)->not->toBeNull();
    expect($type->name)->toBe('Passport');
    expect($type->is_required)->toBeTrue();
    expect($type->tracks_expiry)->toBeTrue();
    
    // Test defaults
    $type->refresh();
    expect($type->is_active)->toBeTrue();
});

test('customer document can be created and associated', function () {
    $customer = Customer::factory()->create();
    $type = DocumentType::factory()->create(['name' => 'NIC']);

    $document = CustomerDocument::create([
        'document_id' => 'DOC-0001',
        'customer_id' => $customer->id,
        'document_type_id' => $type->id,
        'storage_path' => "customers/{$customer->id}/documents/DOC-0001.pdf",
        'original_filename' => 'my-nic.pdf',
        'mime_type' => 'application/pdf',
        'file_size' => 2048,
        'file_extension' => 'pdf',
        'document_status' => 'active',
    ]);

    // Check creation
    expect($document->id)->not->toBeNull();
    expect($document->document_id)->toBe('DOC-0001');

    // Check relationship from document
    expect($document->customer->id)->toBe($customer->id);
    expect($document->documentType->id)->toBe($type->id);

    // Check relationship from customer
    $customer->refresh();
    expect($customer->documents)->toHaveCount(1);
    expect($customer->documents->first()->id)->toBe($document->id);
});

test('customer document handles soft deletes', function () {
    $document = CustomerDocument::factory()->create();
    
    $document->delete();
    
    $this->assertSoftDeleted('customer_documents', ['id' => $document->id]);
    
    // Check it's not in normal queries
    expect(CustomerDocument::count())->toBe(0);
    
    // Check it is in trashed queries
    expect(CustomerDocument::withTrashed()->count())->toBe(1);
});

test('foreign key constraints prevent invalid associations', function () {
    $type = DocumentType::factory()->create();

    // Should throw exception for invalid customer_id
    expect(fn () => CustomerDocument::create([
        'document_id' => 'DOC-ERR',
        'customer_id' => 99999, // Invalid
        'document_type_id' => $type->id,
        'storage_path' => 'path/to/file',
        'original_filename' => 'file.pdf',
    ]))->toThrow(\Illuminate\Database\QueryException::class);
});

test('private storage disk is configured correctly', function () {
    $config = config('filesystems.disks.private');
    
    expect($config)->not->toBeNull();
    expect($config['driver'])->toBe('local');
    expect($config['root'])->toBe(storage_path('app/private'));
    expect($config['serve'] ?? false)->toBeFalse(); // Should not be publicly served
});

test('can use private storage to store and retrieve files', function () {
    Storage::fake('private');
    
    $content = 'Fake PDF Content';
    $path = 'customers/1/documents/DOC-123.pdf';
    
    Storage::disk('private')->put($path, $content);
    
    Storage::disk('private')->assertExists($path);
    expect(Storage::disk('private')->get($path))->toBe($content);
});
