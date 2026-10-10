<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationSettingsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isCustomer = $user->hasRole('customer');
        $audienceType = $isCustomer ? 'customer' : 'staff';

        // Filter config by audience
        $configCategories = config('notification_types.categories', []);
        $filteredCategories = [];

        foreach ($configCategories as $catKey => $category) {
            $filteredTypes = [];
            foreach ($category['types'] as $typeKey => $typeInfo) {
                if (in_array($audienceType, $typeInfo['audience'])) {
                    $filteredTypes[$typeKey] = $typeInfo;
                }
            }
            if (!empty($filteredTypes)) {
                $filteredCategory = $category;
                $filteredCategory['types'] = $filteredTypes;
                $filteredCategories[$catKey] = $filteredCategory;
            }
        }

        $preferences = \App\Models\NotificationPreference::where('user_id', $user->id)
            ->get()
            ->keyBy(function ($item) {
                return $item->type . '_' . $item->channel;
            })
            ->map(function ($item) {
                return $item->enabled;
            });
            
        // Setup initial default preferences if they don't exist in DB
        $computedPreferences = [];
        foreach ($filteredCategories as $catKey => $category) {
            foreach ($category['types'] as $typeKey => $typeInfo) {
                foreach ($typeInfo['channels'] as $channel) {
                    $key = $typeKey . '_' . $channel;
                    if ($preferences->has($key)) {
                        $computedPreferences[$typeKey][$channel] = $preferences->get($key);
                    } else {
                        $computedPreferences[$typeKey][$channel] = in_array($channel, $typeInfo['default_enabled'] ?? []);
                    }
                }
            }
        }

        return \Inertia\Inertia::render($isCustomer ? 'Portal/Settings/Notifications' : 'Settings/Notifications', [
            'categories' => $filteredCategories,
            'preferences' => $computedPreferences,
            'smsEnabled' => config('messaging.sms_enabled', false),
            'hasPhone' => !empty($user->phone),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'channel' => 'required|string',
            'enabled' => 'required|boolean',
        ]);

        $user = $request->user();
        
        // Validate type and channel against config
        $config = \App\Services\NotificationGate::getNotificationConfig($validated['type']);
        if (!$config) {
            abort(422, 'Invalid notification type.');
        }

        if (!in_array($validated['channel'], $config['channels'])) {
            abort(422, 'Invalid channel for this notification type.');
        }

        // Prevent disabling mandatory channels fully (can't disable database for mandatory)
        if ($config['mandatory'] && !$validated['enabled'] && $validated['channel'] === 'database') {
            abort(422, 'Cannot disable mandatory notifications.');
        }

        \App\Models\NotificationPreference::updateOrCreate(
            [
                'user_id' => $user->id,
                'type' => $validated['type'],
                'channel' => $validated['channel'],
            ],
            [
                'enabled' => $validated['enabled'],
            ]
        );

        \Illuminate\Support\Facades\Cache::forget("user_{$user->id}_notification_prefs");

        return back()->with('success', 'Preferences saved.');
    }
}
