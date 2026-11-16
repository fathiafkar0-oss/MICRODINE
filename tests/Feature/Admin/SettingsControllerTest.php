<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\RestaurantSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Modul J — Pengaturan Restoran ([ACT-09]).
 */
class SettingsControllerTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::create([
            'name' => 'Admin', 'username' => 'admin', 'password' => 'secret',
            'role' => UserRole::Admin, 'is_active' => true,
        ]);
    }

    public function test_settings_page_lists_every_staff_account_with_their_role(): void
    {
        $admin = $this->admin();
        User::create(['name' => 'Kasir Satu', 'username' => 'kasir1', 'password' => 'secret', 'role' => UserRole::Kasir, 'is_active' => true]);

        $response = $this->actingAs($admin)
            ->withHeaders(['X-Inertia' => 'true'])
            ->get('/admin/pengaturan');

        $response->assertOk();
        $staffRoles = array_column($response->json('props.staff'), 'role');
        $this->assertContains('admin', $staffRoles);
        $this->assertContains('kasir', $staffRoles);
    }

    public function test_updating_settings_persists_tax_configuration(): void
    {
        RestaurantSetting::current();

        $this->actingAs($this->admin())->put('/admin/pengaturan', [
            'restaurant_name' => 'MICRODINE Baru',
            'address' => 'Jl. Baru No. 1',
            'phone' => '0800000000',
            'tax_enabled' => false,
            'tax_rate_percent' => 0,
            'payment_deadline_minutes' => 20,
        ])->assertRedirect();

        $restaurant = RestaurantSetting::current();
        $this->assertSame('MICRODINE Baru', $restaurant->restaurant_name);
        $this->assertFalse($restaurant->tax_enabled);
        $this->assertSame(20, $restaurant->qris_expires_minutes);
    }

    public function test_tax_rate_above_ten_percent_is_rejected(): void
    {
        $this->actingAs($this->admin())->put('/admin/pengaturan', [
            'restaurant_name' => 'MICRODINE',
            'tax_enabled' => true,
            'tax_rate_percent' => 15,
            'payment_deadline_minutes' => 15,
        ])->assertInvalid(['tax_rate_percent']);
    }
}
