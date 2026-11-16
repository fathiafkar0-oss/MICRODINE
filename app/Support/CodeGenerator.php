<?php

namespace App\Support;

use App\Models\DiningTable;
use App\Models\Order;
use Illuminate\Support\Str;

/**
 * Pembuat kode acak & nomor urut yang dipakai lintas modul:
 * - Token QR meja & kode barcode (Modul D).
 * - Nomor antrean harian & kode audit pesanan (Modul F/E).
 */
class CodeGenerator
{
    /**
     * Token QR kriptografis 32 karakter, unik di tabel `dining_tables.qr_token`.
     */
    public static function qrToken(): string
    {
        do {
            $token = Str::random(32);
        } while (DiningTable::query()->where('qr_token', $token)->exists());

        return $token;
    }

    /**
     * Kode barcode fisik untuk scanner kasir, format "MJ-07".
     */
    public static function barcodeCode(string $tableNumber): string
    {
        return 'MJ-'.str_pad($tableNumber, 2, '0', STR_PAD_LEFT);
    }

    /**
     * Kode audit pesanan unik, format "ORD-0148".
     */
    public static function orderCode(): string
    {
        do {
            $next = (Order::query()->max('id') ?? 0) + 1 + random_int(0, 3);
            $code = 'ORD-'.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
        } while (Order::query()->where('order_code', $code)->exists());

        return $code;
    }

    /**
     * Nomor antrean harian yang dipakai sebagai identitas publik pesanan
     * di URL (/pesanan/{code}), format "A-024". Direset setiap hari
     * (huruf "A" tetap pada MVP; bisa dirotasi ke huruf lain bila > 999).
     */
    public static function dailyQueueNumber(): string
    {
        $todayCount = Order::query()->whereDate('created_at', now()->toDateString())->count();

        return 'A-'.str_pad((string) ($todayCount + 1), 3, '0', STR_PAD_LEFT);
    }

    /**
     * Kunci idempotensi webhook Midtrans: stabil untuk kombinasi
     * order + status gateway yang sama (issue.md Bab F).
     */
    public static function midtransIdempotencyKey(string $orderCode, string $statusCode): string
    {
        return "midtrans:{$orderCode}:{$statusCode}";
    }

    /**
     * Kunci idempotensi pelunasan tunai kasir.
     */
    public static function cashIdempotencyKey(string $orderCode): string
    {
        return "cash:{$orderCode}";
    }
}
