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
 * Dipancarkan saat kasir membatalkan pesanan yang belum dibayar (ACT-06),
 * atau sistem menandainya kedaluwarsa setelah batas waktu QRIS habis.
 */
class OrderCancelledEvent implements ShouldBroadcastNow
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
            new Channel('order.'.$this->order->daily_queue_number),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order.cancelled';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $order = $this->order;

        return [
            'order_id' => $order->id,
            'daily_queue_number' => $order->daily_queue_number,
            'payment_status' => $order->payment_status->value,
            'frontend_status' => $order->frontendStatus(),
        ];
    }
}
