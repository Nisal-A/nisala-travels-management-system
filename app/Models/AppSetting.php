<?php

namespace App\Models {

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Support\Facades\Schema;

    class AppSetting extends Model
    {
        /**
         * The table associated with the model.
         *
         * @var string
         */
        protected $table = 'app_settings';

        /**
         * The attributes that are mass assignable.
         *
         * @var list<string>
         */
        protected $fillable = [
            'key',
            'value',
            'group',
        ];

        /**
         * Retrieve a setting by key, falling back to config/company.php or a default value.
         */
        public static function get(string $key, mixed $default = null): mixed
        {
            // Key normalization for company settings
            $clean = $key;
            if (str_starts_with($clean, 'company.')) {
                $clean = substr($clean, 8);
            }

            $noPrefix = str_starts_with($clean, 'company_') ? substr($clean, 8) : $clean;
            $withPrefix = 'company_' . $noPrefix;
            $withDot = 'company.' . $noPrefix;

            $candidateDbKeys = array_unique([
                $key,
                $clean,
                $noPrefix,
                $withPrefix,
                $withDot,
            ]);

            try {
                if (Schema::hasTable('app_settings')) {
                    $setting = static::whereIn('key', $candidateDbKeys)
                        ->whereNotNull('value')
                        ->first();

                    if ($setting !== null && $setting->value !== '') {
                        return $setting->value;
                    }
                }
            } catch (\Throwable $e) {
                // In case of database connection issue or migration phase, proceed to fallback
            }

            // Fallback to config('company.*') or config($key)
            $configCandidates = array_unique([
                'company.' . $noPrefix,
                'company.' . $clean,
                $key,
            ]);

            foreach ($configCandidates as $cfgKey) {
                $cfgValue = config($cfgKey);
                if ($cfgValue !== null) {
                    return $cfgValue;
                }
            }

            // Special fallback for office_hours if not explicitly configured in company.php
            if ($noPrefix === 'office_hours') {
                return $default ?? 'Mon - Sat: 8:30 AM - 5:30 PM';
            }

            return $default;
        }

        /**
         * Save or update a setting.
         */
        public static function set(string $key, mixed $value, string $group = 'general'): self
        {
            $record = static::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'group' => $group]
            );

            // Also synchronize alternative key naming for company settings
            $clean = $key;
            if (str_starts_with($clean, 'company.')) {
                $clean = substr($clean, 8);
            }

            $noPrefix = str_starts_with($clean, 'company_') ? substr($clean, 8) : $clean;
            $withPrefix = 'company_' . $noPrefix;

            if ($key === $withPrefix && $withPrefix !== $noPrefix) {
                static::updateOrCreate(
                    ['key' => $noPrefix],
                    ['value' => $value, 'group' => $group]
                );
            } elseif ($key === $noPrefix && $withPrefix !== $noPrefix) {
                static::updateOrCreate(
                    ['key' => $withPrefix],
                    ['value' => $value, 'group' => $group]
                );
            }

            return $record;
        }

        /**
         * Determine if a setting exists in the database.
         */
        public static function has(string $key): bool
        {
            try {
                if (! Schema::hasTable('app_settings')) {
                    return false;
                }

                return static::where('key', $key)->whereNotNull('value')->exists();
            } catch (\Throwable $e) {
                return false;
            }
        }

        /**
         * Return all company settings merged with config.
         *
         * @return array<string, mixed>
         */
        public static function getCompanySettings(): array
        {
            return [
                'name' => static::get('name', config('company.name')),
                'company_name' => static::get('company_name', config('company.name')),
                'phone' => static::get('phone', config('company.phone')),
                'company_phone' => static::get('company_phone', config('company.phone')),
                'whatsapp_number' => static::get('whatsapp_number', config('company.whatsapp_number')),
                'company_whatsapp_number' => static::get('company_whatsapp_number', config('company.whatsapp_number')),
                'whatsapp_url' => static::get('whatsapp_url', config('company.whatsapp_url')),
                'support_email' => static::get('support_email', config('company.support_email')),
                'company_support_email' => static::get('company_support_email', config('company.support_email')),
                'address' => static::get('address', config('company.address')),
                'company_address' => static::get('company_address', config('company.address')),
                'office_hours' => static::get('office_hours', config('company.office_hours', 'Mon - Sat: 8:30 AM - 5:30 PM')),
                'company_office_hours' => static::get('company_office_hours', config('company.office_hours', 'Mon - Sat: 8:30 AM - 5:30 PM')),
                'brand_color' => static::get('brand_color', config('company.brand_color')),
                'logo_url' => static::get('logo_url', config('company.logo_url')),
                'facebook' => static::get('facebook', config('company.facebook')),
                'youtube' => static::get('youtube', config('company.youtube')),
            ];
        }
    }
}

namespace {
    // Global helper functions
    if (! function_exists('company_setting')) {
        /**
         * Get a company setting from app_settings or fallback to config/company.php.
         */
        function company_setting(?string $key = null, mixed $default = null): mixed
        {
            if ($key === null) {
                return \App\Models\AppSetting::getCompanySettings();
            }

            return \App\Models\AppSetting::get($key, $default);
        }
    }

    if (! function_exists('app_setting')) {
        /**
         * Get an app setting from app_settings or fallback to config.
         */
        function app_setting(string $key, mixed $default = null): mixed
        {
            return \App\Models\AppSetting::get($key, $default);
        }
    }
}
