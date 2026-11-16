<?php

namespace App\Services;

use RuntimeException;

/**
 * Dilempar saat penutupan sesi meja ditolak karena masih ada pesanan
 * yang belum diantar (ACT-07 di API_CONTRACT.md).
 */
class UnservedOrdersException extends RuntimeException
{
    public function __construct(public readonly int $unservedCount)
    {
        parent::__construct("Masih ada {$unservedCount} pesanan yang belum selesai dimasak atau disajikan di meja ini.");
    }
}
