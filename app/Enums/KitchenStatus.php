<?php

namespace App\Enums;

/**
 * Status antrean dapur (ARCHITECTURE.md Bab 4.2).
 */
enum KitchenStatus: string
{
    case Queued = 'queued';
    case Cooking = 'cooking';
    case Done = 'done';
    case Served = 'served';

    public function label(): string
    {
        return match ($this) {
            self::Queued => 'Menunggu',
            self::Cooking => 'Dimasak',
            self::Done => 'Selesai Dimasak',
            self::Served => 'Disajikan',
        };
    }

    /**
     * Urutan maju normal antrean dapur.
     */
    public function next(): ?self
    {
        return match ($this) {
            self::Queued => self::Cooking,
            self::Cooking => self::Done,
            self::Done => self::Served,
            self::Served => null,
        };
    }
}
