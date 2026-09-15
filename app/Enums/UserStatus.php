<?php

namespace App\Enums;

/**
 * Defines the possible account statuses for users within the system.
 */
enum UserStatus: string
{
    case Active    = 'active';
    case Inactive  = 'inactive';
    case Suspended = 'suspended';

    /**
     * Human-readable label for display in UI.
     */
    public function label(): string
    {
        return match ($this) {
            self::Active    => 'Active',
            self::Inactive  => 'Inactive',
            self::Suspended => 'Suspended',
        };
    }
}
