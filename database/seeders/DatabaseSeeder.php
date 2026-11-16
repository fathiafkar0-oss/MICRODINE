<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Akun staf awal agar portal login bisa dipakai sejak Fase 1.
     * Data demo lengkap (meja, menu, transaksi 14 hari) ditambahkan pada T-011.
     */
    public function run(): void
    {
        $accounts = [
            ['name' => 'Admin MICRODINE', 'username' => 'admin', 'role' => 'admin'],
            ['name' => 'Kasir MICRODINE', 'username' => 'kasir', 'role' => 'kasir'],
            ['name' => 'Dapur MICRODINE', 'username' => 'dapur', 'role' => 'dapur'],
        ];

        foreach ($accounts as $account) {
            User::updateOrCreate(
                ['username' => $account['username']],
                [
                    'name' => $account['name'],
                    'role' => $account['role'],
                    'is_active' => true,
                    'password' => Hash::make('password'),
                ],
            );
        }
    }
}
