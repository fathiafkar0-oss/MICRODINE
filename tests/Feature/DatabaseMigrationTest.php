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
}
