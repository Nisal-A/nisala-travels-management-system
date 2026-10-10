<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Http\Requests\Settings\UpdateGeneralRequest;
use App\Http\Requests\Settings\UpdateAppearanceRequest;
use App\Http\Requests\Settings\UpdateLocalizationRequest;
use App\Http\Requests\Settings\UpdateSecurityRequest;

class SettingsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isSuperAdmin = $user->hasRole('super_admin');

        // Fetch settings based on what the user is authorized to see
        $settings = [];
        if ($isSuperAdmin) {
            $settings = Setting::pluck('value', 'key')->toArray();
        }

        $rolesData = [];
        if ($isSuperAdmin) {
            $roles = Role::with('permissions')->get();
            $permissions = Permission::all()->groupBy(function($perm) {
                return explode('.', $perm->name)[0];
            });
            $rolesData = [
                'roles' => $roles,
                'permissions_grouped' => $permissions
            ];
        }

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
            'roles_data' => $rolesData,
            'active_sessions' => $this->getSessions($request),
        ]);
    }

    public function updateGeneral(UpdateGeneralRequest $request)
    {
        $data = $request->validated();
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            $data['logo_url'] = '/storage/' . $path;
            unset($data['logo']);
        }

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        return back()->with('success', 'General settings updated successfully.');
    }

    public function updateAppearance(UpdateAppearanceRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();
        $prefs = $user->preferences ?? [];
        $prefs['theme'] = $validated['theme'];
        $prefs['density'] = $validated['density'];
        $user->preferences = $prefs;
        $user->save();
        return back()->with('success', 'Appearance updated successfully.');
    }

    public function updateLocalization(UpdateLocalizationRequest $request)
    {
        foreach ($request->validated() as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        return back()->with('success', 'Localization settings updated successfully.');
    }

    public function updateNotifications(UpdateNotificationsRequest $request)
    {
        $user = $request->user();
        $prefs = $user->preferences ?? [];
        $prefs['notifications'] = $request->notifications;
        $user->preferences = $prefs;
        $user->save();
        return back()->with('success', 'Notification settings updated successfully.');
    }

    public function updateSecurity(UpdateSecurityRequest $request)
    {
        $user = $request->user();
        if ($request->filled('current_password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['The provided password does not match your current password.']
                ]);
            }
            $user->password = Hash::make($request->new_password);
            $user->save();
        }
        
        return back()->with('success', 'Security settings updated successfully.');
    }

    public function destroySessions(Request $request)
    {
        // This is usually handled by destroying sessions in DB or destroying the session facade.
        // Since we are using standard session storage, we might just clear DB sessions if DB driver is used.
        if (config('session.driver') === 'database') {
            \DB::table(config('session.table', 'sessions'))
                ->where('user_id', $request->user()->id)
                ->where('id', '!=', $request->session()->getId())
                ->delete();
        }
        return back()->with('success', 'Other browser sessions have been logged out.');
    }

    private function getSessions(Request $request)
    {
        if (config('session.driver') !== 'database') {
            return [];
        }
        if (!class_exists(\Jenssegers\Agent\Agent::class)) {
            return []; // Fallback if jenssegers/agent not installed
        }
        return \DB::table(config('session.table', 'sessions'))
                ->where('user_id', $request->user()->id)
                ->orderBy('last_activity', 'desc')
                ->get()
                ->map(function ($session) use ($request) {
                    $agent = $this->createAgent($session->user_agent);
                    return (object) [
                        'agent' => [
                            'is_desktop' => $agent->isDesktop(),
                            'platform' => $agent->platform(),
                            'browser' => $agent->browser(),
                        ],
                        'ip_address' => $session->ip_address,
                        'is_current_device' => $session->id === $request->session()->getId(),
                        'last_active' => \Carbon\Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                    ];
                });
    }

    private function createAgent($userAgent)
    {
        return tap(new \Jenssegers\Agent\Agent, function ($agent) use ($userAgent) {
            $agent->setUserAgent($userAgent);
        });
    }
}
