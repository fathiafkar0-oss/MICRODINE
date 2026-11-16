<?php

namespace App\Enums;

/**
 * Asal pesanan.
 */
enum OrderSource: string
{
    case Qr = 'qr';
    case Manual = 'manual';

    public function label(): string
    {
        return match ($this) {
            self::Qr => 'Pindai QR Meja',
            self::Manual => 'Input Kasir',
        };
    }

    /**
     * Nilai yang dipakai frontend (resources/js/Data/mock/orders.js).
     */
    public function frontendValue(): string
    {
        return match ($this) {
            self::Qr => 'qr',
            self::Manual => 'kasir',
        };
    }
}
