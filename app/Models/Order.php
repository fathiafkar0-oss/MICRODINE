<?php

namespace App\Models;

use App\Enums\KitchenStatus;
use App\Enums\OrderSource;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Pesanan (transaksi). Lihat ARCHITECTURE.md Bab 3.2 (Tabel 7).
 */
#[Fillable([
    'order_code',
    'daily_queue_number',
    'table_session_id',
    'customer_name',
    'source',
    'payment_method',
    'payment_status',
    'kitchen_status',
    'subtotal',
    'tax_amount',
    'total',
    'paid_at',
    'cancelled_at',
])]
class Order extends Model
{
    use HasFactory;

    /**
     * Default yang sama dengan kolom database.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'payment_status' => 'pending',
        'kitchen_status' => 'queued',
        'tax_amount' => 0,
    ];

    /**
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'source' => OrderSource::class,
            'payment_method' => PaymentMethod::class,
            'payment_status' => PaymentStatus::class,
            'kitchen_status' => KitchenStatus::class,
            'subtotal' => 'integer',
            'tax_amount' => 'integer',
            'total' => 'integer',
            'paid_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<TableSession, $this>
     */
    public function tableSession(): BelongsTo
    {
        return $this->belongsTo(TableSession::class);
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * @return HasMany<OrderStatusLog, $this>
     */
    public function statusLogs(): HasMany
    {
        return $this->hasMany(OrderStatusLog::class);
    }

    public function isPaid(): bool
    {
        return $this->payment_status === PaymentStatus::Paid;
    }

    /**
     * Status yang dipakai frontend (resources/js/Utils/status.js).
     *
     * Frontend memakai satu kolom `status`, sedangkan database memisahkan
     * payment_status dan kitchen_status. Pemetaan ini satu-satunya tempat
     * konversi tersebut (lihat issue.md Bab 4.1).
     */
    public function frontendStatus(): string
    {
        if ($this->payment_status !== PaymentStatus::Paid) {
            return match ($this->payment_status) {
                PaymentStatus::Pending => 'menunggu_bayar',
                PaymentStatus::Failed => 'gagal',
                PaymentStatus::Cancelled => 'dibatalkan',
                PaymentStatus::Expired => 'kedaluwarsa',
                default => 'menunggu_bayar',
            };
        }

        return match ($this->kitchen_status) {
            KitchenStatus::Queued, KitchenStatus::Cooking => 'diproses',
            KitchenStatus::Done => 'selesai',
            KitchenStatus::Served => 'diantar',
            default => 'diproses',
        };
    }

    /**
     * @param  Builder<Order>  $query
     */
    public function scopePaid(Builder $query): void
    {
        $query->where('payment_status', PaymentStatus::Paid->value);
    }

    /**
     * Pesanan lunas yang masih berada di antrean dapur.
     *
     * @param  Builder<Order>  $query
     */
    public function scopeKitchenQueue(Builder $query): void
    {
        $query->where('payment_status', PaymentStatus::Paid->value)
            ->whereIn('kitchen_status', [
                KitchenStatus::Queued->value,
                KitchenStatus::Cooking->value,
            ]);
    }

    /**
     * @param  Builder<Order>  $query
     */
    public function scopeToday(Builder $query): void
    {
        $query->whereDate('created_at', now()->toDateString());
    }
}
