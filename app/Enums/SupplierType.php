<?php

namespace App\Enums;

enum SupplierType: string
{
    case Hotel = 'hotel';
    case Transport = 'transport';
    case Guide = 'guide';
    case AirTicket = 'air_ticket';
    case Food = 'food';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Hotel => 'Hotel',
            self::Transport => 'Transport',
            self::Guide => 'Guide',
            self::AirTicket => 'Air Ticket',
            self::Food => 'Food',
            self::Other => 'Other',
        };
    }
}
