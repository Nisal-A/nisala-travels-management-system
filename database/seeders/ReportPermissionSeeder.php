<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Seeds permissions for all system reports and assigns them to roles.
 *
 * Permissions:
 * Financial:
 *  - reports.income-expenses
 *  - reports.cash-bank
 *  - reports.outstanding-balances
 *  - reports.tour-profitability
 *
 * Operational:
 *  - reports.booking-register
 *  - reports.upcoming-tours
 *  - reports.passenger-count
 *  - reports.document-status
 *  - reports.inquiry-followup
 *
 * Role Matrix:
 *  - Super Admin: All reports
 *  - Manager:     All reports
 *  - Finance:     Financial reports only
 *  - Staff:       Operational reports only
 *  - Customer:    No report permissions
 */
class ReportPermissionSeeder extends Seeder
{
    public const FINANCIAL_PERMISSIONS = [
        'reports.income-expenses',
        'reports.cash-bank',
        'reports.outstanding-balances',
        'reports.tour-profitability',
    ];

    public const OPERATIONAL_PERMISSIONS = [
        'reports.booking-register',
        'reports.upcoming-tours',
        'reports.passenger-count',
        'reports.document-status',
        'reports.inquiry-followup',
    ];

    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $allPermissions = array_merge(self::FINANCIAL_PERMISSIONS, self::OPERATIONAL_PERMISSIONS);

        foreach ($allPermissions as $permissionName) {
            Permission::firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'web',
            ]);
        }

        // Super Admin gets all
        $superAdmin = Role::firstOrCreate([
            'name' => UserRole::SuperAdmin->value,
            'guard_name' => 'web',
        ]);
        $superAdmin->givePermissionTo($allPermissions);

        // Manager gets all
        $manager = Role::firstOrCreate([
            'name' => UserRole::Manager->value,
            'guard_name' => 'web',
        ]);
        $manager->givePermissionTo($allPermissions);

        // Finance gets financial reports
        $finance = Role::firstOrCreate([
            'name' => UserRole::Finance->value,
            'guard_name' => 'web',
        ]);
        $finance->givePermissionTo(self::FINANCIAL_PERMISSIONS);

        // Staff gets operational reports
        $staff = Role::firstOrCreate([
            'name' => UserRole::Staff->value,
            'guard_name' => 'web',
        ]);
        $staff->givePermissionTo(self::OPERATIONAL_PERMISSIONS);
    }
}
