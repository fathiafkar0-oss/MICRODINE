<?php

namespace Database\Factories;

use App\Enums\TableSessionStatus;
use App\Models\DiningTable;
use App\Models\TableSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TableSession>
 */
class TableSessionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'dining_table_id' => DiningTable::factory(),
            'status' => TableSessionStatus::Active,
            'opened_at' => now(),
            'closed_at' => null,
            'closed_by' => null,
        ];
    }

    /**
     * Sesi yang sudah ditutup kasir.
     */
    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => TableSessionStatus::Closed,
            'opened_at' => now()->subHours(2),
            'closed_at' => now(),
        ]);
    }
}
