<?php

namespace App\Enums;

/**
 * Defines the available status flags for a user.
 */
enum UserStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';

    /**
     * Human-readable label for display in UI.
     */
    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Inactive => 'Inactive',
        };
    }
}
