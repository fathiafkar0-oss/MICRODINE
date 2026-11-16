<?php

namespace App\Services;

use App\Models\RestaurantSetting;

/**
 * Kalkulasi finansial pesanan (issue.md Bab 4.3 / AGENTS.md invarian #3 & #7).
 * Semua nominal integer Rupiah; pembulatan pajak selalu ke bawah agar total
 * tidak pernah melebihi jumlah yang disetujui pelanggan.
 */
class OrderPricingService
{
    /**
     * @param  array<int, array{unit_price_snapshot: int, qty: int}>  $lines
     * @return array{subtotal: int, tax_amount: int, total: int}
     */
    public function totals(array $lines, RestaurantSetting $settings): array
    {
        $subtotal = 0;
        foreach ($lines as $line) {
            $subtotal += $line['unit_price_snapshot'] * $line['qty'];
        }

        $taxAmount = $settings->tax_enabled
            ? (int) floor($subtotal * $settings->tax_rate_percent / 100)
            : 0;

        return [
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total' => $subtotal + $taxAmount,
        ];
    }
}
