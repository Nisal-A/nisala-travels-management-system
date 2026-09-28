<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     * The stats sent to the frontend are strictly filtered based on the user's role.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $stats = [];
        $viewData = [];

        // Office Dashboard Data
        if ($user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Staff->value, UserRole::Finance->value])) {

            if ($user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Staff->value])) {
                $stats['totalCustomers'] = Customer::count();
                $stats['activeBookings'] = Booking::whereIn('booking_status', ['Pending', 'Confirmed'])->count();
                $stats['pendingDocuments'] = CustomerDocument::where('verification_status', 'Pending')->count();

                $viewData['recentBookings'] = Booking::with('customer:id,full_name')
                    ->latest()
                    ->take(5)
                    ->get(['id', 'booking_reference', 'customer_id', 'booking_status', 'created_at']);

                $viewData['recentCustomers'] = Customer::latest()
                    ->take(5)
                    ->get(['id', 'customer_id', 'full_name', 'email', 'phone', 'created_at']);
            }

            if ($user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value])) {
                $stats['totalEmployees'] = User::whereHas('roles', function ($q) {
                    $q->where('name', '!=', UserRole::Customer->value);
                })->count();
            }

            if ($user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Finance->value])) {
                $stats['paymentsThisMonth'] = Payment::whereMonth('payment_date', now()->month)
                    ->whereYear('payment_date', now()->year)
                    ->where('status', 'Completed')
                    ->sum('amount');

                $viewData['recentPayments'] = Payment::with('customer:id,full_name')
                    ->latest()
                    ->take(5)
                    ->get(['id', 'customer_id', 'amount', 'payment_method', 'status', 'created_at']);
            }

            $viewData['officeStats'] = $stats;
        }

        // Customer Portal Data
        if ($user->hasRole(UserRole::Customer->value)) {
            $viewData['customerStats'] = [
                'myBookings' => null,
                'myDocuments' => null,
                'myPayments' => null,
            ];
        }

        return Inertia::render('Dashboard', $viewData);
    }
}
