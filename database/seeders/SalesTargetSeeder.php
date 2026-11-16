<?php

namespace Database\Seeders;

use App\Models\SalesTarget;
use App\Models\User;
use Illuminate\Database\Seeder;

class SalesTargetSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->where('role', 'admin')->first();

        if ($admin === null) {
            $this->command?->warn('SalesTargetSeeder dilewati: akun admin belum ada.');

            return;
        }

        SalesTarget::updateOrCreate(
            ['month_year' => now()->format('Y-m')],
            [
                'target_amount' => 45000000,
                'weekly_targets' => [10500000, 10500000, 10500000, 13500000],
                'created_by' => $admin->id,
            ],
        );
    }
}
