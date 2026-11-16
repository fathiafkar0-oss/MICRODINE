<?php

namespace Tests\Feature;

use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * Verifikasi struktur tabel hasil T-006 terhadap ARCHITECTURE.md Bab 3.2
 * (Tabel 1-4: users, restaurant_settings, categories, menu_items).
 */
class DatabaseMigrationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Kolom uang harus berupa integer (bigint), bukan float/decimal.
     */
    private function assertIntegerColumn(string $table, string $column): void
    {
        $this->assertContains(
            Schema::getColumnType($table, $column),
            ['bigint', 'int8', 'integer'],
            "Kolom {$table}.{$column} harus bertipe integer Rupiah."
        );
    }

    public function test_users_table_uses_username_credentials_and_role(): void
    {
        foreach (['id', 'name', 'username', 'password', 'role', 'is_active', 'created_at', 'updated_at'] as $column) {
            $this->assertTrue(Schema::hasColumn('users', $column), "Kolom users.{$column} tidak ditemukan.");
        }

        // Login staf memakai username, bukan email.
        $this->assertFalse(Schema::hasColumn('users', 'email'));

        $id = DB::table('users')->insertGetId([
            'name' => 'Kasir Satu',
            'username' => 'kasir01',
            'password' => bcrypt('secret'),
            'role' => 'kasir',
        ]);

        $user = DB::table('users')->find($id);

        $this->assertSame('kasir', $user->role);
        $this->assertTrue((bool) $user->is_active, 'is_active harus default true.');
    }

    public function test_users_username_is_unique(): void
    {
        DB::table('users')->insert([
            'name' => 'Admin',
            'username' => 'admin',
            'password' => bcrypt('secret'),
            'role' => 'admin',
        ]);

        $this->expectException(QueryException::class);

        DB::table('users')->insert([
            'name' => 'Admin Lain',
            'username' => 'admin',
            'password' => bcrypt('secret'),
            'role' => 'admin',
        ]);
    }

    public function test_restaurant_settings_columns_and_defaults(): void
    {
        foreach ([
            'id',
            'restaurant_name',
            'address',
            'phone',
            'tax_enabled',
            'tax_rate_percent',
            'qris_expires_minutes',
            'created_at',
            'updated_at',
        ] as $column) {
            $this->assertTrue(Schema::hasColumn('restaurant_settings', $column), "Kolom restaurant_settings.{$column} tidak ditemukan.");
        }

        DB::table('restaurant_settings')->insert(['restaurant_name' => 'Warung MICRODINE']);

        $settings = DB::table('restaurant_settings')->first();

        $this->assertTrue((bool) $settings->tax_enabled, 'Pajak harus aktif secara default.');
        $this->assertSame(10, (int) $settings->tax_rate_percent);
        $this->assertSame(15, (int) $settings->qris_expires_minutes);
    }

    public function test_categories_columns_and_unique_constraints(): void
    {
        foreach (['id', 'name', 'slug', 'display_order', 'created_at', 'updated_at'] as $column) {
            $this->assertTrue(Schema::hasColumn('categories', $column), "Kolom categories.{$column} tidak ditemukan.");
        }

        DB::table('categories')->insert(['name' => 'Makanan', 'slug' => 'makanan']);

        $this->assertSame(0, (int) DB::table('categories')->value('display_order'));

        $this->expectException(QueryException::class);
        DB::table('categories')->insert(['name' => 'Minuman', 'slug' => 'makanan']);
    }

    public function test_menu_items_columns_money_types_and_soft_deletes(): void
    {
        foreach ([
            'id',
            'category_id',
            'name',
            'description',
            'price',
            'hpp',
            'image_path',
            'is_available',
            'show_in_catalog',
            'deleted_at',
            'created_at',
            'updated_at',
        ] as $column) {
            $this->assertTrue(Schema::hasColumn('menu_items', $column), "Kolom menu_items.{$column} tidak ditemukan.");
        }

        $this->assertIntegerColumn('menu_items', 'price');
        $this->assertIntegerColumn('menu_items', 'hpp');

        $categoryId = DB::table('categories')->insertGetId(['name' => 'Makanan', 'slug' => 'makanan']);

        $menuId = DB::table('menu_items')->insertGetId([
            'category_id' => $categoryId,
            'name' => 'Nasi Goreng',
            'price' => 25000,
            'hpp' => 12000,
        ]);

        $menu = DB::table('menu_items')->find($menuId);

        $this->assertSame(25000, (int) $menu->price);
        $this->assertSame(12000, (int) $menu->hpp);
        $this->assertTrue((bool) $menu->is_available);
        $this->assertTrue((bool) $menu->show_in_catalog);
        $this->assertNull($menu->deleted_at);
    }

    public function test_menu_items_requires_existing_category(): void
    {
        $this->expectException(QueryException::class);

        DB::table('menu_items')->insert([
            'category_id' => 999,
            'name' => 'Menu Tanpa Kategori',
            'price' => 10000,
            'hpp' => 5000,
        ]);
    }

    public function test_dining_tables_columns_and_unique_tokens(): void
    {
        foreach (['id', 'number', 'capacity', 'area', 'qr_token', 'barcode_code', 'is_active', 'created_at', 'updated_at'] as $column) {
            $this->assertTrue(Schema::hasColumn('dining_tables', $column), "Kolom dining_tables.{$column} tidak ditemukan.");
        }

        DB::table('dining_tables')->insert($this->diningTableAttributes('07'));

        $table = DB::table('dining_tables')->first();

        $this->assertSame(4, (int) $table->capacity);
        $this->assertSame('Area Dalam', $table->area);
        $this->assertTrue((bool) $table->is_active);

        $this->expectException(QueryException::class);
        DB::table('dining_tables')->insert($this->diningTableAttributes('07'));
    }

    public function test_table_sessions_allow_only_one_active_session_per_table(): void
    {
        $tableId = $this->createDiningTable('07');

        $this->insertSession($tableId, 'active');

        // Sesi kedua yang juga aktif pada meja yang sama HARUS ditolak database.
        $this->expectException(QueryException::class);
        $this->insertSession($tableId, 'active');
    }

    public function test_table_sessions_allow_many_closed_sessions(): void
    {
        $tableId = $this->createDiningTable('07');

        $this->insertSession($tableId, 'closed');
        $this->insertSession($tableId, 'closed');
        $this->insertSession($tableId, 'active');

        $this->assertSame(3, DB::table('table_sessions')->count());
        $this->assertSame(1, DB::table('table_sessions')->where('status', 'active')->count());
    }

    public function test_orders_columns_money_types_and_reporting_index(): void
    {
        foreach ([
            'id',
            'order_code',
            'daily_queue_number',
            'table_session_id',
            'customer_name',
            'source',
            'payment_method',
            'payment_status',
            'kitchen_status',
            'subtotal',
            'tax_amount',
            'total',
            'paid_at',
            'cancelled_at',
            'created_at',
            'updated_at',
        ] as $column) {
            $this->assertTrue(Schema::hasColumn('orders', $column), "Kolom orders.{$column} tidak ditemukan.");
        }

        $this->assertIntegerColumn('orders', 'subtotal');
        $this->assertIntegerColumn('orders', 'tax_amount');
        $this->assertIntegerColumn('orders', 'total');

        $orderId = $this->createOrder();

        $order = DB::table('orders')->find($orderId);

        $this->assertSame('pending', $order->payment_status);
        $this->assertSame('queued', $order->kitchen_status);
        $this->assertNull($order->paid_at);
    }

    public function test_order_items_store_historical_snapshots(): void
    {
        foreach ([
            'id',
            'order_id',
            'menu_item_id',
            'name_snapshot',
            'qty',
            'notes',
            'unit_price_snapshot',
            'unit_hpp_snapshot',
            'subtotal_price',
            'subtotal_hpp',
        ] as $column) {
            $this->assertTrue(Schema::hasColumn('order_items', $column), "Kolom order_items.{$column} tidak ditemukan.");
        }

        $this->assertIntegerColumn('order_items', 'unit_price_snapshot');
        $this->assertIntegerColumn('order_items', 'unit_hpp_snapshot');

        $orderId = $this->createOrder();

        DB::table('order_items')->insert([
            'order_id' => $orderId,
            'menu_item_id' => null,
            'name_snapshot' => 'Nasi Goreng Kampung',
            'qty' => 2,
            'notes' => 'Tanpa bawang',
            'unit_price_snapshot' => 25000,
            'unit_hpp_snapshot' => 11500,
            'subtotal_price' => 50000,
            'subtotal_hpp' => 23000,
        ]);

        $item = DB::table('order_items')->first();

        $this->assertSame(50000, (int) $item->subtotal_price);
        $this->assertSame(23000, (int) $item->subtotal_hpp);
        $this->assertSame('Nasi Goreng Kampung', $item->name_snapshot);
    }

    public function test_order_items_are_deleted_with_their_order(): void
    {
        $orderId = $this->createOrder();

        DB::table('order_items')->insert([
            'order_id' => $orderId,
            'menu_item_id' => null,
            'name_snapshot' => 'Es Teh Manis',
            'qty' => 1,
            'unit_price_snapshot' => 5000,
            'unit_hpp_snapshot' => 1200,
            'subtotal_price' => 5000,
            'subtotal_hpp' => 1200,
        ]);

        DB::table('orders')->where('id', $orderId)->delete();

        $this->assertSame(0, DB::table('order_items')->count());
    }

    public function test_payments_require_unique_idempotency_key(): void
    {
        foreach ([
            'id',
            'order_id',
            'provider',
            'provider_ref',
            'amount',
            'status',
            'signature_valid',
            'raw_payload',
            'idempotency_key',
            'expires_at',
        ] as $column) {
            $this->assertTrue(Schema::hasColumn('payments', $column), "Kolom payments.{$column} tidak ditemukan.");
        }

        $this->assertIntegerColumn('payments', 'amount');

        $orderId = $this->createOrder();

        DB::table('payments')->insert($this->paymentAttributes($orderId, 'webhook-abc'));

        $this->expectException(QueryException::class);
        DB::table('payments')->insert($this->paymentAttributes($orderId, 'webhook-abc'));
    }

    public function test_order_status_logs_and_sales_targets_columns(): void
    {
        foreach (['id', 'order_id', 'actor_type', 'actor_id', 'from_status', 'to_status', 'notes', 'created_at'] as $column) {
            $this->assertTrue(Schema::hasColumn('order_status_logs', $column), "Kolom order_status_logs.{$column} tidak ditemukan.");
        }

        foreach (['id', 'month_year', 'target_amount', 'weekly_targets', 'created_by'] as $column) {
            $this->assertTrue(Schema::hasColumn('sales_targets', $column), "Kolom sales_targets.{$column} tidak ditemukan.");
        }

        $orderId = $this->createOrder();

        DB::table('order_status_logs')->insert([
            'order_id' => $orderId,
            'actor_type' => 'system',
            'actor_id' => null,
            'from_status' => 'pending',
            'to_status' => 'paid',
            'notes' => 'Webhook QRIS valid',
            'created_at' => now(),
        ]);

        $this->assertSame('paid', DB::table('order_status_logs')->value('to_status'));

        $adminId = DB::table('users')->insertGetId([
            'name' => 'Admin',
            'username' => 'admin',
            'password' => bcrypt('secret'),
            'role' => 'admin',
        ]);

        DB::table('sales_targets')->insert([
            'month_year' => '2026-11',
            'target_amount' => 45000000,
            'weekly_targets' => json_encode([10500000, 10500000, 10500000, 13500000]),
            'created_by' => $adminId,
        ]);

        $this->assertSame(45000000, (int) DB::table('sales_targets')->value('target_amount'));
    }

    /**
     * @return array<string, mixed>
     */
    private function diningTableAttributes(string $number, ?string $token = null): array
    {
        $token ??= bin2hex(random_bytes(16));

        return [
            'number' => $number,
            'capacity' => 4,
            'area' => 'Area Dalam',
            'qr_token' => $token,
            'barcode_code' => 'MJ-'.$number,
            'is_active' => true,
        ];
    }

    private function createDiningTable(string $number): int
    {
        return DB::table('dining_tables')->insertGetId($this->diningTableAttributes($number));
    }

    private function insertSession(int $diningTableId, string $status): int
    {
        return DB::table('table_sessions')->insertGetId([
            'dining_table_id' => $diningTableId,
            'status' => $status,
            'opened_at' => now(),
            'closed_at' => $status === 'closed' ? now() : null,
        ]);
    }

    private function createOrder(): int
    {
        $tableId = $this->createDiningTable('07');
        $sessionId = $this->insertSession($tableId, 'active');

        return DB::table('orders')->insertGetId([
            'order_code' => 'ORD-'.random_int(1000, 9999),
            'daily_queue_number' => 'A-024',
            'table_session_id' => $sessionId,
            'customer_name' => 'Andi',
            'source' => 'qr',
            'payment_method' => 'qris',
            'subtotal' => 50000,
            'tax_amount' => 5000,
            'total' => 55000,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function paymentAttributes(int $orderId, string $idempotencyKey): array
    {
        return [
            'order_id' => $orderId,
            'provider' => 'midtrans',
            'provider_ref' => 'ref-001',
            'amount' => 55000,
            'status' => 'paid',
            'signature_valid' => true,
            'idempotency_key' => $idempotencyKey,
            'expires_at' => now()->addMinutes(15),
        ];
    }
}
