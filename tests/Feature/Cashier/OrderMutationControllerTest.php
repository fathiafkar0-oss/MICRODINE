<?php

namespace Tests\Feature\Cashier;

use App\Actions\CreateOrderAction;
use App\Enums\OrderSource;
use App\Enums\UserRole;
use App\Models\DiningTable;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * `Cashier/Dashboard.jsx` (papan Kanban) memanggil `POST
 * /kasir/pesanan/{id}/pay-cash` lewat `router.post()` Inertia, jadi respons
 * HARUS redirect (bukan JsonResponse mentah seperti sebelumnya) agar
 * lifecycle request Inertia tidak putus.
 */
class OrderMutationControllerTest extends TestCase
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

    public function test_pay_cash_redirects_with_a_flash_status_instead_of_a_json_response(): void
    {
        $table = DiningTable::factory()->create();
        $menu = MenuItem::factory()->create(['price' => 20000, 'hpp' => 8000]);
        $order = app(CreateOrderAction::class)->execute($table, 'Andi', 'cash', [
            ['menu_id' => $menu->id, 'quantity' => 1, 'notes' => null],
        ], OrderSource::Manual);

        $response = $this->actingAs($this->kasir())->post("/kasir/pesanan/{$order->id}/pay-cash", [
            'cash_received' => 25000,
        ]);

        $response->assertRedirect();
        $this->assertStringContainsString('lunas', (string) session('status'));
        $this->assertSame('paid', $order->refresh()->payment_status->value);
    }
}
