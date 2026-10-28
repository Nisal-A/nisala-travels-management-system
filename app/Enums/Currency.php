<?php

namespace App\Enums;

/**
 * Supported currencies in the Nisala Travels system.
 *
 * The base currency is LKR (Sri Lankan Rupee). All other currencies
 * are converted to LKR for unified reporting and accounting.
 */
enum Currency: string
{
    case LKR = 'LKR';
    case USD = 'USD';
    case INR = 'INR';
    case THB = 'THB';

    /**
     * Human-readable label for display in UI.
     */
    public function label(): string
    {
        return match ($this) {
            self::LKR => 'Sri Lankan Rupee',
            self::USD => 'US Dollar',
            self::INR => 'Indian Rupee',
            self::THB => 'Thai Baht',
        };
    }

    /**
     * Currency symbol for display.
     */
    public function symbol(): string
    {
        return match ($this) {
            self::LKR => 'Rs',
            self::USD => '$',
            self::INR => '₹',
            self::THB => '฿',
        };
    }
}
