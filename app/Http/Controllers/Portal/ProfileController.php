<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        $user = $request->user();
        $customer = $user->customer;
        
        $sessions = config('session.driver') === 'database' 
            ? DB::table('sessions')
                ->where('user_id', $user->id)
                ->orderBy('last_activity', 'desc')
                ->get()
                ->map(function ($session) use ($request) {
                    $agent = tap(new \Jenssegers\Agent\Agent, fn ($agent) => $agent->setUserAgent($session->user_agent));
                    return (object) [
                        'id' => $session->id,
                        'ip_address' => $session->ip_address,
                        'is_current_device' => $session->id === $request->session()->getId(),
                        'agent' => [
                            'is_desktop' => $agent->isDesktop(),
                            'platform' => $agent->platform(),
                            'browser' => $agent->browser(),
                        ],
                        'last_active' => \Carbon\Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                    ];
                })
            : [];

        return Inertia::render('Portal/Profile/Edit', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'full_name' => $customer->full_name,
                'phone' => $customer->phone,
                'whatsapp' => $customer->whatsapp,
                'address' => $customer->address,
                'emergency_contact_name' => $customer->emergency_contact_name,
                'emergency_contact_phone' => $customer->emergency_contact_phone,
            ],
            'sessions' => $sessions,
        ]);
    }
    
    public function update(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $request->user()->id,
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:1000',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
        ]);

        $user = $request->user();
        
        $user->update([
            'name' => $validated['full_name'],
            'email' => $validated['email'],
        ]);

        if ($user->customer) {
            $user->customer->update([
                'full_name' => $validated['full_name'],
                'phone' => $validated['phone'],
                'whatsapp' => $validated['whatsapp'],
                'address' => $validated['address'],
                'emergency_contact_name' => $validated['emergency_contact_name'],
                'emergency_contact_phone' => $validated['emergency_contact_phone'],
            ]);
        }

        return back()->with('success', 'Profile information updated successfully.');
    }
    
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password updated successfully.');
    }

    public function logoutOtherBrowserSessions(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        if (config('session.driver') !== 'database') {
            return back()->with('error', 'This feature is only available when using the database session driver.');
        }

        DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->where('id', '!=', $request->session()->getId())
            ->delete();

        return back()->with('success', 'Other browser sessions have been logged out.');
    }
}
