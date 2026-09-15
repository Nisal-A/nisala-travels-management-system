<?php

namespace App\Enums;

/**
 * Defines the available user roles within the Nisala Travels system.
 *
 * Used for simple RBAC without external packages. Each role maps to a
 * specific permission scope that will be enforced by middleware/gates
 * in Phase 2 (Authentication & Authorization).
 */
enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case Manager    = 'manager';
    case Staff      = 'staff';
    case Finance    = 'finance';
    case Customer   = 'customer';

    /**
     * Human-readable label for display in UI.
     */
    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::Manager    => 'Manager',
            self::Staff      => 'Staff',
            self::Finance    => 'Finance',
            self::Customer   => 'Customer',
        };
    }

    /**
     * Returns all roles that have access to the office/admin panel.
     *
     * @return list<self>
     */
    public static function officeRoles(): array
    {
        return [
            self::SuperAdmin,
            self::Manager,
            self::Staff,
            self::Finance,
        ];
    }
}
