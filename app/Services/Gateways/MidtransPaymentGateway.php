<?php

namespace App\Services\Gateways;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Driver Midtrans QRIS (sandbox) — ARCHITECTURE.md Bab 8.1 & API_CONTRACT.md Bab 5.1.
 *
 * MVP ini belum memanggil API Snap/Core Midtrans secara nyata (butuh akses
 * internet ke sandbox yang tidak selalu tersedia saat demo), tetapi kontrak
 * verifikasi tanda tangan & parsing payload webhook sudah sepenuhnya nyata,
 * sehingga endpoint webhook bisa diuji dengan payload asli dari dashboard
 * Midtrans begitu kredensial sandbox tersedia.
 */
class MidtransPaymentGateway implements PaymentGatewayInterface
{
    public function __construct(
        private readonly string $serverKey = '',
        private readonly string $merchantId = '',
    ) {}

    public function generateQris(Order $order): array
    {
        // Placeholder lokal: integrasi Snap API Midtrans sungguhan diisi di sini
        // (POST ke https://api.sandbox.midtrans.com/v2/charge dengan payment_type=qris).
        $expiresAt = Carbon::now()->addMinutes($order->tableSession->diningTable->exists ? 15 : 15);

        return [
            'qr_string' => sprintf('00020101021226%02d0003IDM%s5204%s5802ID6304%s', strlen($order->order_code), $order->order_code, $order->total, 'MTR0'),
            'qr_image_url' => null,
            'expires_at' => $expiresAt,
        ];
    }

    /**
     * Verifikasi SHA-512 sesuai API_CONTRACT.md Bab 5.1 §Aturan Verifikasi Keamanan Webhook.
     */
    public function verifyWebhook(Request $request): bool
    {
        $orderId = (string) $request->input('order_id');
        $statusCode = (string) $request->input('status_code');
        $grossAmount = (string) $request->input('gross_amount');
        $signatureKey = (string) $request->input('signature_key');

        $expected = hash('sha512', $orderId.$statusCode.$grossAmount.$this->serverKey);

        return hash_equals($expected, $signatureKey);
    }

    public function parseWebhookPayload(Request $request): array
    {
        return [
            'order_code' => (string) $request->input('order_id'),
            'status' => (string) $request->input('transaction_status'),
            'amount' => (int) round((float) $request->input('gross_amount', 0)),
            'status_code' => (string) $request->input('status_code'),
            'reference' => $request->input('transaction_id'),
            'raw' => $request->all(),
        ];
    }

    public function cancelPayment(Order $order): bool
    {
        // Placeholder: POST ke /v2/{order_id}/cancel pada API Core Midtrans.
        return true;
    }
}
