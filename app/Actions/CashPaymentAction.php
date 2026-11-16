<?php

namespace App\Actions;

use App\Models\Order;
use App\Services\PaymentService;
use Illuminate\Validation\ValidationException;

/**
 * ACT-03 — Penerimaan Pembayaran Tunai di Kasir.
 */
class CashPaymentAction
{
    public function __construct(private readonly PaymentService $payments) {}

    /**
     * @return array{order: Order, change_due: int, already_paid: bool}
     */
    public function execute(Order $order, int $cashReceived, int $cashierId): array
    {
        if ($cashReceived < $order->total) {
            throw ValidationException::withMessages([
                'cash_received' => 'Uang tunai yang diterima kurang dari total tagihan.',
            ]);
        }

        $result = $this->payments->markPaid(
            $order,
            [
                'provider' => 'cash',
                'provider_ref' => null,
                'amount' => $cashReceived,
                'signature_valid' => true, // tunai diverifikasi langsung oleh kasir, bukan tanda tangan kriptografis
                'raw_payload' => ['cash_received' => $cashReceived],
                'idempotency_key' => $this->payments->cashIdempotencyKey($order),
                'expires_at' => now(),
            ],
            actorType: 'kasir',
            actorId: $cashierId,
        );

        return [
            'order' => $result['order'],
            'change_due' => $cashReceived - $result['order']->total,
            'already_paid' => $result['already_paid'],
        ];
    }
}
