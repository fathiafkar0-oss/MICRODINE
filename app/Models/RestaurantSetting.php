<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * Baris tunggal (singleton) konfigurasi restoran.
 * Lihat ARCHITECTURE.md Bab 3.2 (Tabel 2).
 */
#[Fillable(['restaurant_name', 'address', 'phone', 'tax_enabled', 'tax_rate_percent', 'qris_expires_minutes'])]
class RestaurantSetting extends Model
{
    /**
     * Default yang sama dengan kolom database.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'tax_enabled' => true,
        'tax_rate_percent' => 10,
        'qris_expires_minutes' => 15,
    ];

    /**
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tax_enabled' => 'boolean',
            'tax_rate_percent' => 'integer',
            'qris_expires_minutes' => 'integer',
        ];
    }

    /**
     * Ambil konfigurasi aktif; dibuat default bila belum ada.
     */
    public static function current(): self
    {
        return static::query()->firstOrCreate([], [
            'restaurant_name' => 'MICRODINE',
            'tax_enabled' => true,
            'tax_rate_percent' => 10,
            'qris_expires_minutes' => 15,
        ]);
    }

    /**
     * Tarif pajak efektif (0 bila pajak dimatikan).
     */
    public function taxRate(): float
    {
        return $this->tax_enabled ? $this->tax_rate_percent / 100 : 0.0;
    }
}
