<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Meja fisik dengan token QR dan kode barcode.
 * Lihat ARCHITECTURE.md Bab 3.2 (Tabel 5).
 */
#[Fillable(['number', 'capacity', 'area', 'qr_token', 'barcode_code', 'is_active'])]
class DiningTable extends Model
{
    use HasFactory;

    /**
     * Default yang sama dengan kolom database.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'capacity' => 4,
        'area' => 'Area Dalam',
        'is_active' => true,
    ];

    /**
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<TableSession, $this>
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(TableSession::class);
    }

    /**
     * @return HasOne<TableSession, $this>
     */
    public function activeSession(): HasOne
    {
        return $this->hasOne(TableSession::class)->where('status', 'active');
    }

    /**
     * @param  Builder<DiningTable>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /**
     * Status tampilan untuk grid kasir.
     */
    public function displayStatus(): string
    {
        return $this->activeSession ? 'terisi' : 'tersedia';
    }
}
