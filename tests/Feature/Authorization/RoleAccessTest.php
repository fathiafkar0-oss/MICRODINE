<?php

namespace Tests\Feature\Authorization;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * T-014: RBAC per peran pada rute staf (ARCHITECTURE.md Bab 7).
 */
class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    private function userWithRole(UserRole $role, string $username, bool $active = true): User
    {
        return User::create([
            'name' => ucfirst($username),
            'username' => $username,
            'password' => 'secret',
            'role' => $role,
            'is_active' => $active,
        ]);
    }

    public function test_guest_is_redirected_to_login_for_staff_routes(): void
    {
        $this->get('/kasir')->assertRedirect(route('login'));
        $this->get('/dapur')->assertRedirect(route('login'));
        $this->get('/admin')->assertRedirect(route('login'));
    }

    public function test_kasir_can_access_cashier_and_kitchen_but_not_admin(): void
    {
        $kasir = $this->userWithRole(UserRole::Kasir, 'kasir');

        $this->actingAs($kasir)->get('/kasir')->assertOk();
        $this->actingAs($kasir)->get('/kasir/pesanan')->assertOk();
        $this->actingAs($kasir)->get('/kasir/meja')->assertOk();
        $this->actingAs($kasir)->get('/kasir/histori')->assertOk();
        $this->actingAs($kasir)->get('/dapur')->assertOk();
        $this->actingAs($kasir)->get('/admin')->assertForbidden();
    }

    public function test_dapur_can_only_access_kitchen_display(): void
    {
        $dapur = $this->userWithRole(UserRole::Dapur, 'dapur');

        $this->actingAs($dapur)->get('/dapur')->assertOk();
        $this->actingAs($dapur)->get('/kasir')->assertForbidden();
        $this->actingAs($dapur)->get('/admin')->assertForbidden();
        $this->actingAs($dapur)->get('/admin/menu')->assertForbidden();
    }

    public function test_admin_can_access_every_staff_area(): void
    {
        $admin = $this->userWithRole(UserRole::Admin, 'admin');

        $this->actingAs($admin)->get('/admin')->assertOk();
        $this->actingAs($admin)->get('/admin/menu')->assertOk();
        $this->actingAs($admin)->get('/admin/laporan')->assertOk();
        $this->actingAs($admin)->get('/admin/target')->assertOk();
        $this->actingAs($admin)->get('/admin/pengaturan')->assertOk();
        $this->actingAs($admin)->get('/kasir')->assertOk();
        $this->actingAs($admin)->get('/dapur')->assertOk();
    }

    public function test_deactivated_user_is_logged_out_on_next_request(): void
    {
        $kasir = $this->userWithRole(UserRole::Kasir, 'kasir', active: false);

        $this->actingAs($kasir)->get('/kasir')
            ->assertRedirect(route('login'));

        $this->assertGuest();
    }

    public function test_customer_routes_remain_public(): void
    {
        $this->get('/')->assertOk();
        $this->get('/meja/07')->assertOk();
        $this->get('/meja/07/keranjang')->assertOk();
        $this->get('/meja/07/checkout')->assertOk();
        $this->get('/pesanan/A-024')->assertOk();
        $this->get('/pesanan/A-024/bayar')->assertOk();
    }

    public function test_login_post_route_is_throttled(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->post('/staf/masuk', ['username' => 'x', 'password' => 'y']);
        }

        $this->post('/staf/masuk', ['username' => 'x', 'password' => 'y'])
            ->assertStatus(429);
    }
}
