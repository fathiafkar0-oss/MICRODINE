<?php

namespace App\Enums;

/**
 * Status pembayaran pesanan (ARCHITECTURE.md Bab 4.1).
 */
enum PaymentStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Failed = 'failed';
    case Cancelled = 'cancelled';
    case Expired = 'expired';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Menunggu Bayar',
            self::Paid => 'Lunas',
            self::Failed => 'Gagal',
            self::Cancelled => 'Dibatalkan',
            self::Expired => 'Kedaluwarsa',
        };
    }

    /**
     * Hanya status ini yang boleh dihitung sebagai omzet/laba.
     */
    public function isPaid(): bool
    {
        return $this === self::Paid;
    }

    /**
     * Status ini sudah final; tidak boleh berubah lagi tanpa prosedur khusus.
     */
    public function isFinal(): bool
    {
        return in_array($this, [self::Paid, self::Failed, self::Cancelled, self::Expired], true);
    }
}
