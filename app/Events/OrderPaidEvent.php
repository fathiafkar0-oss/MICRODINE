<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Dipancarkan sesaat setelah pesanan lunas (tunai atau webhook QRIS tervalidasi).
 * Lihat ARCHITECTURE.md Bab 6.2 & API_CONTRACT.md Bab 6.2.A.
 *
 * ShouldBroadcastNow (bukan ShouldBroadcast) = tanpa antrean tunda, sesuai
 * AGENTS.md invarian #5: siaran terjadi seketika setelah commit transaksi.
 */
class OrderPaidEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order) {}

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('cashier.orders'),
            new PrivateChannel('kitchen.kds'),
            new Channel('order.'.$this->order->daily_queue_number),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order.paid';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $order = $this->order;

        return [
            'order_id' => $order->id,
            'order_code' => $order->order_code,
            'daily_queue_number' => $order->daily_queue_number,
            'table_number' => $order->tableSession->diningTable->number,
            'customer_name' => $order->customer_name,
            'payment_status' => $order->payment_status->value,
            'kitchen_status' => $order->kitchen_status->value,
            'total' => $order->total,
            'items' => $order->items->map(fn ($item) => [
                'name' => $item->name_snapshot,
                'qty' => $item->qty,
                'notes' => $item->notes,
            ]),
            'paid_at' => $order->paid_at?->toIso8601String(),
        ];
    }
}
