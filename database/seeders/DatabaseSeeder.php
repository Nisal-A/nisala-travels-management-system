<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Seeder execution order matters — respect foreign key dependencies:
     *  1. RoleSeeder        — must run first (roles/permissions have no FK deps)
     *  2. AdminUserSeeder   — depends on roles existing
     *  3. CustomerSeeder    — depends on users (created_by FK)
     *  4. (future seeders added here in dependency order)
     */
    public function run(): void
    {
        // Phase 2 — NT-005.1 Role & Permission Foundation
        $this->call(RoleSeeder::class);
        $this->call(AdminUserSeeder::class);
        $this->call(TestUserSeeder::class);

        if (app()->environment('local')) {
            $this->call(PublicContentSeeder::class);
        }

        // Phase 4 — NT-006
        // $this->call(CustomerSeeder::class);

        // Phase 6 — NT-009
        // $this->call(DestinationSeeder::class);
        // $this->call(PackageSeeder::class);
    }
}
