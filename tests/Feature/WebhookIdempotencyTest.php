<?php

namespace Tests\Feature;

use App\Actions\CreateOrderAction;
use App\Enums\PaymentStatus;
use App\Events\OrderPaidEvent;
use App\Models\DiningTable;
use App\Models\MenuItem;
use App\Models\Payment;
use App\Services\PaymentService;
use App\Support\CodeGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

/**
 * AGENTS.md invarian #5 & #8 — Idempotensi Webhook & Siaran Setelah Commit.
 *
 * Gateway pembayaran (terutama Midtrans) lazim mengirim webhook yang sama
 * lebih dari sekali (retry jaringan, duplikasi pengiriman). `PaymentService::
 * markPaid()` HARUS tetap menghasilkan tepat satu baris `payments` dan tidak
 * boleh memicu `OrderPaidEvent` lebih dari sekali untuk kunci idempotensi
 * yang sama, berapa kali pun dipanggil.
 */
class WebhookIdempotencyTest extends TestCase
{
    use RefreshDatabase;

    public function test_delivering_the_same_webhook_twice_creates_exactly_one_payment_row(): void
    {
        Event::fake([OrderPaidEvent::class]);

        $table = DiningTable::factory()->create();
        $menu = MenuItem::factory()->create(['price' => 25000, 'hpp' => 10000]);

        $order = app(CreateOrderAction::class)->execute(
            $table,
            'Dewi',
            'qris',
            [['menu_id' => $menu->id, 'quantity' => 1, 'notes' => null]],
        );

        $idempotencyKey = CodeGenerator::midtransIdempotencyKey($order->order_code, 'settlement');

        $paymentData = [
            'provider' => 'midtrans',
            'provider_ref' => 'trx-001',
            'amount' => $order->total,
            'signature_valid' => true,
            'raw_payload' => ['order_id' => $order->order_code, 'transaction_status' => 'settlement'],
            'idempotency_key' => $idempotencyKey,
            'expires_at' => now()->addMinutes(15),
        ];

        $service = app(PaymentService::class);

        $first = $service->markPaid($order, $paymentData, 'gateway');
        $this->assertFalse($first['already_paid']);

        $order->refresh();
        $firstPaidAt = $order->paid_at;

        // Gateway mengirim ulang webhook yang SAMA (umum pada Midtrans saat
        // respons 200 tidak diterima tepat waktu oleh sisi mereka).
        $second = $service->markPaid($order, $paymentData, 'gateway');
        $this->assertTrue($second['already_paid']);

        $order->refresh();

        $this->assertSame(1, Payment::query()->where('order_id', $order->id)->count());
        $this->assertSame(1, Payment::query()->where('idempotency_key', $idempotencyKey)->count());
        $this->assertSame(PaymentStatus::Paid, $order->payment_status);
        $this->assertTrue($firstPaidAt->equalTo($order->paid_at), 'paid_at tidak boleh berubah pada panggilan kedua.');

        Event::assertDispatchedTimes(OrderPaidEvent::class, 1);
    }

    public function test_an_already_terminal_order_is_not_mutated_by_a_late_duplicate_webhook(): void
    {
        Event::fake([OrderPaidEvent::class]);

        $table = DiningTable::factory()->create();
        $menu = MenuItem::factory()->create(['price' => 15000, 'hpp' => 6000]);

        $order = app(CreateOrderAction::class)->execute(
            $table,
            'Rian',
            'qris',
            [['menu_id' => $menu->id, 'quantity' => 1, 'notes' => null]],
        );

        $service = app(PaymentService::class);

        $service->markPaid($order, [
            'provider' => 'midtrans',
            'provider_ref' => 'trx-002',
            'amount' => $order->total,
            'signature_valid' => true,
            'raw_payload' => [],
            'idempotency_key' => CodeGenerator::midtransIdempotencyKey($order->order_code, 'settlement'),
            'expires_at' => now()->addMinutes(15),
        ], 'gateway');

        $order->refresh();
        $paidAt = $order->paid_at;

        // Webhook duplikat terlambat dengan kunci BERBEDA (status_code lain)
        // tetapi mengincar pesanan yang sudah berstatus final (paid) --
        // amount guard & pemeriksaan status final harus tetap menolak mutasi.
        $result = $service->markPaid($order, [
            'provider' => 'midtrans',
            'provider_ref' => 'trx-003-late-duplicate',
            'amount' => $order->total,
            'signature_valid' => true,
            'raw_payload' => [],
            'idempotency_key' => CodeGenerator::midtransIdempotencyKey($order->order_code, 'settlement_retry'),
            'expires_at' => now()->addMinutes(15),
        ], 'gateway');

        $this->assertTrue($result['already_paid']);

        $order->refresh();
        $this->assertTrue($paidAt->equalTo($order->paid_at));
        $this->assertSame(1, Payment::query()->where('order_id', $order->id)->count());
        Event::assertDispatchedTimes(OrderPaidEvent::class, 1);
    }
}
