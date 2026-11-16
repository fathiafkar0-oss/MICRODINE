<?php

namespace Database\Factories;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $qty = fake()->numberBetween(1, 3);
        $unitPrice = fake()->numberBetween(5, 30) * 1000;
        $unitHpp = (int) round($unitPrice * 0.45);

        return [
            'order_id' => Order::factory(),
            'menu_item_id' => MenuItem::factory(),
            'name_snapshot' => fake()->words(3, true),
            'qty' => $qty,
            'notes' => fake()->optional()->sentence(),
            'unit_price_snapshot' => $unitPrice,
            'unit_hpp_snapshot' => $unitHpp,
            'subtotal_price' => $qty * $unitPrice,
            'subtotal_hpp' => $qty * $unitHpp,
        ];
    }
}
