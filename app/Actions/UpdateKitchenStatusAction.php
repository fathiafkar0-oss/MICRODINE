<?php

namespace App\Actions;

use App\Enums\KitchenStatus;
use App\Enums\PaymentStatus;
use App\Events\KitchenStatusUpdatedEvent;
use App\Models\Order;
use App\Models\OrderStatusLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * ACT-04 (dapur: queued->cooking->done) & ACT-05 (kasir/pelayan: done->served).
 * Tiket HANYA boleh terlihat/berubah statusnya bila `payment_status = paid`
 * (AGENTS.md invarian #1).
 */
class UpdateKitchenStatusAction
{
    public function execute(Order $order, KitchenStatus $to, string $actorType, int $actorId): Order
    {
        return DB::transaction(function () use ($order, $to, $actorType, $actorId) {
            /** @var Order $locked */
            $locked = Order::query()->where('id', $order->id)->lockForUpdate()->firstOrFail();

            if ($locked->payment_status !== PaymentStatus::Paid) {
                throw ValidationException::withMessages([
                    'payment_status' => 'Pesanan belum lunas tidak dapat masuk antrean dapur.',
                ]);
            }

            $from = $locked->kitchen_status;

            $allowed = match ($from) {
                KitchenStatus::Queued => in_array($to, [KitchenStatus::Cooking, KitchenStatus::Done], true),
                KitchenStatus::Cooking => $to === KitchenStatus::Done,
                KitchenStatus::Done => $to === KitchenStatus::Served,
                KitchenStatus::Served => false,
            };

            if (! $allowed) {
                throw ValidationException::withMessages([
                    'status' => "Tidak dapat mengubah status dari {$from->value} ke {$to->value}.",
                ]);
            }

            $locked->update(['kitchen_status' => $to->value]);

            OrderStatusLog::query()->create([
                'order_id' => $locked->id,
                'actor_type' => $actorType,
                'actor_id' => $actorId,
                'from_status' => $from->value,
                'to_status' => $to->value,
                'notes' => null,
                'created_at' => now(),
            ]);

            $locked->refresh()->load(['tableSession.diningTable']);

            DB::afterCommit(function () use ($locked) {
                KitchenStatusUpdatedEvent::dispatch($locked);
            });

            return $locked;
        });
    }
}
