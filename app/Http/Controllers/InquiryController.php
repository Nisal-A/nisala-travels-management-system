<?php

namespace App\Http\Controllers;

use App\Events\InquirySubmitted;
use App\Http\Requests\StoreInquiryRequest;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class InquiryController extends Controller
{
    public function store(StoreInquiryRequest $request)
    {
        if ($request->filled('website_field')) {
            // Honeypot triggered
            return response()->json(['message' => 'Inquiry submitted successfully'], 200);
        }

        $submitTime = session('form_start_time', 0);
        if ($submitTime > 0 && time() - $submitTime < 3) {
            // Time-based check triggered - submitted too quickly
            return response()->json(['message' => 'Inquiry submitted successfully'], 200);
        }

        $emailKey = 'inquiry_email_'.$request->input('email');
        if (RateLimiter::tooManyAttempts($emailKey, 3)) {
            return response()->json(['message' => 'Too many inquiries from this email address. Please try again later.'], 429);
        }
        RateLimiter::hit($emailKey, 3600);

        $validated = $request->validated();

        $existing = Customer::where('email', $validated['email'])
            ->orWhere('phone', $validated['phone'])
            ->first();

        $notes = 'Destination Interest: '.($validated['destination_interest'] ?? 'N/A')."\n";
        $notes .= 'Travel Month: '.($validated['preferred_travel_month'] ?? 'N/A')."\n";
        $notes .= 'Travelers: '.($validated['number_of_travelers'] ?? 'N/A')."\n";
        $notes .= 'Package ID: '.($validated['tour_package_id'] ?? 'N/A')."\n";
        $notes .= 'Message: '.($validated['message'] ?? 'N/A');

        if ($existing && in_array($existing->status, ['New', 'active'])) {
            $existing->notes = $existing->notes."\n\n--- New Inquiry ---\n".$notes;
            $existing->save();
            $lead = $existing;
        } else {
            $lead = Customer::create([
                'customer_id' => 'CUS-'.strtoupper(Str::random(6)),
                'full_name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'status' => 'New',
                'source' => 'website',
                'notes' => $notes,
            ]);
        }

        DB::afterCommit(fn () => event(new InquirySubmitted($lead)));

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Inquiry submitted successfully']);
        }

        return redirect()->back()->with('success', 'Inquiry submitted successfully');
    }
}
