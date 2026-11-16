<?php

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'provider' => 'midtrans',
            'provider_ref' => 'REF-'.Str::upper(Str::random(10)),
            'amount' => fake()->numberBetween(10, 200) * 1000,
            'status' => PaymentStatus::Paid,
            'signature_valid' => true,
            'raw_payload' => null,
            'idempotency_key' => 'idem-'.Str::uuid()->toString(),
            'expires_at' => now()->addMinutes(15),
        ];
    }

    /**
     * Pembayaran tunai yang dicatat kasir.
     */
    public function cash(): static
    {
        return $this->state(fn (array $attributes) => [
            'provider' => 'cash',
            'provider_ref' => 'STRUK-'.Str::upper(Str::random(6)),
            'signature_valid' => false,
        ]);
    }
}
