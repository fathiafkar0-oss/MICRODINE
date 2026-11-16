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
 * Dipancarkan saat dapur mengubah progres masakan (queued -> cooking -> done)
 * atau kasir menandai "diantar" (done -> served). ACT-04 & ACT-05.
 */
class KitchenStatusUpdatedEvent implements ShouldBroadcastNow
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
        return 'order.kitchen-status-updated';
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
            'table_number' => $order->tableSession->diningTable->number,
            'kitchen_status' => $order->kitchen_status->value,
            'frontend_status' => $order->frontendStatus(),
        ];
    }
}
