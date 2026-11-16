<?php

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\OrderStatusLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderStatusLog>
 */
class OrderStatusLogFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'actor_type' => 'system',
            'actor_id' => null,
            'from_status' => PaymentStatus::Pending->value,
            'to_status' => PaymentStatus::Paid->value,
            'notes' => 'Pembayaran tervalidasi',
            'created_at' => now(),
        ];
    }
}
