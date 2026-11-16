<?php

namespace Database\Seeders;

use App\Enums\KitchenStatus;
use App\Enums\OrderSource;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\DiningTable;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusLog;
use App\Models\Payment;
use App\Models\RestaurantSetting;
use App\Models\TableSession;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Riwayat transaksi 14 hari (13 hari lampau + pesanan aktif hari ini).
 * Angka mengikuti pola mockup proposal agar dasbor admin & histori kasir
 * langsung terisi saat demo.
 */
class DemoTransactionSeeder extends Seeder
{
    private float $taxRate = 0.0;

    /** @var Collection<int, MenuItem> */
    private Collection $menus;

    /** @var Collection<int, DiningTable> */
    private Collection $tables;

    public function run(): void
    {
        $this->taxRate = RestaurantSetting::current()->taxRate();
        $this->menus = MenuItem::query()->where('is_available', true)->get();
        $this->tables = DiningTable::query()->where('is_active', true)->orderBy('number')->get();

        if ($this->menus->isEmpty() || $this->tables->isEmpty()) {
            $this->command?->warn('DemoTransactionSeeder dilewati: menu/meja belum tersedia.');

            return;
        }

        for ($daysAgo = 13; $daysAgo >= 1; $daysAgo--) {
            $this->seedHistoryDay($daysAgo);
        }

        $this->seedToday();
    }

    /**
     * Riwayat harian: semua pesanan lunas dengan sesi meja yang sudah ditutup.
     */
    private function seedHistoryDay(int $daysAgo): void
    {
        $date = now()->subDays($daysAgo)->startOfDay();
        $orderCount = random_int(6, 12);

        for ($i = 0; $i < $orderCount; $i++) {
            $openedAt = $date->copy()->addHours(10)->addMinutes($i * 25);
            $closedAt = $openedAt->copy()->addMinutes(random_int(30, 75));
            $table = $this->tables->random();

            $session = TableSession::create([
                'dining_table_id' => $table->id,
                'status' => 'closed',
                'opened_at' => $openedAt,
                'closed_at' => $closedAt,
            ]);
            $session->forceFill(['created_at' => $openedAt, 'updated_at' => $closedAt])->saveQuietly();

            $this->createOrder(
                session: $session,
                at: $openedAt,
                queueNumber: 'A-'.str_pad((string) ($i + 1), 3, '0', STR_PAD_LEFT),
                method: fake()->randomElement([PaymentMethod::Qris, PaymentMethod::Cash]),
                paymentStatus: PaymentStatus::Paid,
                kitchenStatus: KitchenStatus::Served,
            );
        }
    }

    /**
     * Pesanan hari ini: campuran menunggu bayar, diproses, selesai, dan diantar.
     */
    private function seedToday(): void
    {
        $plan = [
            [PaymentStatus::Pending, KitchenStatus::Queued, PaymentMethod::Cash],
            [PaymentStatus::Pending, KitchenStatus::Queued, PaymentMethod::Cash],
            [PaymentStatus::Pending, KitchenStatus::Queued, PaymentMethod::Qris],
            [PaymentStatus::Paid, KitchenStatus::Cooking, PaymentMethod::Qris],
            [PaymentStatus::Paid, KitchenStatus::Queued, PaymentMethod::Qris],
            [PaymentStatus::Paid, KitchenStatus::Done, PaymentMethod::Cash],
            [PaymentStatus::Paid, KitchenStatus::Served, PaymentMethod::Cash],
        ];

        $tables = $this->tables->shuffle()->take(count($plan))->values();

        foreach ($plan as $index => [$paymentStatus, $kitchenStatus, $method]) {
            $openedAt = now()->subMinutes(60 - $index * 6);
            $table = $tables[$index];

            $session = TableSession::create([
                'dining_table_id' => $table->id,
                'status' => 'active',
                'opened_at' => $openedAt,
            ]);
            $session->forceFill(['created_at' => $openedAt, 'updated_at' => $openedAt])->saveQuietly();

            $this->createOrder(
                session: $session,
                at: $openedAt,
                queueNumber: 'A-'.str_pad((string) (21 + $index), 3, '0', STR_PAD_LEFT),
                method: $method,
                paymentStatus: $paymentStatus,
                kitchenStatus: $kitchenStatus,
            );
        }
    }

    private function createOrder(
        TableSession $session,
        Carbon $at,
        string $queueNumber,
        PaymentMethod $method,
        PaymentStatus $paymentStatus,
        KitchenStatus $kitchenStatus,
    ): Order {
        $lines = $this->buildLines();
        $subtotal = array_sum(array_column($lines, 'subtotal_price'));
        $tax = (int) round($subtotal * $this->taxRate);
        $paidAt = $paymentStatus === PaymentStatus::Paid ? $at->copy()->addMinutes(3) : null;

        $order = new Order([
            'order_code' => 'ORD-'.$at->format('ymd').'-'.strtoupper(Str::random(4)),
            'daily_queue_number' => $queueNumber,
            'table_session_id' => $session->id,
            'customer_name' => fake()->firstName(),
            'source' => fake()->boolean(70) ? OrderSource::Qr : OrderSource::Manual,
            'payment_method' => $method,
            'payment_status' => $paymentStatus,
            'kitchen_status' => $kitchenStatus,
            'subtotal' => $subtotal,
            'tax_amount' => $tax,
            'total' => $subtotal + $tax,
        ]);

        $order->forceFill([
            'created_at' => $at,
            'updated_at' => $at,
            'paid_at' => $paidAt,
        ])->save();

        foreach ($lines as $line) {
            $item = OrderItem::create([...$line, 'order_id' => $order->id]);
            $item->forceFill(['created_at' => $at, 'updated_at' => $at])->saveQuietly();
        }

        if ($paymentStatus === PaymentStatus::Paid) {
            Payment::create([
                'order_id' => $order->id,
                'provider' => $method === PaymentMethod::Qris ? 'midtrans' : 'cash',
                'provider_ref' => 'DEMO-'.Str::upper(Str::random(8)),
                'amount' => $order->total,
                'status' => PaymentStatus::Paid,
                'signature_valid' => $method === PaymentMethod::Qris,
                'idempotency_key' => 'demo-'.Str::uuid()->toString(),
                'expires_at' => $at->copy()->addMinutes(15),
            ]);

            OrderStatusLog::create([
                'order_id' => $order->id,
                'actor_type' => $method === PaymentMethod::Qris ? 'gateway' : 'kasir',
                'from_status' => PaymentStatus::Pending->value,
                'to_status' => PaymentStatus::Paid->value,
                'notes' => 'Pelunasan demo',
                'created_at' => $paidAt,
            ]);
        }

        return $order;
    }

    /**
     * Susun 1-3 baris pesanan dengan snapshot harga & HPP dari master menu.
     *
     * @return array<int, array<string, mixed>>
     */
    private function buildLines(): array
    {
        return $this->menus
            ->random(random_int(1, 3))
            ->map(function (MenuItem $menu): array {
                $qty = random_int(1, 2);

                return [
                    'menu_item_id' => $menu->id,
                    'name_snapshot' => $menu->name,
                    'qty' => $qty,
                    'notes' => null,
                    'unit_price_snapshot' => $menu->price,
                    'unit_hpp_snapshot' => $menu->hpp,
                    'subtotal_price' => $qty * $menu->price,
                    'subtotal_hpp' => $qty * $menu->hpp,
                ];
            })
            ->values()
            ->all();
    }
}
