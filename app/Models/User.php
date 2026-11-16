<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * Staf MICRODINE. Login memakai `username` (bukan email).
 */
#[Fillable(['name', 'username', 'password', 'role', 'is_active'])]
#[Hidden(['password'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Default yang sama dengan kolom database.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'is_active' => true,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'role' => UserRole::class,
            'is_active' => 'boolean',
            'password' => 'hashed',
        ];
    }

    /**
     * Sesi meja yang ditutup oleh staf ini.
     *
     * @return HasMany<TableSession, $this>
     */
    public function closedTableSessions(): HasMany
    {
        return $this->hasMany(TableSession::class, 'closed_by');
    }

    /**
     * @return HasMany<OrderStatusLog, $this>
     */
    public function orderStatusLogs(): HasMany
    {
        return $this->hasMany(OrderStatusLog::class, 'actor_id');
    }

    /**
     * @return HasMany<SalesTarget, $this>
     */
    public function salesTargets(): HasMany
    {
        return $this->hasMany(SalesTarget::class, 'created_by');
    }

    public function hasRole(UserRole|string $role): bool
    {
        $value = $role instanceof UserRole ? $role->value : $role;

        return $this->role->value === $value;
    }

    public function isActive(): bool
    {
        return $this->is_active;
    }
}
