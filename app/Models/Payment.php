<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Catatan pembayaran (QRIS gateway atau tunai kasir).
 */
#[Fillable([
    'order_id',
    'provider',
    'provider_ref',
    'amount',
    'status',
    'signature_valid',
    'raw_payload',
    'idempotency_key',
    'expires_at',
])]
class Payment extends Model
{
    /**
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'status' => PaymentStatus::class,
            'signature_valid' => 'boolean',
            'raw_payload' => 'array',
            'expires_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
