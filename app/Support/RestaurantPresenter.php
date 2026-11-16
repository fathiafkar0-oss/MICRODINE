<?php

namespace App\Support;

use App\Models\RestaurantSetting;

/**
 * Bentuk props `restaurant` dipakai di hampir semua halaman — lihat
 * resources/js/Data/mock/restaurant.js & Hooks/useCurrency.js untuk kontrak
 * persisnya (taxRate desimal, bukan persen, karena dipakai langsung sebagai
 * pengganda `subtotal * taxRate`).
 */
class RestaurantPresenter
{
    /**
     * @return array{name: string, address: ?string, phone: ?string, taxEnabled: bool, taxLabel: string, taxRate: float, paymentDeadlineMinutes: int, sessionTimeoutMinutes: int}
     */
    public static function toArray(RestaurantSetting $settings): array
    {
        return [
            'name' => $settings->restaurant_name,
            'address' => $settings->address,
            'phone' => $settings->phone,
            'taxEnabled' => $settings->tax_enabled,
            'taxLabel' => 'Pajak PB1',
            'taxRate' => $settings->tax_enabled ? $settings->tax_rate_percent / 100 : 0.0,
            'taxRatePercent' => $settings->tax_rate_percent,
            'paymentDeadlineMinutes' => $settings->qris_expires_minutes,
            // Belum ada kolom DB khusus; dipakai frontend hanya untuk hint UI kedaluwarsa sesi.
            'sessionTimeoutMinutes' => 30,
        ];
    }
}
