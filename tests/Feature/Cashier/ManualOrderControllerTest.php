<?php

namespace Tests\Feature\Cashier;

use App\Enums\UserRole;
use App\Models\DiningTable;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\User;
use App\Support\MenuPresenter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * `Cashier/Orders.jsx` (pesanan manual kasir) mengirim `menuId` dalam
 * format tampilan ("M-010", sesuai `useCart`) seperti Checkout pelanggan,
 * dan nama pemesan opsional ("Opsional" di UI). Memastikan
 * `ManualOrderRequest::prepareForValidation()` menormalisasi keduanya.
 */
class ManualOrderControllerTest extends TestCase
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

    public function test_cashier_can_create_a_manual_cash_order_with_frontend_style_menu_ids_and_no_customer_name(): void
    {
        $table = DiningTable::factory()->create(['number' => '07', 'is_active' => true]);
        $menu = MenuItem::factory()->create(['price' => 15000, 'hpp' => 6000]);

        $response = $this->actingAs($this->kasir())->post('/kasir/pesanan/manual', [
            'table_number' => '07',
            'customer_name' => '',
            'payment_method' => 'tunai',
            'items' => [
                ['menu_id' => MenuPresenter::displayId($menu->id), 'quantity' => 2],
            ],
        ]);

        $response->assertRedirect();
        $this->assertSame(1, Order::query()->count());

        $order = Order::query()->first();
        $this->assertSame('Pelanggan', $order->customer_name);
        $this->assertSame('paid', $order->payment_status->value);
        $this->assertSame($table->id, $order->tableSession->dining_table_id);
    }

    public function test_cashier_manual_order_rejects_an_unknown_menu_id(): void
    {
        DiningTable::factory()->create(['number' => '07', 'is_active' => true]);

        $this->actingAs($this->kasir())->post('/kasir/pesanan/manual', [
            'table_number' => '07',
            'customer_name' => 'Andi',
            'payment_method' => 'qris',
            'items' => [['menu_id' => 'M-999', 'quantity' => 1]],
        ])->assertInvalid(['items.0.menu_id']);
    }
}
