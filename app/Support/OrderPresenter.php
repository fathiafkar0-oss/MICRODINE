<?php

namespace App\Support;

use App\Models\Order;
use Illuminate\Support\Collection;

/**
 * Satu-satunya tempat yang mengubah bentuk `Order` Eloquent menjadi props
 * yang dikonsumsi halaman React. Kontrak bentuknya ada di
 * resources/js/Data/mock/orders.js (lihat komentar file itu) — frontend
 * memakai SATU kolom `status` gabungan, bukan payment_status/kitchen_status
 * terpisah; lihat `Order::frontendStatus()` untuk pemetaannya (issue.md 4.1).
 */
class OrderPresenter
{
    /**
     * @return array{code: string, table: string, customer: string, source: string, method: string, status: string, kitchenStatus: string, sequence: int, minutesAgo: int, time: string, paidAt: ?string, items: array<int, array<string, mixed>>, subtotal: int, tax: int, total: int}
     */
    public static function toArray(Order $order): array
    {
        $order->loadMissing(['items', 'tableSession.diningTable', 'tableSession.orders']);

        return [
            'id' => $order->id,
            'code' => $order->daily_queue_number,
            'orderCode' => $order->order_code,
            'table' => $order->tableSession->diningTable->number,
            'customer' => $order->customer_name,
            'source' => $order->source->frontendValue(),
            'method' => $order->payment_method->frontendValue(),
            'status' => $order->frontendStatus(),
            'kitchenStatus' => $order->kitchen_status->value,
            'sequence' => self::sequenceWithin($order),
            'minutesAgo' => (int) $order->created_at->diffInMinutes(now()),
            'time' => $order->created_at->format('H:i'),
            'paidAt' => $order->paid_at?->format('H:i'),
            'items' => $order->items->map(fn ($item) => [
                'id' => $item->id,
                'menuId' => $item->menu_item_id !== null ? MenuPresenter::displayId($item->menu_item_id) : null,
                'name' => $item->name_snapshot,
                'price' => $item->unit_price_snapshot,
                'hpp' => $item->unit_hpp_snapshot,
                'qty' => $item->qty,
                'note' => $item->notes,
            ])->all(),
            'subtotal' => $order->subtotal,
            'tax' => $order->tax_amount,
            'total' => $order->total,
        ];
    }

    /**
     * Urutan pesanan dalam satu sesi meja (1 = pesanan pertama, 2+ = tambahan).
     * Dihitung dari urutan `created_at` di dalam `table_session_id` yang sama
     * (issue.md: "Backend: dihitung dari orders.table_session_id").
     */
    public static function sequenceWithin(Order $order): int
    {
        $ordered = $order->tableSession->orders->sortBy('id')->values();

        return $ordered->search(fn (Order $item) => $item->id === $order->id) + 1;
    }

    /**
     * @param  Collection<int, Order>  $orders
     * @return array<int, array<string, mixed>>
     */
    public static function collection(Collection $orders): array
    {
        return $orders->map(fn (Order $order) => self::toArray($order))->values()->all();
    }

    /**
     * Semua pesanan di sesi meja yang sama, diurutkan sesuai `sequence`
     * (dipakai untuk props `sessionOrders` di Customer/Order/Status & Checkout).
     *
     * @return array<int, array<string, mixed>>
     */
    public static function sessionOrders(Order $order): array
    {
        $siblings = $order->tableSession->orders()->with(['items', 'tableSession.diningTable', 'tableSession.orders'])->orderBy('id')->get();

        return self::collection($siblings);
    }
}
