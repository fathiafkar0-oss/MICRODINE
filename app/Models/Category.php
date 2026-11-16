<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Kategori menu (Makanan, Minuman, Camilan, ...).
 */
#[Fillable(['name', 'slug', 'display_order'])]
class Category extends Model
{
    use HasFactory;

    /**
     * Default yang sama dengan kolom database.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'display_order' => 0,
    ];

    /**
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
        ];
    }

    /**
     * @return HasMany<MenuItem, $this>
     */
    public function menuItems(): HasMany
    {
        return $this->hasMany(MenuItem::class);
    }

    /**
     * @param  Builder<Category>  $query
     */
    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('display_order')->orderBy('name');
    }
}
