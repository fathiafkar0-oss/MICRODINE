<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Master menu. `price` & `hpp` dalam integer Rupiah.
 * Lihat ARCHITECTURE.md Bab 3.2 (Tabel 4).
 */
#[Fillable(['category_id', 'name', 'description', 'price', 'hpp', 'image_path', 'is_available', 'show_in_catalog'])]
class MenuItem extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Default yang sama dengan kolom database.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'is_available' => true,
        'show_in_catalog' => true,
    ];

    /**
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'hpp' => 'integer',
            'is_available' => 'boolean',
            'show_in_catalog' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Margin kotor per porsi (harga jual - HPP).
     */
    public function marginRp(): int
    {
        return $this->price - $this->hpp;
    }

    /**
     * Persentase margin terhadap harga jual.
     */
    public function marginPercent(): float
    {
        return $this->price > 0 ? round($this->marginRp() / $this->price * 100, 1) : 0.0;
    }

    /**
     * @param  Builder<MenuItem>  $query
     */
    public function scopeAvailable(Builder $query): void
    {
        $query->where('is_available', true);
    }

    /**
     * @param  Builder<MenuItem>  $query
     */
    public function scopeInCatalog(Builder $query): void
    {
        $query->where('show_in_catalog', true);
    }
}
