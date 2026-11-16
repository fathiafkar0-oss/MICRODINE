<?php

namespace App\Actions;

use App\Enums\OrderSource;
use App\Enums\PaymentMethod;
use App\Models\DiningTable;
use App\Models\Order;
use App\Services\PaymentService;
use Illuminate\Support\Facades\DB;

/**
 * ACT-02 — Input Pesanan Manual oleh Kasir (Hardware Barcode Scanner).
 *
 * Pesanan manual langsung berstatus `paid`: jika tunai, dilunaskan seketika
 * dengan uang yang diterima; jika QRIS, tiket dibuat `pending` lalu kasir
 * mengarahkan pelanggan ke alur pembayaran QRIS seperti biasa (di luar aksi
 * ini — lihat CheckoutController::paymentView).
 */
class ManualOrderAction
{
    public function __construct(
        private readonly CreateOrderAction $createOrder,
        private readonly CashPaymentAction $cashPayment,
        private readonly PaymentService $payments,
    ) {}

    /**
     * @param  array<int, array{menu_id: int, quantity: int, notes: ?string}>  $items
     * @return array{order: Order, change_due: int}
     */
    public function execute(DiningTable $table, string $customerName, PaymentMethod $method, array $items, int $cashierId, ?int $cashReceived = null): array
    {
        return DB::transaction(function () use ($table, $customerName, $method, $items, $cashierId, $cashReceived) {
            $order = $this->createOrder->execute($table, $customerName, $method->value, $items, OrderSource::Manual);

            if ($method === PaymentMethod::Cash) {
                $result = $this->cashPayment->execute($order, $cashReceived ?? $order->total, $cashierId);

                return ['order' => $result['order'], 'change_due' => $result['change_due']];
            }

            return ['order' => $order, 'change_due' => 0];
        });
    }
}
