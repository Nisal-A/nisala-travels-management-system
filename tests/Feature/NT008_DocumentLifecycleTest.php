<?php

use App\Enums\UserRole;
use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Models\DocumentType;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    Storage::fake('private');

    $this->manager = User::factory()->create();
    $this->manager->assignRole(UserRole::Manager->value);

    $this->staff = User::factory()->create();
    $this->staff->assignRole(UserRole::Staff->value);

    $this->finance = User::factory()->create();
    $this->finance->assignRole(UserRole::Finance->value);

    $this->customer = Customer::factory()->create();
    $this->documentType = DocumentType::factory()->create(['name' => 'Passport', 'tracks_expiry' => true]);

    $this->document = CustomerDocument::create([
        'document_id' => 'DOC-TEST',
        'customer_id' => $this->customer->id,
        'document_type_id' => $this->documentType->id,
        'storage_path' => 'private/test.pdf',
        'original_filename' => 'test.pdf',
        'verification_status' => 'Pending',
        'document_status' => 'active',
    ]);
});

test('manager can verify document', function () {
    $response = $this->actingAs($this->manager)
        ->patch("/customers/{$this->customer->id}/documents/{$this->document->id}/verify");

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Document verified successfully.');

    $this->document->refresh();
    expect($this->document->verification_status)->toBe('Verified');
    expect($this->document->verified_by)->toBe($this->manager->id);
    expect($this->document->verified_at)->not->toBeNull();
});

test('manager can reject document with reason', function () {
    $response = $this->actingAs($this->manager)
        ->patch("/customers/{$this->customer->id}/documents/{$this->document->id}/reject", [
            'reason' => 'Image is blurry',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Document rejected successfully.');

    $this->document->refresh();
    expect($this->document->verification_status)->toBe('Rejected');
    expect($this->document->rejection_reason)->toBe('Image is blurry');
});

test('rejecting document requires reason', function () {
    $response = $this->actingAs($this->manager)
        ->patch("/customers/{$this->customer->id}/documents/{$this->document->id}/reject", [
            'reason' => '',
        ]);

    $response->assertSessionHasErrors('reason');

    $this->document->refresh();
    expect($this->document->verification_status)->toBe('Pending');
});

test('finance cannot verify or reject document', function () {
    $response1 = $this->actingAs($this->finance)
        ->patch("/customers/{$this->customer->id}/documents/{$this->document->id}/verify");
    $response1->assertForbidden();

    $response2 = $this->actingAs($this->finance)
        ->patch("/customers/{$this->customer->id}/documents/{$this->document->id}/reject", [
            'reason' => 'Blurry',
        ]);
    $response2->assertForbidden();
});

test('customer cannot verify their own document', function () {
    $customerUser = User::factory()->create();
    $customerUser->assignRole(UserRole::Customer->value);
    $this->customer->update(['user_id' => $customerUser->id]);

    $response = $this->actingAs($customerUser)
        ->patch("/customers/{$this->customer->id}/documents/{$this->document->id}/verify");

    $response->assertForbidden();
});

test('uploading new document of same type supersedes old document', function () {
    $file = UploadedFile::fake()->create('passport_new.pdf', 1024, 'application/pdf');

    $response = $this->actingAs($this->manager)
        ->post("/customers/{$this->customer->id}/documents", [
            'document_type_id' => $this->documentType->id,
            'file' => $file,
        ]);

    $response->assertRedirect();

    $this->document->refresh();
    expect($this->document->document_status)->toBe('superseded');

    $newDoc = CustomerDocument::where('original_filename', 'passport_new.pdf')->first();
    expect($this->document->replaced_by_id)->toBe($newDoc->id);
    expect($newDoc->document_status)->toBe('active');
});

test('secure download requires authorization', function () {
    Storage::disk('private')->put('private/test.pdf', 'dummy content');

    // Manager can download
    $response = $this->actingAs($this->manager)
        ->get("/customers/{$this->customer->id}/documents/{$this->document->id}/download");
    $response->assertDownload('test.pdf');

    // Finance cannot download
    $response = $this->actingAs($this->finance)
        ->get("/customers/{$this->customer->id}/documents/{$this->document->id}/download");
    $response->assertForbidden();
});
