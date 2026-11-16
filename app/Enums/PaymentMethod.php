<?php

namespace App\Enums;

/**
 * Metode pembayaran (nama nilai mengikuti kolom database).
 */
enum PaymentMethod: string
{
    case Cash = 'cash';
    case Qris = 'qris';

    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Tunai',
            self::Qris => 'QRIS',
        };
    }

    /**
     * Nilai yang dipakai frontend (resources/js/Utils/status.js).
     */
    public function frontendValue(): string
    {
        return match ($this) {
            self::Cash => 'tunai',
            self::Qris => 'qris',
        };
    }
}
