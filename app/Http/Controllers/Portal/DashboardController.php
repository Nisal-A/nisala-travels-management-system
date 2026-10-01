<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Booking;
use App\Models\CustomerDocument;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $customer = $request->user()->customer;
        
        $nextBooking = Booking::where('customer_id', $customer->id)
            ->where('travel_date', '>=', now())
            ->with('tourPackage')
            ->orderBy('travel_date', 'asc')
            ->first();
            
        $daysRemaining = $nextBooking ? now()->startOfDay()->diffInDays($nextBooking->travel_date) : null;
        
        $totalOutstanding = Booking::where('customer_id', $customer->id)->sum('balance_amount');
        
        $missingDocs = CustomerDocument::where('customer_id', $customer->id)
            ->where(function($query) {
                $query->whereNull('verification_status')
                      ->orWhereRaw('LOWER(verification_status) = ?', ['rejected']);
            })->count();
            
        // Action items logic (simplified)
        $actionItems = [];
        if ($missingDocs > 0) {
            $actionItems[] = "$missingDocs documents missing or rejected.";
        }
        if ($totalOutstanding > 0) {
            $actionItems[] = "You have an outstanding balance of $totalOutstanding.";
        }
        
        return Inertia::render('Portal/Dashboard', [
            'nextBooking' => $nextBooking,
            'daysRemaining' => $daysRemaining,
            'totalOutstanding' => $totalOutstanding,
            'actionItems' => $actionItems,
        ]);
    }
}
