<?php

namespace Tests\Feature;

use App\Actions\CreateOrderAction;
use App\Models\DiningTable;
use App\Models\MenuItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * AGENTS.md invarian #2 — Historical Price & HPP Snapshot.
 * `order_items.unit_price_snapshot` & `unit_hpp_snapshot` direkam saat
 * pesanan dibuat dan TIDAK PERNAH berubah meski master menu diubah
 * belakangan.
 */
class HppSnapshotTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_item_keeps_original_price_and_hpp_after_menu_changes(): void
    {
        $table = DiningTable::factory()->create();
        $menu = MenuItem::factory()->create(['price' => 25000, 'hpp' => 11000]);

        $order = app(CreateOrderAction::class)->execute(
            $table,
            'Budi',
            'cash',
            [['menu_id' => $menu->id, 'quantity' => 3, 'notes' => null]],
        );

        $item = $order->items()->first();
        $this->assertSame(25000, $item->unit_price_snapshot);
        $this->assertSame(11000, $item->unit_hpp_snapshot);
        $this->assertSame(75000, $item->subtotal_price);
        $this->assertSame(33000, $item->subtotal_hpp);

        // Admin menaikkan harga & HPP menu sesudah pesanan dibuat (ACT-08).
        $menu->update(['price' => 40000, 'hpp' => 20000]);

        $item->refresh();
        $order->refresh();

        $this->assertSame(25000, $item->unit_price_snapshot, 'Snapshot harga pesanan lama tidak boleh ikut berubah.');
        $this->assertSame(11000, $item->unit_hpp_snapshot, 'Snapshot HPP pesanan lama tidak boleh ikut berubah.');
        $this->assertSame(75000, $order->subtotal, 'Subtotal pesanan lama memakai harga saat dibuat, bukan harga terbaru.');
        $this->assertSame(42000, $item->profit());
    }

    public function test_menu_soft_delete_does_not_erase_order_history(): void
    {
        $table = DiningTable::factory()->create();
        $menu = MenuItem::factory()->create(['price' => 15000, 'hpp' => 6000, 'name' => 'Es Teh Manis']);

        $order = app(CreateOrderAction::class)->execute(
            $table,
            'Citra',
            'qris',
            [['menu_id' => $menu->id, 'quantity' => 1, 'notes' => null]],
        );

        $menu->delete();

        $item = $order->items()->first();
        $this->assertSame('Es Teh Manis', $item->name_snapshot);
        $this->assertSame(15000, $item->unit_price_snapshot);
        // Menu dihapus (soft delete) sehingga relasi menuItem() tak lagi
        // mengembalikan baris apa pun, tetapi name_snapshot/harga di
        // order_items tetap utuh karena memang bukan bergantung pada relasi.
        $this->assertNull($item->menuItem);
    }
}
