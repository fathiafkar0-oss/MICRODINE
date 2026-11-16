<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed database demo MICRODINE.
     *
     * Menghasilkan: konfigurasi restoran, 3 akun staf, 4 kategori,
     * 15 menu, 12 meja, target bulanan, dan riwayat transaksi 14 hari.
     */
    public function run(): void
    {
        $this->call([
            RestaurantSettingSeeder::class,
            StaffSeeder::class,
            CategorySeeder::class,
            MenuItemSeeder::class,
            DiningTableSeeder::class,
            SalesTargetSeeder::class,
            DemoTransactionSeeder::class,
        ]);
    }
}
