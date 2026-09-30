<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Http\Resources\Portal\PaymentResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class PaymentController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $customer = $request->user()->customer;
        
        $payments = Payment::where('customer_id', $customer->id)
            ->with('booking')
            ->orderBy('payment_date', 'desc')
            ->paginate(10);
            
        return Inertia::render('Portal/Payments', [
            'payments' => PaymentResource::collection($payments),
        ]);
    }
    
    public function receipt(Payment $payment)
    {
        $this->authorize('view', $payment);
        
        // Stub for receipt download
        return response()->download(storage_path('app/public/stub-receipt.pdf')); // Stub
    }
}
