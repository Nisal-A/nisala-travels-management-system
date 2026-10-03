<?php

namespace App\Http\Controllers;

use App\Events\DocumentUploaded;
use App\Http\Requests\StoreCustomerDocumentRequest;
use App\Models\Customer;
use App\Models\CustomerDocument;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CustomerDocumentController extends Controller
{
    /**
     * Store a newly created document for the specified customer.
     */
    public function store(StoreCustomerDocumentRequest $request, Customer $customer)
    {
        Gate::authorize('upload', [CustomerDocument::class, $customer]);

        $file = $request->file('file');

        if (! $file->isValid()) {
            return back()->withErrors(['file' => 'Upload failed. Please try again.']);
        }

        // Generate document ID
        $latestDoc = CustomerDocument::withTrashed()->orderBy('id', 'desc')->first();
        $nextId = $latestDoc ? $latestDoc->id + 1 : 1;
        $documentId = 'DOC-'.str_pad($nextId, 5, '0', STR_PAD_LEFT);

        // Generate secure filename
        $extension = $file->getClientOriginalExtension();
        $secureFilename = Str::random(40).'.'.$extension;
        $storagePath = "customers/{$customer->id}/documents/{$documentId}/{$secureFilename}";

        try {
            DB::beginTransaction();

            // Find existing active document of the same type
            $existingActiveDocs = CustomerDocument::where('customer_id', $customer->id)
                ->where('document_type_id', $request->input('document_type_id'))
                ->where('document_status', 'active')
                ->lockForUpdate()
                ->get();

            // Create database record first
            $document = new CustomerDocument([
                'customer_id' => $customer->id,
                'document_type_id' => $request->input('document_type_id'),
                'storage_path' => $storagePath,
                'original_filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'file_extension' => $extension,
                'document_status' => 'active',
                'verification_status' => 'Pending',
                'expiry_date' => $request->input('expiry_date'),
                'notes' => $request->input('notes'),
                'uploaded_by' => $request->user()->id,
            ]);
            $document->document_id = $documentId;
            $document->save();

            // Mark old documents as superseded
            foreach ($existingActiveDocs as $oldDoc) {
                $oldDoc->document_status = 'superseded';
                $oldDoc->replaced_by_id = $document->id;
                $oldDoc->save();
            }

            // Store file
            $path = Storage::disk('private')->putFileAs(
                "customers/{$customer->id}/documents/{$documentId}",
                $file,
                $secureFilename
            );

            if (! $path) {
                throw new \Exception('Failed to store file to disk.');
            }

            DB::afterCommit(fn () => event(new DocumentUploaded($document)));

            DB::commit();

            return back()->with('success', 'Document uploaded successfully.');

        } catch (\Exception $e) {
            DB::rollBack();

            // Clean up the file if it was uploaded but DB failed
            if (Storage::disk('private')->exists($storagePath)) {
                Storage::disk('private')->deleteDirectory("customers/{$customer->id}/documents/{$documentId}");
            }

            return back()->withErrors(['file' => 'An error occurred while saving the document. Please try again.']);
        }
    }

    /**
     * Download the specified document.
     */
    public function download(Customer $customer, CustomerDocument $document)
    {
        Gate::authorize('view', clone $document); // pass document, policy handles ownership

        // Ensure document belongs to this customer
        if ($document->customer_id !== $customer->id) {
            abort(404);
        }

        if (! Storage::disk('private')->exists($document->storage_path)) {
            abort(404, 'Document file not found.');
        }

        return Storage::disk('private')->download(
            $document->storage_path,
            $document->original_filename
        );
    }
}
