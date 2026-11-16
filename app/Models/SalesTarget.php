<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Target penjualan bulanan (MVP+).
 */
#[Fillable(['month_year', 'target_amount', 'weekly_targets', 'created_by'])]
class SalesTarget extends Model
{
    /**
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'target_amount' => 'integer',
            'weekly_targets' => 'array',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
