<?php

namespace App\Http\Controllers;

use App\Enums\Currency;
use App\Jobs\RevalidateNextJs;
use App\Models\AppSetting;
use App\Models\ExchangeRate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class SettingsController extends Controller
{
    /**
     * Display the settings index page with all configuration sections.
     */
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->hasRole('super_admin'), 403);

        // 1. General Settings
        $general = [
            'company_name' => AppSetting::get('company_name', config('company.name', 'Nisala Travels')),
            'name' => AppSetting::get('name', config('company.name', 'Nisala Travels')),
            'company_phone' => AppSetting::get('company_phone', config('company.phone', '+94 71 995 1812')),
            'phone' => AppSetting::get('phone', config('company.phone', '+94 71 995 1812')),
            'company_whatsapp_number' => AppSetting::get('company_whatsapp_number', config('company.whatsapp_number', '+94 76 127 7010')),
            'whatsapp_number' => AppSetting::get('whatsapp_number', config('company.whatsapp_number', '+94 76 127 7010')),
            'company_support_email' => AppSetting::get('company_support_email', config('company.support_email', 'support@nisalatravels.com')),
            'support_email' => AppSetting::get('support_email', config('company.support_email', 'support@nisalatravels.com')),
            'company_address' => AppSetting::get('company_address', config('company.address', 'Air port road, Hingurakgoda.')),
            'address' => AppSetting::get('address', config('company.address', 'Air port road, Hingurakgoda.')),
            'company_office_hours' => AppSetting::get('company_office_hours', config('company.office_hours', 'Mon - Sat: 8:30 AM - 5:30 PM')),
            'office_hours' => AppSetting::get('office_hours', config('company.office_hours', 'Mon - Sat: 8:30 AM - 5:30 PM')),
        ];

        // 2. Notifications Section
        $notificationSettingsUrl = route('settings.notifications.index');

        // 3. Access and Roles: read-only table of roles with number of users in each
        $roles = Role::select('id', 'name', 'guard_name')
            ->withCount('users')
            ->orderBy('id')
            ->get();

        // 4. Public website: API key configured (yes or no only, never the key) & environment URL
        $hasApiKey = ! empty(config('services.nisala_web.key'));

        $publicSiteUrl = env('PUBLIC_SITE_URL')
            ?? env('PUBLIC_WEB_URL')
            ?? (env('NEXTJS_REVALIDATE_URL') ? preg_replace('#/api/revalidate.*$#', '', env('NEXTJS_REVALIDATE_URL')) : null)
            ?? 'http://localhost:3000';

        // 5. Exchange Rates
        $exchangeRates = [];
        $supportedCurrencies = config('currency.supported', ['LKR', 'USD', 'INR', 'THB']);
        foreach ($supportedCurrencies as $code) {
            $currencyEnum = Currency::tryFrom($code);
            if (! $currencyEnum || $code === 'LKR') {
                continue;
            }

            $latest = ExchangeRate::where('currency', $code)
                ->orderByDesc('fetched_at')
                ->first();

            $exchangeRates[] = [
                'currency' => $code,
                'label' => $currencyEnum->label(),
                'symbol' => $currencyEnum->symbol(),
                'rate_to_lkr' => $latest ? $latest->getRawOriginal('rate_to_lkr') : null,
                'fetched_at' => $latest?->fetched_at?->toIso8601String(),
                'source' => $latest?->source,
            ];
        }

        return Inertia::render('Settings/Index', [
            'general' => $general,
            'notificationSettingsUrl' => $notificationSettingsUrl,
            'roles' => $roles,
            'publicWebsite' => [
                'isApiKeyConfigured' => $hasApiKey,
                'is_configured' => $hasApiKey,
                'publicSiteUrl' => $publicSiteUrl,
                'public_site_url' => $publicSiteUrl,
            ],
            'exchangeRates' => $exchangeRates,
        ]);
    }

    /**
     * Update general settings.
     */
    public function update(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->hasRole('super_admin'), 403);

        $validated = $request->validate([
            'company_name' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255',
            'company_phone' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:50',
            'company_whatsapp_number' => 'nullable|string|max:50',
            'whatsapp_number' => 'nullable|string|max:50',
            'company_support_email' => 'nullable|email|max:255',
            'support_email' => 'nullable|email|max:255',
            'company_address' => 'nullable|string|max:500',
            'address' => 'nullable|string|max:500',
            'company_office_hours' => 'nullable|string|max:255',
            'office_hours' => 'nullable|string|max:255',
        ]);

        $fields = [
            'company_name' => $validated['company_name'] ?? $validated['name'] ?? null,
            'company_phone' => $validated['company_phone'] ?? $validated['phone'] ?? null,
            'company_whatsapp_number' => $validated['company_whatsapp_number'] ?? $validated['whatsapp_number'] ?? null,
            'company_support_email' => $validated['company_support_email'] ?? $validated['support_email'] ?? null,
            'company_address' => $validated['company_address'] ?? $validated['address'] ?? null,
            'company_office_hours' => $validated['company_office_hours'] ?? $validated['office_hours'] ?? null,
        ];

        foreach ($fields as $key => $val) {
            if ($val !== null) {
                AppSetting::set($key, $val, 'general');
            }
        }

        return back()->with('success', 'General settings saved successfully.');
    }

    /**
     * Clear the public website catalog cache.
     */
    public function clearPublicCache(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->hasRole('super_admin'), 403);

        if (Cache::supportsTags()) {
            Cache::tags(['public-catalog', 'destinations', 'tours'])->flush();
        }

        Cache::forget('public.destinations.all');
        Cache::forget('public.tours.all');

        try {
            RevalidateNextJs::dispatch(['destinations', 'tours'])->afterCommit();
        } catch (\Throwable $e) {
            // Silently handle if queue or external connection is unavailable
        }

        return back()->with('success', 'Public website cache cleared successfully.');
    }

    /**
     * Store manual exchange rates.
     */
    public function storeExchangeRates(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->hasRole('super_admin'), 403);

        $supported = config('currency.supported', ['LKR', 'USD', 'INR', 'THB']);
        $rules = [];
        foreach ($supported as $code) {
            if ($code === 'LKR') {
                continue;
            }
            $rules["rates.{$code}"] = ['nullable', 'numeric', 'min:0.000001'];
        }

        $validated = $request->validate($rules);

        $now = now();
        $rates = $validated['rates'] ?? [];

        foreach ($rates as $code => $rateValue) {
            if ($rateValue === null || $rateValue === '') {
                continue;
            }

            ExchangeRate::create([
                'currency' => $code,
                'rate_to_lkr' => $rateValue,
                'source' => 'manual',
                'fetched_at' => $now,
            ]);
        }

        return back()->with('success', 'Exchange rates updated successfully.');
    }
}
