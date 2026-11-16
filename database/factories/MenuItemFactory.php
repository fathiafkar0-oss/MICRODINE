<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MenuItem>
 */
class MenuItemFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $hpp = fake()->numberBetween(4, 15) * 1000;
        $price = $hpp + fake()->numberBetween(3, 20) * 1000;

        return [
            'category_id' => Category::factory(),
            'name' => fake()->unique()->words(3, true),
            'description' => fake()->sentence(),
            'price' => $price,
            'hpp' => $hpp,
            'image_path' => null,
            'is_available' => true,
            'show_in_catalog' => true,
        ];
    }

    /**
     * Menu yang sedang habis (tidak tampil tersedia di dapur).
     */
    public function unavailable(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_available' => false,
        ]);
    }
}
