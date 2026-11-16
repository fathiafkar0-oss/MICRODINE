<?php

namespace Tests\Feature;

use App\Actions\CancelOrderAction;
use App\Actions\CashPaymentAction;
use App\Actions\CreateOrderAction;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\DiningTable;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\RestaurantSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

/**
 * AGENTS.md invarian #1 — Pay-First Enforcement.
 * Pesanan HANYA boleh masuk / terlihat di antrean dapur bila
 * `payment_status = 'paid'`.
 */
class PayFirstOrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_unpaid_order_never_appears_in_kitchen_queue(): void
    {
        RestaurantSetting::current();
        $table = DiningTable::factory()->create();
        $menu = MenuItem::factory()->create(['price' => 20000, 'hpp' => 8000]);

        $order = app(CreateOrderAction::class)->execute(
            $table,
            'Andi',
            'qris',
            [['menu_id' => $menu->id, 'quantity' => 1, 'notes' => null]],
        );

        $this->assertSame(PaymentStatus::Pending, $order->payment_status);
        $this->assertFalse(Order::query()->kitchenQueue()->whereKey($order->id)->exists());
    }

    public function test_cash_payment_moves_order_into_kitchen_queue(): void
    {
        $table = DiningTable::factory()->create();
        $menu = MenuItem::factory()->create(['price' => 20000, 'hpp' => 8000]);
        $cashier = User::factory()->create(['role' => UserRole::Kasir]);

        $order = app(CreateOrderAction::class)->execute(
            $table,
            'Andi',
            PaymentMethod::Cash->value,
            [['menu_id' => $menu->id, 'quantity' => 1, 'notes' => null]],
        );

        $this->assertFalse(Order::query()->kitchenQueue()->whereKey($order->id)->exists());

        app(CashPaymentAction::class)->execute($order, $order->total, $cashier->id);

        $order->refresh();
        $this->assertSame(PaymentStatus::Paid, $order->payment_status);
        $this->assertTrue(Order::query()->kitchenQueue()->whereKey($order->id)->exists());
    }

    public function test_paid_status_is_terminal_and_cannot_be_cancelled(): void
    {
        $table = DiningTable::factory()->create();
        $menu = MenuItem::factory()->create();
        $cashier = User::factory()->create(['role' => UserRole::Kasir]);

        $order = app(CreateOrderAction::class)->execute(
            $table,
            'Andi',
            PaymentMethod::Cash->value,
            [['menu_id' => $menu->id, 'quantity' => 1, 'notes' => null]],
        );

        app(CashPaymentAction::class)->execute($order, $order->total, $cashier->id);

        $this->expectException(ValidationException::class);
        app(CancelOrderAction::class)->execute($order->refresh(), 'coba batalkan', $cashier->id);
    }
}
