<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CustomerDocumentVerificationController extends Controller
{
    /**
     * Verify the specified document.
     */
    public function verify(Request $request, Customer $customer, CustomerDocument $document)
    {
        Gate::authorize('verify', clone $document);

        if ($document->customer_id !== $customer->id) {
            abort(404);
        }

        $document->verification_status = 'Verified';
        $document->verified_by = $request->user()->id;
        $document->verified_at = now();
        $document->rejection_reason = null;
        $document->save();

        return back()->with('success', 'Document verified successfully.');
    }

    /**
     * Reject the specified document.
     */
    public function reject(Request $request, Customer $customer, CustomerDocument $document)
    {
        Gate::authorize('reject', clone $document);

        if ($document->customer_id !== $customer->id) {
            abort(404);
        }

        $request->validate([
            'reason' => ['required', 'string', 'max:1000']
        ]);

        $document->verification_status = 'Rejected';
        $document->rejection_reason = $request->input('reason');
        $document->save();

        return back()->with('success', 'Document rejected successfully.');
    }
}
