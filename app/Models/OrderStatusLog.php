<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Jejak audit mutasi status pesanan.
 */
#[Fillable(['order_id', 'actor_type', 'actor_id', 'from_status', 'to_status', 'notes', 'created_at'])]
class OrderStatusLog extends Model
{
    /**
     * Tabel ini hanya punya `created_at`, tanpa `updated_at`.
     */
    public const UPDATED_AT = null;

    /**
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
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
     * @return BelongsTo<User, $this>
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
