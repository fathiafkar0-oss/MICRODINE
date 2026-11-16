<?php

namespace App\Models;

use App\Enums\TableSessionStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Sesi meja. Satu meja hanya boleh punya satu sesi `active`
 * (dijamin partial unique index di database).
 */
#[Fillable(['dining_table_id', 'status', 'opened_at', 'closed_at', 'closed_by'])]
class TableSession extends Model
{
    /**
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => TableSessionStatus::class,
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<DiningTable, $this>
     */
    public function diningTable(): BelongsTo
    {
        return $this->belongsTo(DiningTable::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function closedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    /**
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * @param  Builder<TableSession>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('status', TableSessionStatus::Active->value);
    }

    public function isActive(): bool
    {
        return $this->status === TableSessionStatus::Active;
    }
}
