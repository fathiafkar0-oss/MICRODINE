<?php

namespace Tests\Feature\Customer;

use App\Models\DiningTable;
use App\Models\MenuItem;
use App\Models\Order;
use App\Support\MenuPresenter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Checkout/Index.jsx mengirim `menuId` dalam format tampilan ("M-010",
 * sesuai `useCart`), bukan ID baris database mentah. Memastikan
 * `CheckoutRequest::prepareForValidation()` menormalisasinya dengan benar.
 */
class CheckoutControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_accepts_frontend_style_menu_ids_and_creates_a_real_order(): void
    {
        $table = DiningTable::factory()->create(['number' => '07', 'is_active' => true]);
        $menu = MenuItem::factory()->create(['price' => 18000, 'hpp' => 7000]);

        $response = $this->post('/meja/07/checkout', [
            'customer_name' => 'Fenny',
            'payment_method' => 'qris',
            'items' => [
                ['menu_id' => MenuPresenter::displayId($menu->id), 'quantity' => 2, 'notes' => 'Pedas'],
            ],
        ]);

        $response->assertRedirect();
        $this->assertSame(1, Order::query()->count());

        $order = Order::query()->first();
        $this->assertSame('Fenny', $order->customer_name);
        $this->assertSame(36000, $order->subtotal);
        $this->assertSame($table->id, $order->tableSession->dining_table_id);
    }

    public function test_checkout_rejects_an_unknown_menu_id(): void
    {
        DiningTable::factory()->create(['number' => '07', 'is_active' => true]);

        $this->post('/meja/07/checkout', [
            'customer_name' => 'Fenny',
            'payment_method' => 'qris',
            'items' => [
                ['menu_id' => 'M-999', 'quantity' => 1],
            ],
        ])->assertInvalid(['items.0.menu_id']);
    }
}
