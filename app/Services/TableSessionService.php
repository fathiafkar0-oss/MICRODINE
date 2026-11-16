<?php

namespace App\Services;

use App\Enums\TableSessionStatus;
use App\Events\TableSessionUpdatedEvent;
use App\Models\DiningTable;
use App\Models\TableSession;
use Illuminate\Support\Facades\DB;

/**
 * Modul D — Meja & Sesi.
 *
 * Satu meja fisik hanya boleh punya SATU sesi `active` pada satu waktu
 * (AGENTS.md invarian #4, dijamin juga oleh partial unique index di database).
 * Setiap mutasi di sini dibungkus `lockForUpdate()` agar dua pemindaian QR
 * yang terjadi bersamaan tidak membuat dua sesi aktif sekaligus.
 */
class TableSessionService
{
    /**
     * Cari meja aktif berdasarkan nomor (dua digit, mis. "07").
     */
    public function findTableByNumber(string $number): ?DiningTable
    {
        return DiningTable::query()
            ->where('number', str_pad($number, 2, '0', STR_PAD_LEFT))
            ->where('is_active', true)
            ->first();
    }

    /**
     * Buka sesi baru di meja ini, atau bergabung ke sesi `active` yang sudah
     * ada (pelanggan lain memindai meja yang sama). Dibungkus transaksi +
     * row lock supaya tidak terjadi dua sesi aktif untuk meja yang sama.
     *
     * @return array{session: TableSession, joined: bool}
     */
    public function openOrJoin(DiningTable $table): array
    {
        return DB::transaction(function () use ($table) {
            /** @var DiningTable $locked */
            $locked = DiningTable::query()->where('id', $table->id)->lockForUpdate()->firstOrFail();

            $active = TableSession::query()
                ->where('dining_table_id', $locked->id)
                ->where('status', TableSessionStatus::Active->value)
                ->lockForUpdate()
                ->first();

            if ($active !== null) {
                return ['session' => $active, 'joined' => true];
            }

            // Partial unique index di database adalah garis pertahanan terakhir;
            // lockForUpdate() di atas mencegah dua request bersamaan sampai ke titik ini.
            $session = TableSession::query()->create([
                'dining_table_id' => $locked->id,
                'status' => TableSessionStatus::Active->value,
                'opened_at' => now(),
            ]);

            return ['session' => $session, 'joined' => false];
        });
    }

    /**
     * Tutup sesi meja. Ditolak jika masih ada pesanan yang belum `served`
     * (kecuali `force`), sesuai ARCHITECTURE.md Bab 4.3.
     *
     * @throws RuntimeException jika ada pesanan belum selesai dan tidak dipaksa.
     */
    public function close(TableSession $session, bool $force = false, ?int $closedBy = null): TableSession
    {
        return DB::transaction(function () use ($session, $force, $closedBy) {
            /** @var TableSession $locked */
            $locked = TableSession::query()->where('id', $session->id)->lockForUpdate()->firstOrFail();

            $unservedCount = $locked->orders()
                ->where('payment_status', 'paid')
                ->where('kitchen_status', '!=', 'served')
                ->count();

            if ($unservedCount > 0 && ! $force) {
                throw new UnservedOrdersException($unservedCount);
            }

            $locked->update([
                'status' => TableSessionStatus::Closed->value,
                'closed_at' => now(),
                'closed_by' => $closedBy,
            ]);

            TableSessionUpdatedEvent::dispatch($locked->refresh());

            return $locked;
        });
    }
}
