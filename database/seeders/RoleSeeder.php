<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

/**
 * Seeds the initial system roles defined in the UserRole enum.
 *
 * This seeder is idempotent — it uses firstOrCreate so it can be run
 * multiple times without creating duplicate records.
 *
 * Roles seeded:
 *  - super_admin  (Super Administrator — full system access)
 *  - manager      (Manager — operational management access)
 *  - staff        (Travel Staff — customer/booking/tour operations)
 *  - finance      (Finance Staff — payment and financial access)
 *  - customer     (Customer — own portal access only)
 */
class RoleSeeder extends Seeder
{
    public function run(): void
    {
        foreach (UserRole::cases() as $role) {
            Role::firstOrCreate([
                'name' => $role->value,
                'guard_name' => 'web',
            ]);
        }

        $this->call(ReportPermissionSeeder::class);
    }
}
