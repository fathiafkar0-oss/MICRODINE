<?php

namespace Database\Factories;

use App\Models\SalesTarget;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SalesTarget>
 */
class SalesTargetFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $monthly = fake()->numberBetween(30, 60) * 1000000;
        $weekly = (int) round($monthly / 4);

        return [
            'month_year' => now()->format('Y-m'),
            'target_amount' => $monthly,
            'weekly_targets' => [$weekly, $weekly, $weekly, $monthly - ($weekly * 3)],
            'created_by' => User::factory()->role('admin'),
        ];
    }
}
