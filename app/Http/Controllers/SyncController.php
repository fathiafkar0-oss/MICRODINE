<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Modul G — Fallback sinkronisasi polling (ARCHITECTURE.md Bab 6.3,
 * API_CONTRACT.md Bab 5.3). Dipakai frontend saat koneksi WebSocket Reverb
 * terputus > 5 detik, lewat `router.reload({ only: [...] })` setiap 5 detik.
 * Route: GET /api/v1/sync?role=kasir|dapur&order_code=A-024
 */
class SyncController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $role = $request->query('role');
        $orderCode = $request->query('order_code');

        $data = match (true) {
            $orderCode !== null => $this->orderSnapshot((string) $orderCode),
            $role === 'kasir' => $this->cashierSnapshot(),
            $role === 'dapur' => $this->kitchenSnapshot(),
            default => [],
        };

        return response()->json([
            'server_time' => now()->toIso8601String(),
            'active_orders_hash' => hash('sha256', json_encode($data)),
            'data' => $data,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function cashierSnapshot(): array
    {
        return [
            'orders' => Order::query()
                ->whereDate('created_at', now()->toDateString())
                ->whereNotIn('payment_status', ['cancelled', 'expired', 'failed'])
                ->get(['id', 'daily_queue_number', 'payment_status', 'kitchen_status'])
                ->map(fn (Order $order) => [
                    'code' => $order->daily_queue_number,
                    'paymentStatus' => $order->payment_status->value,
                    'kitchenStatus' => $order->kitchen_status->value,
                ]),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function kitchenSnapshot(): array
    {
        return [
            'orders' => Order::query()->kitchenQueue()->get(['id', 'daily_queue_number', 'kitchen_status'])
                ->map(fn (Order $order) => [
                    'code' => $order->daily_queue_number,
                    'kitchenStatus' => $order->kitchen_status->value,
                ]),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function orderSnapshot(string $code): array
    {
        $order = Order::query()
            ->where(function ($q) use ($code) {
                $q->where('daily_queue_number', $code)
                    ->orWhere('order_code', $code);
            })
            ->whereDate('created_at', now()->toDateString())
            ->latest('id')
            ->first(['id', 'daily_queue_number', 'payment_status', 'kitchen_status'])
            ?? Order::query()
                ->where(function ($q) use ($code) {
                    $q->where('daily_queue_number', $code)
                        ->orWhere('order_code', $code);
                })
                ->latest('id')
                ->first(['id', 'daily_queue_number', 'payment_status', 'kitchen_status']);

        if ($order === null) {
            return [];
        }

        return [
            'code' => $order->daily_queue_number,
            'paymentStatus' => $order->payment_status->value,
            'kitchenStatus' => $order->kitchen_status->value,
        ];
    }
}
