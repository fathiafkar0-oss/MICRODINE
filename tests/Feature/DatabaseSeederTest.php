<?php

namespace Tests\Feature;

use App\Enums\KitchenStatus;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\DiningTable;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Payment;
use App\Models\SalesTarget;
use App\Models\TableSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Verifikasi seeder demo (T-011): data cukup untuk demo & pengujian.
 */
class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_master_data_complete(): void
    {
        $this->assertSame(12, DiningTable::count(), 'Seeder harus membuat 12 meja.');
        $this->assertSame(4, Category::count(), 'Seeder harus membuat 4 kategori.');
        $this->assertSame(15, MenuItem::count(), 'Seeder harus membuat 15 menu.');
        $this->assertSame(3, User::count(), 'Seeder harus membuat 3 akun staf.');
    }

    public function test_staff_accounts_have_roles(): void
    {
        $this->assertTrue(User::query()->where('role', UserRole::Admin->value)->exists());
        $this->assertTrue(User::query()->where('role', UserRole::Kasir->value)->exists());
        $this->assertTrue(User::query()->where('role', UserRole::Dapur->value)->exists());

        $admin = User::query()->where('username', 'admin')->first();

        $this->assertNotNull($admin);
        $this->assertInstanceOf(UserRole::class, $admin->role);
        $this->assertTrue($admin->is_active);
    }

    public function test_historical_transactions_are_paid(): void
    {
        $paid = Order::query()->where('payment_status', PaymentStatus::Paid->value)->get();

        $this->assertGreaterThanOrEqual(50, $paid->count(), 'Harus ada riwayat transaksi lunas yang cukup.');
        $this->assertTrue($paid->every(fn (Order $order): bool => $order->paid_at !== null));
        $this->assertTrue($paid->every(fn (Order $order): bool => $order->total === $order->subtotal + $order->tax_amount));

        $this->assertSame($paid->count(), Payment::query()->where('status', PaymentStatus::Paid->value)->count());
    }

    public function test_order_items_have_price_and_hpp_snapshots(): void
    {
        $items = Order::query()->with('items')->get()->flatMap->items;

        $this->assertNotEmpty($items);
        $this->assertTrue($items->every(fn ($item): bool => $item->unit_price_snapshot > 0));
        $this->assertTrue($items->every(fn ($item): bool => $item->unit_hpp_snapshot > 0));
        $this->assertTrue($items->every(
            fn ($item): bool => $item->subtotal_price === $item->qty * $item->unit_price_snapshot
        ));
    }

    public function test_today_has_varied_active_orders(): void
    {
        $today = Order::query()->whereDate('created_at', now()->toDateString())->get();

        $this->assertGreaterThanOrEqual(7, $today->count());
        $this->assertTrue($today->contains(fn (Order $order): bool => $order->payment_status === PaymentStatus::Pending));
        $this->assertTrue($today->contains(fn (Order $order): bool => $order->payment_status === PaymentStatus::Paid));

        $activeSessions = TableSession::query()->where('status', 'active')->get();

        $this->assertSame($activeSessions->count(), $activeSessions->pluck('dining_table_id')->unique()->count());

        $queue = Order::query()->kitchenQueue()->get();
        $this->assertTrue(
            $queue->every(fn (Order $order): bool => $order->payment_status === PaymentStatus::Paid),
            'Antrean dapur tidak boleh berisi pesanan belum bayar.'
        );
    }

    public function test_kitchen_queue_only_contains_paid_orders(): void
    {
        $pendingInQueue = Order::query()
            ->where('payment_status', PaymentStatus::Pending->value)
            ->whereIn('kitchen_status', [KitchenStatus::Cooking->value, KitchenStatus::Done->value])
            ->count();

        $this->assertSame(0, $pendingInQueue);
    }

    public function test_sales_target_for_current_month_exists(): void
    {
        $target = SalesTarget::query()->where('month_year', now()->format('Y-m'))->first();

        $this->assertNotNull($target);
        $this->assertSame(45000000, $target->target_amount);
        $this->assertIsArray($target->weekly_targets);
    }
}
