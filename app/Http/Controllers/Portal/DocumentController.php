<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Resources\Portal\DocumentResource;
use App\Models\CustomerDocument;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
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

    public function store(Request $request)
    {
        $customer = $request->user()->customer;
        $this->authorize('upload', $customer);

        // Stub implementation
        return back()->with('success', 'Document uploaded');
    }

    public function destroy(CustomerDocument $document)
    {
        $this->authorize('delete', $document);

        $document->delete();

        return back()->with('success', 'Document deleted');
    }
}
