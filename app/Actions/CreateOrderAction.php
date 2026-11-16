<?php

namespace App\Actions;

use App\Enums\OrderSource;
use App\Models\DiningTable;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderStatusLog;
use App\Models\RestaurantSetting;
use App\Services\OrderPricingService;
use App\Services\TableSessionService;
use App\Support\CodeGenerator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * ACT-01 — Pembuatan Pesanan Mandiri Pelanggan.
 *
 * Mengunci sesi meja (Modul D), lalu membuat tiket pesanan dengan SNAPSHOT
 * harga & HPP (AGENTS.md invarian #2): harga/HPP selalu diambil ulang dari
 * database di sini, TIDAK PERNAH dipercaya dari payload browser
 * (API_CONTRACT.md Bab 3.1 "price/HPP re-fetched from DB, never trusted
 * from the browser").
 */
class CreateOrderAction
{
    public function __construct(
        private readonly TableSessionService $sessions,
        private readonly OrderPricingService $pricing,
    ) {}

    /**
     * @param  array<int, array{menu_id: int, quantity: int, notes: ?string}>  $items
     */
    public function execute(DiningTable $table, string $customerName, string $paymentMethod, array $items, OrderSource $source = OrderSource::Qr): Order
    {
        return DB::transaction(function () use ($table, $customerName, $paymentMethod, $items, $source) {
            $session = $this->sessions->openOrJoin($table)['session'];
            $settings = RestaurantSetting::current();

            $menuIds = array_column($items, 'menu_id');
            $menus = MenuItem::query()->whereIn('id', $menuIds)->lockForUpdate()->get()->keyBy('id');

            $lines = [];
            foreach ($items as $item) {
                /** @var MenuItem|null $menu */
                $menu = $menus->get($item['menu_id']);

                if ($menu === null || ! $menu->is_available) {
                    throw ValidationException::withMessages([
                        'items' => 'Menu '.($menu->name ?? '').' sedang habis.',
                    ]);
                }

                $lines[] = [
                    'menu_item_id' => $menu->id,
                    'name_snapshot' => $menu->name,
                    'qty' => $item['quantity'],
                    'notes' => $item['notes'] ?? null,
                    'unit_price_snapshot' => $menu->price,
                    'unit_hpp_snapshot' => $menu->hpp,
                ];
            }

            $totals = $this->pricing->totals($lines, $settings);

            $order = Order::query()->create([
                'order_code' => CodeGenerator::orderCode(),
                'daily_queue_number' => CodeGenerator::dailyQueueNumber(),
                'table_session_id' => $session->id,
                'customer_name' => $customerName,
                'source' => $source->value,
                'payment_method' => $paymentMethod,
                'payment_status' => 'pending',
                'kitchen_status' => 'queued',
                'subtotal' => $totals['subtotal'],
                'tax_amount' => $totals['tax_amount'],
                'total' => $totals['total'],
            ]);

            foreach ($lines as $line) {
                $order->items()->create([
                    ...$line,
                    'subtotal_price' => $line['unit_price_snapshot'] * $line['qty'],
                    'subtotal_hpp' => $line['unit_hpp_snapshot'] * $line['qty'],
                ]);
            }

            OrderStatusLog::query()->create([
                'order_id' => $order->id,
                'actor_type' => $source === OrderSource::Qr ? 'customer' : 'kasir',
                'actor_id' => null,
                'from_status' => '-',
                'to_status' => 'pending',
                'notes' => 'Pesanan dibuat.',
                'created_at' => now(),
            ]);

            return $order->refresh();
        });
    }
}
