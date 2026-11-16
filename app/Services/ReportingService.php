<?php

namespace App\Services;

use App\Enums\PaymentMethod;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\SalesTarget;
use App\Support\MenuPresenter;
use Illuminate\Support\Carbon;

/**
 * Modul J — Agregasi Laba-Rugi.
 *
 * AGENTS.md invarian #3: omzet & laba HANYA dihitung dari transaksi
 * `payment_status = 'paid'`, SEBELUM pajak, dan selalu memakai
 * `unit_price_snapshot` / `unit_hpp_snapshot` (bukan harga menu terkini).
 *
 * Catatan keterbatasan skema (tidak boleh didesain ulang, lihat issue.md):
 * tabel 11-skema final TIDAK memiliki pelacakan interaksi menu
 * (`views` / "dilihat", `addedToCart` / "masuk keranjang"). Kedua angka ini
 * dikembalikan sebagai 0 pada `menuAnalytics()` — nilai `sold`/`revenue`/
 * `profit` tetap akurat karena dihitung dari `order_items` sungguhan.
 */
class ReportingService
{
    /**
     * Ringkasan untuk `Admin/Dashboard` (props `dashboard`).
     *
     * @return array{today: array<string, mixed>, payment: array{qris: int, tunai: int}, trend: array<int, array<string, mixed>>, topMenus: array<int, array<string, mixed>>}
     */
    public function dashboardSummary(?Carbon $date = null): array
    {
        $date ??= now();

        $today = $this->daySummary($date);
        $yesterday = $this->daySummary($date->copy()->subDay());

        $trend = [];
        for ($i = 13; $i >= 0; $i--) {
            $day = $date->copy()->subDays($i);
            $summary = $i === 0 ? $today : $this->daySummary($day);
            $trend[] = [
                'label' => $day->format('j'),
                'omzet' => $summary['omzet'],
                'laba' => $summary['omzet'] - $summary['hpp'],
            ];
        }

        $paymentRows = Order::query()
            ->paid()
            ->whereDate('created_at', $date->toDateString())
            ->selectRaw('payment_method, SUM(subtotal) as total')
            ->groupBy('payment_method')
            ->pluck('total', 'payment_method');

        $omzetGrowth = $yesterday['omzet'] > 0
            ? ($today['omzet'] - $yesterday['omzet']) / $yesterday['omzet']
            : 0.0;

        return [
            'today' => [
                'omzet' => $today['omzet'],
                'hpp' => $today['hpp'],
                'transactions' => $today['transactions'],
                'omzetGrowth' => round($omzetGrowth, 4),
                'transactionGrowth' => $today['transactions'] - $yesterday['transactions'],
            ],
            'payment' => [
                'qris' => (int) ($paymentRows[PaymentMethod::Qris->value] ?? 0),
                'tunai' => (int) ($paymentRows[PaymentMethod::Cash->value] ?? 0),
            ],
            'trend' => $trend,
            'topMenus' => $this->topMenus($date, $date, 4),
        ];
    }

    /**
     * Omzet/HPP/jumlah transaksi lunas pada satu hari (sebelum pajak).
     *
     * @return array{omzet: int, hpp: int, transactions: int}
     */
    private function daySummary(Carbon $date): array
    {
        $row = Order::query()
            ->paid()
            ->whereDate('created_at', $date->toDateString())
            ->selectRaw('COALESCE(SUM(subtotal), 0) as omzet, COUNT(*) as transactions')
            ->first();

        $hpp = (int) OrderItem::query()
            ->whereHas('order', fn ($q) => $q->paid()->whereDate('created_at', $date->toDateString()))
            ->sum('subtotal_hpp');

        return [
            'omzet' => (int) ($row->omzet ?? 0),
            'hpp' => $hpp,
            'transactions' => (int) ($row->transactions ?? 0),
        ];
    }

    /**
     * Menu terlaris dalam rentang tanggal (inklusif), hanya pesanan lunas.
     *
     * @return array<int, array{menuId: string, sold: int, profit: int}>
     */
    private function topMenus(Carbon $from, Carbon $to, int $limit): array
    {
        $rows = OrderItem::query()
            ->whereHas('order', fn ($q) => $q->paid()->whereBetween('created_at', [
                $from->copy()->startOfDay(), $to->copy()->endOfDay(),
            ]))
            ->whereNotNull('menu_item_id')
            ->selectRaw('menu_item_id, SUM(qty) as sold, SUM(subtotal_price - subtotal_hpp) as profit')
            ->groupBy('menu_item_id')
            ->orderByDesc('sold')
            ->limit($limit)
            ->get();

        return $rows->map(fn ($row) => [
            'menuId' => MenuPresenter::displayId((int) $row->menu_item_id),
            'sold' => (int) $row->sold,
            'profit' => (int) $row->profit,
        ])->all();
    }

    /**
     * Statistik per menu untuk `Admin/MenuAnalytics` (props `analytics`),
     * untuk ketiga periode sekaligus: `hari-ini`, `7-hari`, `30-hari`.
     *
     * @return array<string, array<int, array<string, mixed>>>
     */
    public function menuAnalytics(?Carbon $date = null): array
    {
        $date ??= now();

        return [
            'hari-ini' => $this->menuStatsFor($date->copy()->startOfDay(), $date->copy()->endOfDay()),
            '7-hari' => $this->menuStatsFor($date->copy()->subDays(6)->startOfDay(), $date->copy()->endOfDay()),
            '30-hari' => $this->menuStatsFor($date->copy()->subDays(29)->startOfDay(), $date->copy()->endOfDay()),
        ];
    }

    /**
     * @return array<int, array{menuId: string, sold: int, revenue: int, profit: int, views: int, addedToCart: int}>
     */
    private function menuStatsFor(Carbon $from, Carbon $to): array
    {
        $rows = OrderItem::query()
            ->whereHas('order', fn ($q) => $q->paid()->whereBetween('created_at', [$from, $to]))
            ->whereNotNull('menu_item_id')
            ->selectRaw('menu_item_id, SUM(qty) as sold, SUM(subtotal_price) as revenue, SUM(subtotal_price - subtotal_hpp) as profit')
            ->groupBy('menu_item_id')
            ->get()
            ->keyBy('menu_item_id');

        // Setiap menu (termasuk yang terjual 0 kali) tetap tampil, konsisten
        // dengan Data/mock/menuAnalytics.js yang mencantumkan seluruh menu.
        return MenuItem::withTrashed()->get()->map(function (MenuItem $menu) use ($rows) {
            $row = $rows->get($menu->id);

            return [
                'menuId' => MenuPresenter::displayId($menu->id),
                'sold' => (int) ($row->sold ?? 0),
                'revenue' => (int) ($row->revenue ?? 0),
                'profit' => (int) ($row->profit ?? 0),
                // Skema 11-tabel final tidak punya tabel pelacakan interaksi
                // (lihat docblock kelas ini) — dikembalikan 0, bukan diisi acak.
                'views' => 0,
                'addedToCart' => 0,
            ];
        })->values()->all();
    }

    /**
     * Target penjualan bulanan untuk `Admin/Targets` (props `salesTarget`).
     * `weeks` SELALU berisi tepat 4 entri (minggu 1–3 = 7 hari, minggu 4 =
     * sisa bulan) karena `Utils/salesTarget.js::analyseTarget()` di frontend
     * mengasumsikan pola potongan ini secara tetap.
     *
     * @return array{month: string, monthlyTarget: int, daysInMonth: int, dailyTarget: int, daily: array<int, int>, weeks: array<int, array{label: string, range: string, target: int}>}
     */
    public function salesTarget(?string $monthYear = null): array
    {
        $monthStart = $monthYear !== null ? Carbon::createFromFormat('Y-m', $monthYear)->startOfMonth() : now()->startOfMonth();
        $monthYear = $monthStart->format('Y-m');
        $daysInMonth = $monthStart->daysInMonth;

        $target = SalesTarget::query()->where('month_year', $monthYear)->first();
        $monthlyTarget = $target?->target_amount ?? 0;

        $weekLengths = [7, 7, 7, $daysInMonth - 21];
        $weeklyTargets = $target?->weekly_targets;
        if (! is_array($weeklyTargets) || count($weeklyTargets) !== 4) {
            // Belum ada target tersimpan untuk bulan ini: bagi proporsional
            // terhadap panjang hari per minggu (lihat TargetFormModal.jsx —
            // admin hanya mengatur target bulanan, mingguan dihitung otomatis).
            $weeklyTargets = array_map(fn ($length) => (int) round($monthlyTarget * $length / max($daysInMonth, 1)), $weekLengths);
        }

        $isCurrentMonth = $monthStart->isSameMonth(now());
        $daysElapsed = $isCurrentMonth ? now()->day : $daysInMonth;

        $daily = [];
        for ($day = 1; $day <= $daysElapsed; $day++) {
            $daily[] = $this->daySummary($monthStart->copy()->setDay($day))['omzet'];
        }

        $weeks = [];
        $cursor = 1;
        foreach ($weekLengths as $index => $length) {
            $start = $cursor;
            $end = min($cursor + $length - 1, $daysInMonth);
            $weeks[] = [
                'label' => 'Minggu '.($index + 1),
                'range' => "{$start}–{$end} ".$monthStart->translatedFormat('M'),
                'target' => $weeklyTargets[$index] ?? 0,
            ];
            $cursor += $length;
        }

        return [
            'month' => $monthStart->translatedFormat('F Y'),
            // Format mentah 'YYYY-MM' untuk dikirim balik ke `PUT /admin/target`
            // (Admin/Targets.jsx — lihat TargetsController::update).
            'monthYear' => $monthYear,
            'monthlyTarget' => $monthlyTarget,
            'daysInMonth' => $daysInMonth,
            'dailyTarget' => $daysInMonth > 0 ? (int) round($monthlyTarget / $daysInMonth / 1000) * 1000 : 0,
            'daily' => $daily,
            'weeks' => $weeks,
        ];
    }

    /**
     * Simpan/perbarui target omzet bulanan (dipanggil dari `AdminTargetsController::update`).
     */
    public function setMonthlyTarget(string $monthYear, int $monthlyTarget, int $createdBy): SalesTarget
    {
        $daysInMonth = Carbon::createFromFormat('Y-m', $monthYear)->daysInMonth;
        $weekLengths = [7, 7, 7, $daysInMonth - 21];
        $weeklyTargets = array_map(fn ($length) => (int) round($monthlyTarget * $length / max($daysInMonth, 1)), $weekLengths);

        return SalesTarget::query()->updateOrCreate(
            ['month_year' => $monthYear],
            ['target_amount' => $monthlyTarget, 'weekly_targets' => $weeklyTargets, 'created_by' => $createdBy],
        );
    }
}
