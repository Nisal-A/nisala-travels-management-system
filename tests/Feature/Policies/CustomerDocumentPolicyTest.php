<?php

use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| NT-005.3 CustomerDocument Policy Tests
|--------------------------------------------------------------------------
|
| Tests verifying CustomerDocumentPolicy authorization:
|   - Role-based access for view, upload, verify, reject, delete
|   - Customer ownership (own documents only)
|   - Cross-customer IDOR prevention for documents
|   - Super Admin bypass
|
*/

beforeEach(function () {
    $this->seed(RoleSeeder::class);

    // Create document type (FK dependency)
    DB::table('document_types')->insert([
        'id' => 1,
        'name' => 'Passport',
        'is_required' => true,
        'is_active' => true,
        'tracks_expiry' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // Customer A with document
    $this->customerUserA = User::factory()->customer()->create();
    $this->customerA = Customer::create([
        'user_id' => $this->customerUserA->id,
        'customer_id' => 'CUST-001',
        'full_name' => 'Customer A',
        'phone' => '0771234567',
        'email' => 'customera@example.com',
    ]);
    $this->documentA = CustomerDocument::create([
        'document_id' => 'DOC-00001',
        'customer_id' => $this->customerA->id,
        'document_type_id' => 1,
        'storage_path' => 'private/documents/passport_a.pdf',
        'original_filename' => 'passport_a.pdf',
    ]);

    // Customer B with document
    $this->customerUserB = User::factory()->customer()->create();
    $this->customerB = Customer::create([
        'user_id' => $this->customerUserB->id,
        'customer_id' => 'CUST-002',
        'full_name' => 'Customer B',
        'phone' => '0779876543',
        'email' => 'customerb@example.com',
    ]);
    $this->documentB = CustomerDocument::create([
        'document_id' => 'DOC-00002',
        'customer_id' => $this->customerB->id,
        'document_type_id' => 1,
        'storage_path' => 'private/documents/passport_b.pdf',
        'original_filename' => 'passport_b.pdf',
    ]);
});

// ------------------------------------------------------------------
// Super Admin
// ------------------------------------------------------------------

test('super admin can view any document', function () {
    $user = User::factory()->superAdmin()->create();
    expect($user->can('view', $this->documentA))->toBeTrue();
});

test('super admin can verify any document', function () {
    $user = User::factory()->superAdmin()->create();
    expect($user->can('verify', $this->documentA))->toBeTrue();
});

test('super admin can delete any document', function () {
    $user = User::factory()->superAdmin()->create();
    expect($user->can('delete', $this->documentA))->toBeTrue();
});

// ------------------------------------------------------------------
// Manager
// ------------------------------------------------------------------

test('manager can view any document', function () {
    $user = User::factory()->manager()->create();
    expect($user->can('view', $this->documentA))->toBeTrue();
});

test('manager can verify documents', function () {
    $user = User::factory()->manager()->create();
    expect($user->can('verify', $this->documentA))->toBeTrue();
});

test('manager can reject documents', function () {
    $user = User::factory()->manager()->create();
    expect($user->can('reject', $this->documentA))->toBeTrue();
});

test('manager can delete documents', function () {
    $user = User::factory()->manager()->create();
    expect($user->can('delete', $this->documentA))->toBeTrue();
});

// ------------------------------------------------------------------
// Staff
// ------------------------------------------------------------------

test('staff can view any document', function () {
    $user = User::factory()->staff()->create();
    expect($user->can('view', $this->documentA))->toBeTrue();
});

test('staff can upload documents', function () {
    $user = User::factory()->staff()->create();
    expect($user->can('upload', [CustomerDocument::class, $this->customerA]))->toBeTrue();
});

test('staff can verify documents', function () {
    $user = User::factory()->staff()->create();
    expect($user->can('verify', $this->documentA))->toBeTrue();
});

test('staff can reject documents', function () {
    $user = User::factory()->staff()->create();
    expect($user->can('reject', $this->documentA))->toBeTrue();
});

test('staff cannot delete documents', function () {
    $user = User::factory()->staff()->create();
    expect($user->can('delete', $this->documentA))->toBeFalse();
});

// ------------------------------------------------------------------
// Finance — no document access
// ------------------------------------------------------------------

test('finance cannot view documents', function () {
    $user = User::factory()->finance()->create();
    expect($user->can('view', $this->documentA))->toBeFalse();
});

test('finance cannot upload documents', function () {
    $user = User::factory()->finance()->create();
    expect($user->can('upload', [CustomerDocument::class, $this->customerA]))->toBeFalse();
});

test('finance cannot verify documents', function () {
    $user = User::factory()->finance()->create();
    expect($user->can('verify', $this->documentA))->toBeFalse();
});

// ------------------------------------------------------------------
// Customer — own documents only
// ------------------------------------------------------------------

test('customer can view their own document', function () {
    expect($this->customerUserA->can('view', $this->documentA))->toBeTrue();
});

test('customer cannot view another customer document', function () {
    expect($this->customerUserA->can('view', $this->documentB))->toBeFalse();
});

test('customer can upload to their own profile', function () {
    expect($this->customerUserA->can('upload', [CustomerDocument::class, $this->customerA]))->toBeTrue();
});

test('customer cannot upload to another customer profile', function () {
    expect($this->customerUserA->can('upload', [CustomerDocument::class, $this->customerB]))->toBeFalse();
});

test('customer cannot verify documents', function () {
    expect($this->customerUserA->can('verify', $this->documentA))->toBeFalse();
});

test('customer cannot reject documents', function () {
    expect($this->customerUserA->can('reject', $this->documentA))->toBeFalse();
});

test('customer cannot delete documents', function () {
    $this->documentA->update(['verification_status' => 'verified']);
    expect($this->customerUserA->can('delete', $this->documentA))->toBeFalse();
});
