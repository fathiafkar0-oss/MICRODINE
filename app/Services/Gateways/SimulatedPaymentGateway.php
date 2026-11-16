<?php

namespace App\Services\Gateways;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Driver simulasi (ARCHITECTURE.md Bab 8.2) — dipakai default di lingkungan
 * demo/hackathon agar presentasi tidak bergantung pada koneksi internet atau
 * akun sandbox Midtrans yang nyata. Dipanggil lewat endpoint
 * `POST /api/v1/payments/simulate/{orderCode}` (hanya aktif di `APP_ENV=local`).
 */
class SimulatedPaymentGateway implements PaymentGatewayInterface
{
    public function generateQris(Order $order): array
    {
        $expiresAt = Carbon::now()->addMinutes($order->tableSession->diningTable->exists ? 15 : 15);

        // String EMVCo palsu namun berformat realistis, cukup untuk dirender jadi QR di frontend.
        $qrString = sprintf('00020101021226%02d0003IDM%s5204%s5802ID6304%s', strlen($order->order_code), $order->order_code, $order->total, 'SIM0');

        return [
            'qr_string' => $qrString,
            'qr_image_url' => null,
            'expires_at' => $expiresAt,
        ];
    }

    public function verifyWebhook(Request $request): bool
    {
        // Simulasi tidak memakai tanda tangan kriptografis; verifikasi selalu lolos
        // karena endpoint-nya sendiri hanya aktif di lingkungan lokal/demo.
        return true;
    }

    public function parseWebhookPayload(Request $request): array
    {
        return [
            'order_code' => (string) $request->input('order_code'),
            'status' => 'settlement',
            'amount' => (int) $request->input('amount', 0),
            'status_code' => '200',
            'reference' => 'SIMULASI-'.now()->timestamp,
            'raw' => $request->all(),
        ];
    }

    public function cancelPayment(Order $order): bool
    {
        return true;
    }
}
