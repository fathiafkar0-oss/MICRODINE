<?php

namespace Database\Factories;

use App\Enums\KitchenStatus;
use App\Enums\OrderSource;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\TableSession;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->numberBetween(1, 8) * 10000;
        $tax = (int) round($subtotal * 0.10);

        return [
            'order_code' => 'ORD-'.Str::upper(Str::random(6)),
            'daily_queue_number' => 'A-'.fake()->unique()->numerify('###'),
            'table_session_id' => TableSession::factory(),
            'customer_name' => fake()->firstName(),
            'source' => OrderSource::Qr,
            'payment_method' => PaymentMethod::Qris,
            'payment_status' => PaymentStatus::Pending,
            'kitchen_status' => KitchenStatus::Queued,
            'subtotal' => $subtotal,
            'tax_amount' => $tax,
            'total' => $subtotal + $tax,
            'paid_at' => null,
            'cancelled_at' => null,
        ];
    }

    /**
     * Pesanan yang sudah lunas (layak masuk antrean dapur).
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_status' => PaymentStatus::Paid,
            'paid_at' => now(),
        ]);
    }

    /**
     * Pesanan tunai yang menunggu konfirmasi kasir.
     */
    public function cash(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_method' => PaymentMethod::Cash,
        ]);
    }
}
