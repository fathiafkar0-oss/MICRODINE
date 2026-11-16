<?php

namespace Database\Factories;

use App\Models\DiningTable;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<DiningTable>
 */
class DiningTableFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $number = fake()->unique()->numerify('##');

        return [
            'number' => $number,
            'capacity' => fake()->randomElement([2, 4, 4, 6]),
            'area' => fake()->randomElement(['Area Dalam', 'Teras']),
            'qr_token' => Str::random(32),
            'barcode_code' => 'MJ-'.$number,
            'is_active' => true,
        ];
    }
}
