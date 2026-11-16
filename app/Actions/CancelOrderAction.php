<?php

namespace App\Actions;

use App\Enums\PaymentStatus;
use App\Events\OrderCancelledEvent;
use App\Models\Order;
use App\Models\OrderStatusLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * ACT-06 — Pembatalan Pesanan Belum Bayar oleh Kasir.
 * Pesanan yang sudah `paid` DILARANG KERAS dibatalkan lewat aksi ini.
 */
class CancelOrderAction
{
    public function execute(Order $order, string $reason, int $cashierId): Order
    {
        return DB::transaction(function () use ($order, $reason, $cashierId) {
            /** @var Order $locked */
            $locked = Order::query()->where('id', $order->id)->lockForUpdate()->firstOrFail();

            if ($locked->payment_status !== PaymentStatus::Pending) {
                throw ValidationException::withMessages([
                    'payment_status' => 'Hanya pesanan yang belum dibayar yang dapat dibatalkan.',
                ]);
            }

            $locked->update([
                'payment_status' => PaymentStatus::Cancelled->value,
                'cancelled_at' => now(),
            ]);

            OrderStatusLog::query()->create([
                'order_id' => $locked->id,
                'actor_type' => 'kasir',
                'actor_id' => $cashierId,
                'from_status' => PaymentStatus::Pending->value,
                'to_status' => PaymentStatus::Cancelled->value,
                'notes' => $reason,
                'created_at' => now(),
            ]);

            $locked->refresh()->load(['tableSession.diningTable']);

            DB::afterCommit(function () use ($locked) {
                OrderCancelledEvent::dispatch($locked);
            });

            return $locked;
        });
    }
}
