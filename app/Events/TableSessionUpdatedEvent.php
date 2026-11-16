<?php

namespace App\Events;

use App\Models\TableSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Dipancarkan saat sesi meja dibuka, bergabung, atau ditutup, agar Grid Meja
 * kasir (hijau/merah) ikut berubah tanpa reload. ACT-07.
 */
class TableSessionUpdatedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public TableSession $session) {}

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('cashier.tables'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'table-session.updated';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $session = $this->session;

        return [
            'session_id' => $session->id,
            'table_id' => $session->dining_table_id,
            'table_number' => $session->diningTable->number,
            'status' => $session->status->value,
            'closed_at' => $session->closed_at?->toIso8601String(),
        ];
    }
}
