<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds the default super administrator account for initial system access.
 *
 * This seeder is idempotent — it uses firstOrCreate so it can be run
 * multiple times without creating duplicate records. The role assignment
 * is also idempotent (Spatie ignores duplicate assignments).
 *
 * NOTE: The default password 'password' is intended for local development
 * only. It MUST be changed before deploying to any non-local environment.
 *
 * DEPENDS ON: RoleSeeder (must run first so the super_admin role exists).
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@nisalatravels.lk'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('password'),
                'status' => UserStatus::Active,
                'email_verified_at' => now(),
            ]
        );

        if (! $admin->hasRole(UserRole::SuperAdmin->value)) {
            $admin->assignRole(UserRole::SuperAdmin->value);
        }
    }
}
