<?php

namespace Tests\Feature\Cashier;

use App\Actions\CancelOrderAction;
use App\Actions\CreateOrderAction;
use App\Enums\OrderSource;
use App\Enums\PaymentMethod;
use App\Enums\UserRole;
use App\Models\DiningTable;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * Modul I — Histori & Struk.
 * Halaman `Cashier/History` melakukan SELURUH filter, pagination, statistik
 * dan "cetak ulang struk" di sisi klien dari satu array `orders` penuh
 * (lihat resources/js/Data/mock/orders.js: "Backend cukup mengirim props
 * dengan bentuk yang sama"). Jadi kontrak backend hanya: kirim SEMUA
 * pesanan pada tanggal yang diminta (lintas sumber qr/kasir, lintas status),
 * dalam bentuk yang sama dengan `OrderPresenter`, plus `restaurant`.
 */
class HistoryControllerTest extends TestCase
{
    use RefreshDatabase;

    private function kasir(): User
    {
        return User::create([
            'name' => 'Kasir',
            'username' => 'kasir',
            'password' => 'secret',
            'role' => UserRole::Kasir,
            'is_active' => true,
        ]);
    }

    public function test_history_returns_every_order_for_the_requested_date_regardless_of_source_or_status(): void
    {
        $table = DiningTable::factory()->create();
        $menu = MenuItem::factory()->create(['price' => 20000, 'hpp' => 8000]);
        $action = app(CreateOrderAction::class);

        $today = $action->execute($table, 'Dewi', 'qris', [['menu_id' => $menu->id, 'quantity' => 1, 'notes' => null]]);

        $table2 = DiningTable::factory()->create();
        $cashOrder = $action->execute($table2, 'Budi', PaymentMethod::Cash->value, [['menu_id' => $menu->id, 'quantity' => 2, 'notes' => null]], OrderSource::Manual);

        // Pesanan kemarin tidak boleh ikut masuk histori "hari ini".
        $table3 = DiningTable::factory()->create();
        $yesterday = $action->execute($table3, 'Rian', 'qris', [['menu_id' => $menu->id, 'quantity' => 1, 'notes' => null]]);
        $yesterday->forceFill(['created_at' => now()->subDay()])->save();

        $response = $this->actingAs($this->kasir())
            ->withHeaders(['X-Inertia' => 'true'])
            ->get('/kasir/histori');

        $response->assertOk();
        $page = $response->json();

        $this->assertSame('Cashier/History', $page['component']);

        $codes = array_column($page['props']['orders'], 'code');
        $this->assertContains($today->daily_queue_number, $codes);
        $this->assertContains($cashOrder->daily_queue_number, $codes);
        $this->assertNotContains($yesterday->daily_queue_number, $codes);

        $cash = collect($page['props']['orders'])->firstWhere('code', $cashOrder->daily_queue_number);
        $this->assertSame('kasir', $cash['source']);
        $this->assertSame('tunai', $cash['method']);
        $this->assertSame(2, $cash['items'][0]['qty']);
        $this->assertArrayHasKey('name', $page['props']['restaurant']);
    }

    public function test_history_accepts_an_explicit_date_query_parameter(): void
    {
        $table = DiningTable::factory()->create();
        $menu = MenuItem::factory()->create(['price' => 15000, 'hpp' => 6000]);
        $order = app(CreateOrderAction::class)->execute($table, 'Lina', 'qris', [['menu_id' => $menu->id, 'quantity' => 1, 'notes' => null]]);

        $pastDate = Carbon::parse('2026-11-01 12:00:00');
        $order->forceFill(['created_at' => $pastDate])->save();

        $response = $this->actingAs($this->kasir())
            ->withHeaders(['X-Inertia' => 'true'])
            ->get('/kasir/histori?tanggal=2026-11-01');

        $response->assertOk();
        $codes = array_column($response->json('props.orders'), 'code');
        $this->assertContains($order->daily_queue_number, $codes);
    }

    public function test_cancelled_and_failed_orders_still_appear_in_history(): void
    {
        $table = DiningTable::factory()->create();
        $menu = MenuItem::factory()->create(['price' => 10000, 'hpp' => 4000]);
        $order = app(CreateOrderAction::class)->execute($table, 'Maya', 'qris', [['menu_id' => $menu->id, 'quantity' => 1, 'notes' => null]]);

        $kasir = $this->kasir();
        app(CancelOrderAction::class)->execute($order, 'Pembeli batal', $kasir->id);

        $response = $this->actingAs($kasir)
            ->withHeaders(['X-Inertia' => 'true'])
            ->get('/kasir/histori');

        $cancelled = collect($response->json('props.orders'))->firstWhere('code', $order->daily_queue_number);
        $this->assertNotNull($cancelled, 'Pesanan dibatalkan tetap harus muncul di histori.');
        $this->assertSame('dibatalkan', $cancelled['status']);
    }
}
