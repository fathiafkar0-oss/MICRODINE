<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Rincian pesanan dengan SNAPSHOT harga & HPP saat transaksi dibuat.
 * Nilai snapshot bersifat immutable (lihat AGENTS.md invarian #2).
 */
#[Fillable([
    'order_id',
    'menu_item_id',
    'name_snapshot',
    'qty',
    'notes',
    'unit_price_snapshot',
    'unit_hpp_snapshot',
    'subtotal_price',
    'subtotal_hpp',
])]
class OrderItem extends Model
{
    /**
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'qty' => 'integer',
            'unit_price_snapshot' => 'integer',
            'unit_hpp_snapshot' => 'integer',
            'subtotal_price' => 'integer',
            'subtotal_hpp' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @return BelongsTo<MenuItem, $this>
     */
    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }

    /**
     * Laba kotor baris ini berdasarkan snapshot.
     */
    public function profit(): int
    {
        return $this->subtotal_price - $this->subtotal_hpp;
    }
}
