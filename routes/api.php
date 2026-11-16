<?php

use App\Http\Controllers\SyncController;
use App\Http\Controllers\Webhooks\MidtransWebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rute API MICRODINE (Modul F & G)
|--------------------------------------------------------------------------
|
| Grup 'api' Laravel 13 default-nya stateless (tanpa sesi/CSRF), jadi webhook
| gateway tidak perlu dikecualikan secara eksplisit dari CSRF di sini.
| Lihat ARCHITECTURE.md Bab 7 & API_CONTRACT.md Bab 5.
|
*/

// 1. Webhook pembayaran Midtrans (QRIS) — dipanggil oleh server Midtrans, bukan browser.
Route::post('/v1/payments/midtrans/webhook', [MidtransWebhookController::class, 'handle'])
    ->name('payments.midtrans.webhook');

// 2. Simulasi demo offline — hanya aktif di lingkungan lokal (dicek di controller).
Route::post('/v1/payments/simulate/{orderCode}', [MidtransWebhookController::class, 'simulate'])
    ->where('orderCode', '[A-Z]-[0-9]{3}')
    ->middleware('throttle:30,1')
    ->name('payments.simulate');

// 3. Fallback polling jika koneksi WebSocket klien terputus (ARCHITECTURE.md Bab 6.3).
Route::get('/v1/sync', [SyncController::class, 'show'])
    ->middleware('throttle:60,1')
    ->name('sync');
