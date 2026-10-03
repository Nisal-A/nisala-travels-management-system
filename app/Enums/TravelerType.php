<?php

namespace App\Enums;

enum TravelerType: string
{
    case Adult = 'adult';
    case Child = 'child';
    case Infant = 'infant';

    public function label(): string
    {
        return match ($this) {
            self::Adult => 'Adult',
            self::Child => 'Child',
            self::Infant => 'Infant',
        };
    }
}
