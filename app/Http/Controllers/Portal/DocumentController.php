<?php

namespace App\Http\Controllers\Portal;

use App\Events\DocumentUploaded;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerDocumentRequest;
use App\Http\Resources\Portal\DocumentResource;
use App\Models\CustomerDocument;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DocumentController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $customer = $request->user()->customer;

        $documents = CustomerDocument::where('customer_id', $customer->id)
            ->with('documentType')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Portal/Documents', [
            'documents' => DocumentResource::collection($documents),
        ]);
    }

    public function store(StoreCustomerDocumentRequest $request)
    {
        $customer = $request->user()->customer;
        $this->authorize('upload', [CustomerDocument::class, $customer]);

        $file = $request->file('file');
        if (! $file || ! $file->isValid()) {
            return back()->withErrors(['file' => 'Upload failed. Please try again.']);
        }

        $latestDoc = CustomerDocument::withTrashed()->orderBy('id', 'desc')->first();
        $nextId = $latestDoc ? $latestDoc->id + 1 : 1;
        $documentId = 'DOC-'.str_pad((string) $nextId, 5, '0', STR_PAD_LEFT);

        $extension = strtolower($file->getClientOriginalExtension());
        $secureFilename = Str::random(40).'.'.$extension;
        $storagePath = "customers/{$customer->id}/documents/{$documentId}/{$secureFilename}";

        try {
            DB::beginTransaction();

            $existingActiveDocs = CustomerDocument::where('customer_id', $customer->id)
                ->where('document_type_id', $request->input('document_type_id'))
                ->where('document_status', 'active')
                ->lockForUpdate()
                ->get();

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

            foreach ($existingActiveDocs as $oldDoc) {
                $oldDoc->document_status = 'superseded';
                $oldDoc->replaced_by_id = $document->id;
                $oldDoc->save();
            }

            $path = Storage::disk('private')->putFileAs(
                "customers/{$customer->id}/documents/{$documentId}",
                $file,
                $secureFilename
            );

            if (! $path) {
                throw new \RuntimeException('Failed to store file to private disk.');
            }

            DB::afterCommit(fn () => event(new DocumentUploaded($document)));

            DB::commit();

            return back()->with('success', 'Document uploaded successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();

            if (Storage::disk('private')->exists($storagePath)) {
                Storage::disk('private')->deleteDirectory("customers/{$customer->id}/documents/{$documentId}");
            }

            return back()->withErrors(['file' => 'An error occurred while saving the document. Please try again.']);
        }
    }

    public function download(CustomerDocument $document)
    {
        $this->authorize('view', $document);

        if (! Storage::disk('private')->exists($document->storage_path)) {
            abort(404, 'Document file not found.');
        }

        return Storage::disk('private')->download(
            $document->storage_path,
            $document->original_filename
        );
    }

    public function destroy(CustomerDocument $document)
    {
        $this->authorize('delete', $document);

        $document->delete();

        return back()->with('success', 'Document deleted');
    }
}
