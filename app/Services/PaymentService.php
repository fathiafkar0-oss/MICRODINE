<?php

namespace App\Services;

use App\Enums\KitchenStatus;
use App\Enums\PaymentStatus;
use App\Events\OrderPaidEvent;
use App\Models\Order;
use App\Models\OrderStatusLog;
use App\Models\Payment;
use App\Support\CodeGenerator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Modul F — Pay-First & Snapshot.
 *
 * Satu-satunya tempat yang boleh mengubah `payment_status` pesanan menjadi
 * `paid`. Dibungkus transaksi + `SELECT ... FOR UPDATE` + kunci idempotensi
 * unik pada `payments.idempotency_key`, sehingga webhook yang terkirim dua
 * kali (hal lazim pada Midtrans) atau race condition dua kasir yang
 * menekan "Terima Tunai" bersamaan tidak pernah menghasilkan pelunasan ganda.
 *
 * AGENTS.md invarian #5: event broadcast dipicu HANYA setelah commit transaksi.
 */
class PaymentService
{
    /**
     * Tandai pesanan lunas lewat webhook gateway (QRIS) atau konfirmasi tunai.
     *
     * @param  array{provider: string, provider_ref: ?string, amount: int, signature_valid: bool, raw_payload: array<string, mixed>, idempotency_key: string, expires_at: Carbon}  $paymentData
     * @return array{order: Order, already_paid: bool}
     */
    public function markPaid(Order $order, array $paymentData, string $actorType, ?int $actorId = null): array
    {
        return DB::transaction(function () use ($order, $paymentData, $actorType, $actorId) {
            /** @var Order $locked */
            $locked = Order::query()->where('id', $order->id)->lockForUpdate()->firstOrFail();

            // Idempotensi: kunci unik `idempotency_key` pada tabel payments adalah
            // garis pertahanan terakhir di tingkat database (constraint unik),
            // tetapi kita cek dulu di sini supaya tidak melempar exception duplikat
            // saat webhook yang sama terkirim berkali-kali oleh gateway.
            $existingPayment = Payment::query()->where('idempotency_key', $paymentData['idempotency_key'])->first();

            if ($existingPayment !== null || $locked->payment_status === PaymentStatus::Paid) {
                // Pesanan sudah lunas sebelumnya: kembalikan 200 OK tanpa memicu
                // event ulang (API_CONTRACT.md Bab 5.1 §Penanganan Idempotensi).
                return ['order' => $locked, 'already_paid' => true];
            }

            // Status paid bersifat terminal; status final lain tidak boleh dilunaskan lagi.
            if ($locked->payment_status->isFinal()) {
                return ['order' => $locked, 'already_paid' => true];
            }

            Payment::query()->create([
                'order_id' => $locked->id,
                'provider' => $paymentData['provider'],
                'provider_ref' => $paymentData['provider_ref'],
                'amount' => $paymentData['amount'],
                'status' => PaymentStatus::Paid->value,
                'signature_valid' => $paymentData['signature_valid'],
                'raw_payload' => $paymentData['raw_payload'],
                'idempotency_key' => $paymentData['idempotency_key'],
                'expires_at' => $paymentData['expires_at'],
            ]);

            $fromStatus = $locked->payment_status->value;

            $locked->update([
                'payment_status' => PaymentStatus::Paid->value,
                'kitchen_status' => KitchenStatus::Queued->value,
                'paid_at' => now(),
            ]);

            OrderStatusLog::query()->create([
                'order_id' => $locked->id,
                'actor_type' => $actorType,
                'actor_id' => $actorId,
                'from_status' => $fromStatus,
                'to_status' => PaymentStatus::Paid->value,
                'notes' => "Pelunasan via {$paymentData['provider']}.",
                'created_at' => now(),
            ]);

            $locked->refresh()->load(['tableSession.diningTable', 'items']);

            DB::afterCommit(function () use ($locked) {
                OrderPaidEvent::dispatch($locked);
            });

            return ['order' => $locked, 'already_paid' => false];
        });
    }

    /**
     * Guard nilai transaksi (*amount guard*, API_CONTRACT.md Bab 5.1 §3):
     * nilai dari gateway harus sama persis dengan total tagihan.
     */
    public function amountMatches(Order $order, int $gatewayAmount): bool
    {
        return $gatewayAmount === $order->total;
    }

    public function cashIdempotencyKey(Order $order): string
    {
        return CodeGenerator::cashIdempotencyKey($order->order_code);
    }
}
