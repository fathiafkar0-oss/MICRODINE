<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Akun staf default (password: "password", ganti sebelum produksi).
 */
class StaffSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            ['name' => 'Rina Admin', 'username' => 'admin', 'role' => UserRole::Admin],
            ['name' => 'Dika Kasir', 'username' => 'kasir', 'role' => UserRole::Kasir],
            ['name' => 'Sari Dapur', 'username' => 'dapur', 'role' => UserRole::Dapur],
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
