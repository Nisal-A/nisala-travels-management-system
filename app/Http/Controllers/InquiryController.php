<?php

namespace App\Http\Controllers;

use App\Events\InquirySubmitted;
use App\Http\Requests\StoreInquiryRequest;
use App\Models\Destination;
use App\Models\Inquiry;
use App\Models\TourPackage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class InquiryController extends Controller
{
    public function store(StoreInquiryRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $reference = Inquiry::generateReference();

        $tour = !empty($validated['tour_slug'])
            ? TourPackage::published()->where('slug', $validated['tour_slug'])->first()
            : null;

        $destination = !empty($validated['destination_slug'])
            ? Destination::published()->where('slug', $validated['destination_slug'])->first()
            : null;

        $adults = (int) $validated['adults'];
        $children = (int) ($validated['children'] ?? 0);

        $lead = Inquiry::create([
            'reference' => $reference,
            'name' => $validated['full_name'],
            'contact_information' => $validated['email'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'preferred_contact' => $validated['preferred_contact'],
            'country' => $validated['country'] ?? null,
            'interest' => $validated['interest'],
            'message' => $validated['message'] ?? null,
            'referral_source' => $validated['referral_source'] ?? null,
            'budget_range' => $validated['budget_range'] ?? null,
            'tour_package_id' => $tour?->id,
            'destination_id' => $destination?->id,
            'destination' => $destination?->city_region,
            'package_interest' => $tour?->package_name,
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'flexible_dates' => (bool) ($validated['flexible_dates'] ?? false),
            'adults' => $adults,
            'children' => $children,
            'child_ages' => $validated['child_ages'] ?? null,
            'travel_date' => $validated['start_date'] ?? null,
            'number_of_travelers' => $adults + $children,
            'status' => 'New',
            'source' => 'website',
            'privacy_consent_at' => now(),
            'marketing_consent_at' => !empty($validated['marketing_consent']) ? now() : null,
            'submitted_at' => now(),
            'ip_hash' => hash_hmac(
                'sha256',
                (string) $request->attributes->get('client_ip', $request->ip()),
                (string) config('services.nisala_web.ip_salt')
            ),
            'user_agent' => Str::limit($request->userAgent() ?? '', 255, ''),
        ]);

        DB::afterCommit(fn () => event(new InquirySubmitted($lead)));

        Log::info('public inquiry stored', ['reference' => $reference, 'status' => 201]);

        return response()->json(['reference' => $reference], 201);
    }
}
