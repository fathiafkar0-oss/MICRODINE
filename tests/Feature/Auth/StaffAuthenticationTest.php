<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * T-012: portal login staf memakai username.
 */
class StaffAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $username, string $password, string $role, bool $active = true): User
    {
        return User::create([
            'name' => ucfirst($username),
            'username' => $username,
            'password' => $password,
            'role' => $role,
            'is_active' => $active,
        ]);
    }

    public function test_guest_can_see_login_page(): void
    {
        $this->get('/staf/masuk')->assertOk();
    }

    public function test_kasir_can_login_and_is_redirected_to_cashier_dashboard(): void
    {
        $this->makeUser('dika.kasir', 'secret', UserRole::Kasir->value);

        $response = $this->post('/staf/masuk', [
            'username' => 'dika.kasir',
            'password' => 'secret',
        ]);

        $response->assertRedirect(route('cashier.dashboard'));
        $this->assertAuthenticated();
    }

    public function test_dapur_is_redirected_to_kitchen_display(): void
    {
        $this->makeUser('sari.dapur', 'secret', UserRole::Dapur->value);

        $this->post('/staf/masuk', [
            'username' => 'sari.dapur',
            'password' => 'secret',
        ])->assertRedirect(route('kitchen.display'));
    }

    public function test_admin_is_redirected_to_admin_dashboard(): void
    {
        $this->makeUser('rina.admin', 'secret', UserRole::Admin->value);

        $this->post('/staf/masuk', [
            'username' => 'rina.admin',
            'password' => 'secret',
        ])->assertRedirect(route('admin.dashboard'));
    }

    public function test_wrong_password_is_rejected(): void
    {
        $this->makeUser('dika.kasir', 'secret', UserRole::Kasir->value);

        $this->from('/staf/masuk')->post('/staf/masuk', [
            'username' => 'dika.kasir',
            'password' => 'salah',
        ])->assertRedirect('/staf/masuk')->assertSessionHasErrors('username');

        $this->assertGuest();
    }

    public function test_unknown_username_is_rejected(): void
    {
        $this->from('/staf/masuk')->post('/staf/masuk', [
            'username' => 'tidak-ada',
            'password' => 'secret',
        ])->assertSessionHasErrors('username');

        $this->assertGuest();
    }

    public function test_inactive_account_cannot_login(): void
    {
        $this->makeUser('mantan.kasir', 'secret', UserRole::Kasir->value, active: false);

        $this->from('/staf/masuk')->post('/staf/masuk', [
            'username' => 'mantan.kasir',
            'password' => 'secret',
        ])->assertSessionHasErrors('username');

        $this->assertGuest();
    }

    public function test_username_and_password_are_required(): void
    {
        $this->from('/staf/masuk')->post('/staf/masuk', [])
            ->assertSessionHasErrors(['username', 'password']);
    }

    public function test_logged_in_staff_is_redirected_away_from_login_page(): void
    {
        $user = $this->makeUser('dika.kasir', 'secret', UserRole::Kasir->value);

        $this->actingAs($user)->get('/staf/masuk')
            ->assertRedirect(route('cashier.dashboard'));
    }

    public function test_staff_can_logout(): void
    {
        $user = $this->makeUser('dika.kasir', 'secret', UserRole::Kasir->value);

        $this->actingAs($user)->post('/logout')->assertRedirect(route('login'));

        $this->assertGuest();
    }

    public function test_password_is_hashed_on_creation(): void
    {
        $user = $this->makeUser('dika.kasir', 'secret', UserRole::Kasir->value);

        $this->assertNotSame('secret', $user->password);
        $this->assertTrue(password_verify('secret', $user->password));
    }
}
