<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\RestaurantSetting;
use App\Services\Gateways\PaymentGatewayInterface;
use App\Support\OrderPresenter;
use App\Support\RestaurantPresenter;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Modul E — Menunggu Pembayaran & Pelacak Status Pesanan.
 * Route: GET /pesanan/{code}/bayar, GET /pesanan/{code}
 */
class OrderStatusController extends Controller
{
    public function __construct(private readonly PaymentGatewayInterface $gateway) {}

    public function paymentView(string $code): Response|RedirectResponse
    {
        $order = $this->findByCode($code);

        if ($order->isPaid()) {
            return redirect()->route('customer.status', ['code' => $code]);
        }

        $restaurant = RestaurantSetting::current();
        $qris = $order->payment_method->value === 'qris' ? $this->gateway->generateQris($order) : null;

        return Inertia::render('Customer/Payment/Index', [
            'code' => $code,
            'order' => [
                ...OrderPresenter::toArray($order),
                'qrisString' => $qris['qr_string'] ?? null,
                'qrisExpiresAt' => $qris['expires_at']?->toIso8601String() ?? now()->addMinutes($restaurant->qris_expires_minutes)->toIso8601String(),
                // Hooks/useCountdown.js melakukan aritmetika numerik langsung pada
                // nilai ini (`order.createdAt + menit*60000`), jadi HARUS berupa
                // timestamp milidetik (number), bukan string ISO-8601.
                'createdAt' => $order->created_at->getTimestampMs(),
            ],
            'restaurant' => RestaurantPresenter::toArray($restaurant),
        ]);
    }

    public function show(string $code): Response
    {
        $order = $this->findByCode($code);

        return Inertia::render('Customer/Order/Status', [
            'code' => $code,
            'order' => OrderPresenter::toArray($order),
            'sessionOrders' => OrderPresenter::sessionOrders($order),
            'restaurant' => RestaurantPresenter::toArray(RestaurantSetting::current()),
        ]);
    }

    private function findByCode(string $code): Order
    {
        $order = Order::query()
            ->whereDate('created_at', now()->toDateString())
            ->where('daily_queue_number', $code)
            ->with(['items', 'tableSession.diningTable', 'tableSession.orders'])
            ->latest('id')
            ->first()
            ?? Order::query()
                ->where('daily_queue_number', $code)
                ->with(['items', 'tableSession.diningTable', 'tableSession.orders'])
                ->latest('id')
                ->first();

        if ($order === null) {
            throw new NotFoundHttpException('Pesanan tidak ditemukan.');
        }

        return $order;
    }
}
