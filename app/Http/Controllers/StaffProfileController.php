<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Jenssegers\Agent\Agent;

class StaffProfileController extends Controller
{
    /**
     * Display the staff profile edit screen.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        // Enforce staff roles only
        abort_unless(
            $user && $user->hasAnyRole(['super_admin', 'manager', 'staff', 'finance']),
            403
        );

        $employee = Employee::where('user_id', $user->id)->first();
        $roleName = $user->getRoleNames()->first() ?? 'Staff';

        $sessions = config('session.driver') === 'database'
            ? DB::table('sessions')
                ->where('user_id', $user->id)
                ->orderBy('last_activity', 'desc')
                ->get()
                ->map(function ($session) use ($request) {
                    $agent = tap(new Agent, fn ($agent) => $agent->setUserAgent($session->user_agent));

                    return (object) [
                        'id' => $session->id,
                        'ip_address' => $session->ip_address,
                        'is_current_device' => $session->id === $request->session()->getId(),
                        'agent' => [
                            'is_desktop' => $agent->isDesktop(),
                            'platform' => $agent->platform(),
                            'browser' => $agent->browser(),
                        ],
                        'last_active' => Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                    ];
                })
                ->all()
            : [];

        return Inertia::render('Profile/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $roleName,
                'phone' => $employee?->phone ?? '',
            ],
            'sessions' => $sessions,
        ]);
    }

    /**
     * Update the staff member's profile information (name and phone only).
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        abort_unless(
            $user && $user->hasAnyRole(['super_admin', 'manager', 'staff', 'finance']),
            403
        );

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        // Email cannot be changed here - update name only
        $user->update([
            'name' => $validated['name'],
        ]);

        // Persist phone in employees record
        $existingEmployeeId = DB::table('employees')->where('user_id', $user->id)->value('employee_id');
        DB::table('employees')->updateOrInsert(
            ['user_id' => $user->id],
            [
                'phone' => $validated['phone'] ?? '',
                'employee_id' => $existingEmployeeId ?? ('EMP-' . str_pad((string) $user->id, 4, '0', STR_PAD_LEFT)),
                'updated_at' => now(),
            ]
        );

        return back()->with('success', 'Profile information updated successfully.');
    }

    /**
     * Update the staff member's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $user = $request->user();

        abort_unless(
            $user && $user->hasAnyRole(['super_admin', 'manager', 'staff', 'finance']),
            403
        );

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password updated successfully.');
    }

    /**
     * Log out of other browser sessions for this user.
     */
    public function logoutOtherBrowserSessions(Request $request): RedirectResponse
    {
        $user = $request->user();

        abort_unless(
            $user && $user->hasAnyRole(['super_admin', 'manager', 'staff', 'finance']),
            403
        );

        if (config('session.driver') === 'database') {
            DB::table('sessions')
                ->where('user_id', $user->id)
                ->where('id', '!=', $request->session()->getId())
                ->delete();
        }

        return back()->with('success', 'Signed out of other browser sessions.');
    }
}
