<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Employee;
use App\Notifications\NewInquiryNotification;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Illuminate\Database\Eloquent\Builder;

class InquiryAdminController extends Controller
{
    /**
     * Display a listing of the enquiries.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Inquiry::class);

        $query = Inquiry::query();

        // Filters
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }
        if ($interest = $request->input('interest')) {
            $query->where('interest', $interest);
        }
        if ($search = $request->input('search')) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhere('reference', 'like', "%$search%");
            });
        }

        $inquiries = $query->orderByDesc('submitted_at')
            ->paginate(20)
            ->withQueryString();

        // Summaries
        $newCount = Inquiry::where('status', 'New')->count();

        return Inertia::render('Inquiries/Index', [
            'inquiries' => $inquiries,
            'filters' => $request->all(),
            'summary' => ['new' => $newCount],
        ]);
    }

    /**
     * Show the enquiry detail.
     */
    public function show(Inquiry $inquiry)
    {
        Gate::authorize('view', $inquiry);

        // Mark notification as read for the current user
        $user = Auth::user();
        if ($user) {
            Notification::where('type', NewInquiryNotification::class)
                ->where('notifiable_id', $user->id)
                ->where('data->id', $inquiry->id)
                ->update(['read_at' => now()]);
        }

        $inquiry->load('tourPackage.destination', 'assignedTo');

        return Inertia::render('Inquiries/Show', [
            'inquiry' => $inquiry,
        ]);
    }

    /**
     * Update the status of an enquiry.
     */
    public function updateStatus(Request $request, Inquiry $inquiry)
    {
        Gate::authorize('update', $inquiry);

        $allowed = config('public_inquiry.lead_statuses', []);
        $status = $request->input('status');
        if (!in_array($status, $allowed, true)) {
            return response()->json(['message' => 'Invalid status'], 422);
        }

        $old = $inquiry->status;
        $inquiry->status = $status;
        $inquiry->save();

        ActivityLog::create([
            'log_name' => 'inquiry',
            'description' => "Inquiry {$inquiry->reference} status changed from $old to $status",
            'subject_type' => Inquiry::class,
            'subject_id' => $inquiry->id,
            'causer_type' => get_class($request->user()),
            'causer_id' => $request->user()->id,
            'properties' => [
                'old' => $old,
                'new' => $status,
            ],
        ]);

        return response()->json(['message' => 'Status updated']);
    }

    /**
     * Assign the enquiry to an employee.
     */
    public function assign(Request $request, Inquiry $inquiry)
    {
        Gate::authorize('update', $inquiry);

        $employeeId = $request->input('assigned_to');
        if ($employeeId !== null && !Employee::where('id', $employeeId)->exists()) {
            return response()->json(['message' => 'Employee not found'], 422);
        }

        $old = $inquiry->assigned_to;
        $inquiry->assigned_to = $employeeId;
        $inquiry->save();

        ActivityLog::create([
            'log_name' => 'inquiry',
            'description' => "Inquiry {$inquiry->reference} assignment changed",
            'subject_type' => Inquiry::class,
            'subject_id' => $inquiry->id,
            'causer_type' => get_class($request->user()),
            'causer_id' => $request->user()->id,
            'properties' => [
                'old' => $old,
                'new' => $employeeId,
            ],
        ]);

        return response()->json(['message' => 'Assignment updated']);
    }
}
