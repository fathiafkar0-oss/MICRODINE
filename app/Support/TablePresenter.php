<?php

namespace App\Support;

use App\Models\DiningTable;
use App\Models\TableSession;
use Illuminate\Support\Collection;

/**
 * Bentuk props meja untuk Cashier/Tables.jsx & Admin/Tables.jsx
 * (lihat komentar file-top masing-masing halaman untuk kontrak persisnya).
 */
class TablePresenter
{
    /**
     * @return array{id: int, number: string, seats: int, area: string, isActive: bool, qrToken: string, status: string, session: ?array<string, mixed>}
     */
    public static function toArray(DiningTable $table): array
    {
        /** @var TableSession|null $session */
        $session = $table->activeSession;

        return [
            'id' => $table->id,
            'number' => $table->number,
            'seats' => $table->capacity,
            'area' => $table->area,
            'isActive' => $table->is_active,
            'qrToken' => $table->qr_token,
            'barcode' => $table->barcode_code,
            'status' => $session !== null ? 'terisi' : 'tersedia',
            'session' => $session !== null ? self::sessionSummary($session) : null,
        ];
    }

    /**
     * Ringkasan sesi untuk kartu meja: pesanan terbaru di sesi ini sebagai
     * identitas tampilan ("A-024 · Andi · 8 mnt").
     *
     * @return array{id: int, code: ?string, customer: ?string, minutes: int, unservedCount: int}
     */
    public static function sessionSummary(TableSession $session): array
    {
        $latestOrder = $session->orders()->latest('id')->first();
        $unservedCount = $session->orders()
            ->where('payment_status', 'paid')
            ->where('kitchen_status', '!=', 'served')
            ->count();

        return [
            'id' => $session->id,
            'code' => $latestOrder?->daily_queue_number,
            'customer' => $latestOrder?->customer_name,
            'minutes' => (int) $session->opened_at->diffInMinutes(now()),
            'unservedCount' => $unservedCount,
        ];
    }

    /**
     * @param  Collection<int, DiningTable>  $tables
     * @return array<int, array<string, mixed>>
     */
    public static function collection(Collection $tables): array
    {
        return $tables->map(fn (DiningTable $table) => self::toArray($table))->values()->all();
    }
}
