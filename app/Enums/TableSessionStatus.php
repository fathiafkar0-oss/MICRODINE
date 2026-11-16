<?php

namespace App\Enums;

/**
 * Status sesi meja (ARCHITECTURE.md Bab 4.3).
 */
enum TableSessionStatus: string
{
    case Active = 'active';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Aktif',
            self::Closed => 'Ditutup',
        };
    }
}
