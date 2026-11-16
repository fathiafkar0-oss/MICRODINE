<?php

namespace App\Providers;

use App\Services\Gateways\MidtransPaymentGateway;
use App\Services\Gateways\PaymentGatewayInterface;
use App\Services\Gateways\SimulatedPaymentGateway;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * Driver gateway dipilih lewat `PAYMENT_GATEWAY_DRIVER` di .env.
     * Default `simulated` agar demo tetap berjalan tanpa akses internet
     * (ARCHITECTURE.md Bab 8.2).
     */
    public function register(): void
    {
        $this->app->bind(PaymentGatewayInterface::class, function () {
            if (config('services.midtrans.driver') === 'midtrans') {
                return new MidtransPaymentGateway(
                    serverKey: (string) config('services.midtrans.server_key'),
                    merchantId: (string) config('services.midtrans.merchant_id'),
                );
            }

            return new SimulatedPaymentGateway;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Modul G (Real-Time): otorisasi private channel (lihat
        // routes/channels.php) diakses Laravel Echo lewat POST ke
        // `/broadcasting/auth`, dikunci sesi staf yang sedang login.
        Broadcast::routes(['middleware' => ['web', 'auth']]);
    }
}
