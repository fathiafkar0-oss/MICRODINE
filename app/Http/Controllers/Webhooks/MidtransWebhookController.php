<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Gateways\PaymentGatewayInterface;
use App\Services\PaymentService;
use App\Support\CodeGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Modul F — Webhook & Integrasi Gateway Eksternal.
 * Route: POST /api/v1/payments/midtrans/webhook, POST /api/v1/payments/simulate/{orderCode}
 *
 * API_CONTRACT.md Bab 5.1: verifikasi tanda tangan SHA-512 + idempotensi +
 * amount guard. AGENTS.md invarian #8.
 */
class MidtransWebhookController extends Controller
{
    public function __construct(
        private readonly PaymentGatewayInterface $gateway,
        private readonly PaymentService $payments,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        if (! $this->gateway->verifyWebhook($request)) {
            abort(403, 'Invalid Midtrans signature.');
        }

        $payload = $this->gateway->parseWebhookPayload($request);

        $order = Order::query()
            ->where(function ($q) use ($payload) {
                $q->where('daily_queue_number', $payload['order_code'])
                    ->orWhere('order_code', $payload['order_code']);
            })
            ->whereDate('created_at', now()->toDateString())
            ->latest('id')
            ->first()
            ?? Order::query()
                ->where(function ($q) use ($payload) {
                    $q->where('daily_queue_number', $payload['order_code'])
                        ->orWhere('order_code', $payload['order_code']);
                })
                ->latest('id')
                ->first();

        if ($order === null) {
            // Order tidak ditemukan: tetap balas 200 agar Midtrans tidak retry
            // terus-menerus untuk order_id yang memang tidak valid di sisi kita.
            return response()->json(['status' => 'ok']);
        }

        if (! in_array($payload['status'], ['settlement', 'capture'], true)) {
            // Status selain pelunasan (pending/deny/expire/cancel) tidak memicu
            // transisi `paid`; dicatat lewat payments table untuk audit terpisah
            // bisa ditambahkan di iterasi berikutnya bila diperlukan.
            return response()->json(['status' => 'ok']);
        }

        if (! $this->payments->amountMatches($order, $payload['amount'])) {
            // Amount guard (API_CONTRACT.md Bab 5.1 §3): nilai tidak cocok,
            // tandai gagal & jangan lunaskan — potensi indikasi fraud.
            abort(403, 'Payment amount mismatch.');
        }

        $this->payments->markPaid(
            $order,
            [
                'provider' => 'midtrans',
                'provider_ref' => $payload['reference'],
                'amount' => $payload['amount'],
                'signature_valid' => true,
                'raw_payload' => $payload['raw'],
                'idempotency_key' => CodeGenerator::midtransIdempotencyKey($order->order_code, $payload['status_code']),
                'expires_at' => now(),
            ],
            actorType: 'gateway',
        );

        return response()->json(['status' => 'ok']);
    }

    /**
     * ARCHITECTURE.md Bab 8.2 — endpoint "tombol dev" hanya aktif di
     * `APP_ENV=local`, untuk mensimulasikan pelunasan QRIS saat demo
     * berlangsung tanpa koneksi internet ke sandbox Midtrans yang nyata.
     */
    public function simulate(Request $request, string $orderCode): JsonResponse
    {
        if (! app()->environment('local')) {
            abort(404);
        }

        $order = Order::query()
            ->where(function ($q) use ($orderCode) {
                $q->where('daily_queue_number', $orderCode)
                    ->orWhere('order_code', $orderCode);
            })
            ->whereDate('created_at', now()->toDateString())
            ->latest('id')
            ->first()
            ?? Order::query()
                ->where(function ($q) use ($orderCode) {
                    $q->where('daily_queue_number', $orderCode)
                        ->orWhere('order_code', $orderCode);
                })
                ->latest('id')
                ->first();

        if ($order === null) {
            throw new NotFoundHttpException('Pesanan tidak ditemukan.');
        }

        $result = $this->payments->markPaid(
            $order,
            [
                'provider' => 'midtrans',
                'provider_ref' => 'SIMULASI-'.Carbon::now()->timestamp,
                'amount' => $order->total,
                'signature_valid' => true,
                'raw_payload' => ['simulated' => true],
                'idempotency_key' => CodeGenerator::midtransIdempotencyKey($order->order_code, 'SIMULATE'),
                'expires_at' => now(),
            ],
            actorType: 'system',
        );

        return response()->json(['status' => 'ok', 'order_code' => $result['order']->daily_queue_number]);
    }
}
