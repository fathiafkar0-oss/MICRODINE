<?php

namespace Tests\Feature;

use App\Enums\KitchenStatus;
use App\Enums\OrderSource;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\DiningTable;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusLog;
use App\Models\Payment;
use App\Models\RestaurantSetting;
use App\Models\SalesTarget;
use App\Models\TableSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Verifikasi model Eloquent (T-010): casts, relasi, scope, dan pemetaan status.
 */
class ModelRelationTest extends TestCase
{
    use RefreshDatabase;

    private function makeSession(): TableSession
    {
        return TableSession::create([
            'dining_table_id' => DiningTable::create([
                'number' => '07',
                'capacity' => 4,
                'area' => 'Area Dalam',
                'qr_token' => bin2hex(random_bytes(16)),
                'barcode_code' => 'MJ-07',
                'is_active' => true,
            ])->id,
            'status' => 'active',
            'opened_at' => now(),
        ]);
    }

    private function makeOrder(TableSession $session, array $attributes = []): Order
    {
        return Order::create([
            'order_code' => 'ORD-'.random_int(1000, 9999),
            'daily_queue_number' => 'A-024',
            'table_session_id' => $session->id,
            'customer_name' => 'Andi',
            'source' => 'qr',
            'payment_method' => 'qris',
            'subtotal' => 50000,
            'tax_amount' => 5000,
            'total' => 55000,
            ...$attributes,
        ]);
    }

    public function test_user_role_cast_and_relations(): void
    {
        $user = User::create([
            'name' => 'Kasir Satu',
            'username' => 'kasir01',
            'password' => 'secret',
            'role' => UserRole::Kasir,
        ]);

        $this->assertInstanceOf(UserRole::class, $user->role);
        $this->assertTrue($user->hasRole('kasir'));
        $this->assertTrue($user->isActive());
        $this->assertSame('kasir', $user->role->value);
        $this->assertNotNull($user->password);
        $this->assertNotSame('secret', $user->password, 'Password harus ter-hash otomatis.');
    }

    public function test_restaurant_setting_singleton_and_tax_rate(): void
    {
        $first = RestaurantSetting::current();
        $second = RestaurantSetting::current();

        $this->assertSame($first->id, $second->id);
        $this->assertSame(1, RestaurantSetting::count());
        $this->assertEqualsWithDelta(0.10, $second->taxRate(), 0.0001);

        $second->update(['tax_enabled' => false]);
        $this->assertEqualsWithDelta(0.0, $second->fresh()->taxRate(), 0.0001);
    }

    public function test_menu_item_relations_and_margin(): void
    {
        $category = Category::create(['name' => 'Makanan', 'slug' => 'makanan']);
        $menu = MenuItem::create([
            'category_id' => $category->id,
            'name' => 'Nasi Goreng Kampung',
            'price' => 25000,
            'hpp' => 11500,
        ]);

        $this->assertSame('Makanan', $menu->category->name);
        $this->assertTrue($menu->category->menuItems->contains($menu));
        $this->assertSame(13500, $menu->marginRp());
        $this->assertEqualsWithDelta(54.0, $menu->marginPercent(), 0.1);
    }

    public function test_dining_table_and_session_relations(): void
    {
        $session = $this->makeSession();

        $table = $session->diningTable;

        $this->assertSame('07', $table->number);
        $this->assertTrue($table->activeSession->is($session));
        $this->assertSame('terisi', $table->displayStatus());
        $this->assertTrue($session->isActive());
        $this->assertTrue($table->fresh()->sessions->contains($session));
    }

    public function test_order_casts_relations_and_frontend_status(): void
    {
        $session = $this->makeSession();
        $order = $this->makeOrder($session, ['payment_status' => 'pending']);

        $this->assertInstanceOf(PaymentStatus::class, $order->payment_status);
        $this->assertInstanceOf(KitchenStatus::class, $order->kitchen_status);
        $this->assertInstanceOf(OrderSource::class, $order->source);
        $this->assertInstanceOf(PaymentMethod::class, $order->payment_method);
        $this->assertSame('menunggu_bayar', $order->frontendStatus());
        $this->assertFalse($order->isPaid());

        $order->update([
            'payment_status' => PaymentStatus::Paid,
            'kitchen_status' => KitchenStatus::Cooking,
            'paid_at' => now(),
        ]);

        $this->assertTrue($order->fresh()->isPaid());
        $this->assertSame('diproses', $order->fresh()->frontendStatus());

        $order->update(['kitchen_status' => KitchenStatus::Served]);
        $this->assertSame('diantar', $order->fresh()->frontendStatus());

        $this->assertTrue($session->orders->contains($order));
    }

    public function test_order_status_scope_paid_and_kitchen_queue(): void
    {
        $session = $this->makeSession();

        $pending = $this->makeOrder($session);
        $queued = $this->makeOrder($session, [
            'payment_status' => PaymentStatus::Paid,
            'kitchen_status' => KitchenStatus::Queued,
            'paid_at' => now(),
        ]);
        $served = $this->makeOrder($session, [
            'payment_status' => PaymentStatus::Paid,
            'kitchen_status' => KitchenStatus::Served,
            'paid_at' => now(),
        ]);

        $this->assertSame(2, Order::query()->paid()->count());
        $this->assertTrue(Order::query()->kitchenQueue()->get()->contains($queued));
        $this->assertFalse(Order::query()->kitchenQueue()->get()->contains($served));
        $this->assertFalse(Order::query()->kitchenQueue()->get()->contains($pending));
    }

    public function test_order_items_payments_and_logs_relations(): void
    {
        $session = $this->makeSession();
        $order = $this->makeOrder($session);

        $item = OrderItem::create([
            'order_id' => $order->id,
            'name_snapshot' => 'Nasi Goreng Kampung',
            'qty' => 2,
            'unit_price_snapshot' => 25000,
            'unit_hpp_snapshot' => 11500,
            'subtotal_price' => 50000,
            'subtotal_hpp' => 23000,
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'provider' => 'midtrans',
            'amount' => 55000,
            'status' => PaymentStatus::Paid,
            'signature_valid' => true,
            'idempotency_key' => 'webhook-abc',
            'expires_at' => now()->addMinutes(15),
        ]);

        $log = OrderStatusLog::create([
            'order_id' => $order->id,
            'actor_type' => 'system',
            'from_status' => 'pending',
            'to_status' => 'paid',
            'notes' => 'Webhook QRIS valid',
        ]);

        $this->assertTrue($order->items->contains($item));
        $this->assertTrue($order->payments->contains($payment));
        $this->assertTrue($order->statusLogs->contains($log));
        $this->assertSame(27000, $item->profit());
        $this->assertTrue($payment->signature_valid);
        $this->assertNotNull($payment->expires_at);
        $this->assertNotNull($log->created_at);
    }

    public function test_sales_target_casts_weekly_targets(): void
    {
        $admin = User::create([
            'name' => 'Admin',
            'username' => 'admin',
            'password' => 'secret',
            'role' => 'admin',
        ]);

        $target = SalesTarget::create([
            'month_year' => '2026-11',
            'target_amount' => 45000000,
            'weekly_targets' => [10500000, 10500000, 10500000, 13500000],
            'created_by' => $admin->id,
        ]);

        $this->assertIsArray($target->weekly_targets);
        $this->assertCount(4, $target->weekly_targets);
        $this->assertSame(45000000, $target->target_amount);
        $this->assertTrue($target->createdBy->is($admin));
    }
}
