<?php

namespace Tests\Feature\Cashier;

use App\Actions\CreateOrderAction;
use App\Enums\OrderSource;
use App\Enums\UserRole;
use App\Models\DiningTable;
use App\Models\MenuItem;
use App\Models\TableSession;
use App\Models\User;
use App\Services\PaymentService;
use App\Support\CodeGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * `Cashier/Tables.jsx` menutup sesi lewat `router.post()` Inertia.
 * `UnservedOrdersException` HARUS direspons sebagai redirect+`withErrors`
 * (bukan JsonResponse 409 mentah seperti sebelumnya), lalu kasir bisa
 * menutup paksa dengan `force: true`.
 */
class CloseSessionControllerTest extends TestCase
{
    use RefreshDatabase;

    private function kasir(): User
    {
        return User::create([
            'name' => 'Kasir',
            'username' => 'kasir',
            'password' => 'secret',
            'role' => UserRole::Kasir,
            'is_active' => true,
        ]);
    }

    public function test_close_session_is_rejected_with_validation_errors_when_an_order_is_unserved(): void
    {
        $table = DiningTable::factory()->create();
        $menu = MenuItem::factory()->create(['price' => 20000, 'hpp' => 8000]);
        $order = app(CreateOrderAction::class)->execute($table, 'Andi', 'qris', [
            ['menu_id' => $menu->id, 'quantity' => 1, 'notes' => null],
        ], OrderSource::Manual);

        app(PaymentService::class)->markPaid($order, [
            'provider' => 'midtrans',
            'provider_ref' => 'TEST-1',
            'amount' => $order->total,
            'signature_valid' => true,
            'raw_payload' => [],
            'idempotency_key' => CodeGenerator::midtransIdempotencyKey($order->order_code, 'TEST'),
            'expires_at' => now(),
        ], actorType: 'system');

        $session = TableSession::query()->first();

        $response = $this->actingAs($this->kasir())->post("/kasir/meja/{$session->id}/close");

        $response->assertRedirect();
        $response->assertSessionHasErrors('session');
        $this->assertSame(1, (int) session('unservedCount'));
        $this->assertSame('active', $session->refresh()->status->value);
    }

    public function test_close_session_force_closes_despite_unserved_orders(): void
    {
        $table = DiningTable::factory()->create();
        $menu = MenuItem::factory()->create(['price' => 20000, 'hpp' => 8000]);
        $order = app(CreateOrderAction::class)->execute($table, 'Andi', 'qris', [
            ['menu_id' => $menu->id, 'quantity' => 1, 'notes' => null],
        ], OrderSource::Manual);

        app(PaymentService::class)->markPaid($order, [
            'provider' => 'midtrans',
            'provider_ref' => 'TEST-2',
            'amount' => $order->total,
            'signature_valid' => true,
            'raw_payload' => [],
            'idempotency_key' => CodeGenerator::midtransIdempotencyKey($order->order_code, 'TEST'),
            'expires_at' => now(),
        ], actorType: 'system');

        $session = TableSession::query()->first();

        $response = $this->actingAs($this->kasir())->post("/kasir/meja/{$session->id}/close", ['force' => true]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
        $this->assertSame('closed', $session->refresh()->status->value);
    }
}
