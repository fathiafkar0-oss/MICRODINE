<?php

namespace App\Services\Gateways;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Kontrak abstraksi payment gateway (ARCHITECTURE.md Bab 8.1).
 * Memungkinkan driver simulasi (demo offline) dan Midtrans (sandbox QRIS)
 * dipakai secara bergantian lewat `config('services.payment.driver')`.
 */
interface PaymentGatewayInterface
{
    /**
     * @return array{qr_string: string, qr_image_url: ?string, expires_at: Carbon}
     */
    public function generateQris(Order $order): array;

    /**
     * Verifikasi tanda tangan kriptografis webhook masuk.
     */
    public function verifyWebhook(Request $request): bool;

    /**
     * @return array{order_code: string, status: string, amount: int, status_code: string, reference: ?string, raw: array<string, mixed>}
     */
    public function parseWebhookPayload(Request $request): array;

    public function cancelPayment(Order $order): bool;
}
