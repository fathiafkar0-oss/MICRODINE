<?php

namespace Tests\Feature\Admin;

use App\Actions\CancelOrderAction;
use App\Actions\CashPaymentAction;
use App\Actions\CreateOrderAction;
use App\Enums\OrderSource;
use App\Enums\PaymentMethod;
use App\Enums\UserRole;
use App\Models\DiningTable;
use App\Models\MenuItem;
use App\Models\User;
use App\Services\ReportingService;
use App\Support\MenuPresenter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * AGENTS.md invarian #3 — Omzet & laba HANYA dari transaksi `payment_status
 * = 'paid'`, SEBELUM pajak. Modul J (ReportingService) adalah satu-satunya
 * tempat agregasi laporan keuangan dibuat.
 */
class ReportingServiceTest extends TestCase
{
    use RefreshDatabase;

    private function kasir(): User
    {
        return User::create([
            'name' => 'Kasir', 'username' => 'kasir', 'password' => 'secret',
            'role' => UserRole::Kasir, 'is_active' => true,
        ]);
    }

    public function test_dashboard_summary_excludes_unpaid_orders_and_uses_pre_tax_amounts(): void
    {
        $table = DiningTable::factory()->create();
        $menu = MenuItem::factory()->create(['price' => 20000, 'hpp' => 8000]);
        $kasir = $this->kasir();

        // Pesanan lunas (tunai): harus terhitung, memakai subtotal (sebelum pajak).
        $paidOrder = app(CreateOrderAction::class)->execute($table, 'Andi', PaymentMethod::Cash->value, [
            ['menu_id' => $menu->id, 'quantity' => 2, 'notes' => null],
        ]);
        app(CashPaymentAction::class)->execute($paidOrder, $paidOrder->total, $kasir->id);

        // Pesanan belum bayar: TIDAK boleh ikut masuk omzet/HPP.
        $table2 = DiningTable::factory()->create();
        app(CreateOrderAction::class)->execute($table2, 'Budi', 'qris', [
            ['menu_id' => $menu->id, 'quantity' => 5, 'notes' => null],
        ]);

        $summary = app(ReportingService::class)->dashboardSummary(now());

        // Subtotal pesanan lunas = 2 × 20000 = 40000 (bukan 7×20000 bila pesanan belum bayar ikut terhitung).
        $this->assertSame(40000, $summary['today']['omzet']);
        $this->assertSame(2 * 8000, $summary['today']['hpp']);
        $this->assertSame(1, $summary['today']['transactions']);
        $this->assertSame(40000, $summary['payment']['tunai']);
        $this->assertSame(0, $summary['payment']['qris']);
    }

    public function test_menu_analytics_only_counts_paid_order_items_and_fills_unsold_menus_with_zero(): void
    {
        $table = DiningTable::factory()->create();
        $sold = MenuItem::factory()->create(['price' => 15000, 'hpp' => 6000]);
        $neverSold = MenuItem::factory()->create(['price' => 10000, 'hpp' => 4000]);
        $kasir = $this->kasir();

        $order = app(CreateOrderAction::class)->execute($table, 'Citra', PaymentMethod::Cash->value, [
            ['menu_id' => $sold->id, 'quantity' => 3, 'notes' => null],
        ]);
        app(CashPaymentAction::class)->execute($order, $order->total, $kasir->id);

        $analytics = app(ReportingService::class)->menuAnalytics(now());

        $soldRow = collect($analytics['hari-ini'])->firstWhere('menuId', MenuPresenter::displayId($sold->id));
        $unsoldRow = collect($analytics['hari-ini'])->firstWhere('menuId', MenuPresenter::displayId($neverSold->id));

        $this->assertSame(3, $soldRow['sold']);
        $this->assertSame(45000, $soldRow['revenue']);
        $this->assertSame(3 * (15000 - 6000), $soldRow['profit']);
        // Tidak ada tabel pelacakan interaksi pada skema final: selalu 0.
        $this->assertSame(0, $soldRow['views']);
        $this->assertSame(0, $soldRow['addedToCart']);

        $this->assertNotNull($unsoldRow, 'Menu yang belum pernah terjual tetap harus tampil di analitik.');
        $this->assertSame(0, $unsoldRow['sold']);
    }

    public function test_sales_target_always_returns_exactly_four_weeks_and_splits_proportionally(): void
    {
        $monthYear = now()->format('Y-m');
        $kasir = $this->kasir();

        app(ReportingService::class)->setMonthlyTarget($monthYear, 30000000, $kasir->id);

        $target = app(ReportingService::class)->salesTarget($monthYear);

        $this->assertCount(4, $target['weeks']);
        $this->assertSame(30000000, $target['monthlyTarget']);
        $sumOfWeeks = array_sum(array_column($target['weeks'], 'target'));
        // Boleh selisih kecil karena pembulatan per minggu.
        $this->assertEqualsWithDelta(30000000, $sumOfWeeks, 10);
    }

    public function test_cancelled_order_is_never_counted_in_revenue(): void
    {
        $table = DiningTable::factory()->create();
        $menu = MenuItem::factory()->create(['price' => 50000, 'hpp' => 20000]);
        $kasir = $this->kasir();

        $order = app(CreateOrderAction::class)->execute($table, 'Dewi', 'qris', [
            ['menu_id' => $menu->id, 'quantity' => 1, 'notes' => null],
        ], OrderSource::Qr);
        app(CancelOrderAction::class)->execute($order, 'Dibatalkan pelanggan', $kasir->id);

        $summary = app(ReportingService::class)->dashboardSummary(now());

        $this->assertSame(0, $summary['today']['omzet']);
        $this->assertSame(0, $summary['today']['transactions']);
    }
}
