<?php

namespace Tests\Unit;

use App\Enums\KitchenStatus;
use App\Enums\OrderSource;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\TableSessionStatus;
use App\Enums\UserRole;
use PHPUnit\Framework\TestCase;

/**
 * Validasi nilai & label enum domain (T-009).
 */
class EnumsTest extends TestCase
{
    public function test_user_role_values_labels_and_home_routes(): void
    {
        $this->assertSame(['admin', 'kasir', 'dapur'], array_column(UserRole::cases(), 'value'));
        $this->assertSame('Kasir', UserRole::Kasir->label());
        $this->assertSame('admin.dashboard', UserRole::Admin->homeRoute());
        $this->assertSame('cashier.dashboard', UserRole::Kasir->homeRoute());
        $this->assertSame('kitchen', UserRole::Dapur->homeRoute());
    }

    public function test_payment_status_values_and_helpers(): void
    {
        $this->assertSame(
            ['pending', 'paid', 'failed', 'cancelled', 'expired'],
            array_column(PaymentStatus::cases(), 'value'),
        );

        $this->assertTrue(PaymentStatus::Paid->isPaid());
        $this->assertFalse(PaymentStatus::Pending->isPaid());
        $this->assertTrue(PaymentStatus::Cancelled->isFinal());
        $this->assertFalse(PaymentStatus::Pending->isFinal());
        $this->assertSame('Menunggu Bayar', PaymentStatus::Pending->label());
    }

    public function test_kitchen_status_progression(): void
    {
        $this->assertSame(['queued', 'cooking', 'done', 'served'], array_column(KitchenStatus::cases(), 'value'));

        $this->assertSame(KitchenStatus::Cooking, KitchenStatus::Queued->next());
        $this->assertSame(KitchenStatus::Done, KitchenStatus::Cooking->next());
        $this->assertSame(KitchenStatus::Served, KitchenStatus::Done->next());
        $this->assertNull(KitchenStatus::Served->next());
    }

    public function test_table_session_status_values(): void
    {
        $this->assertSame(['active', 'closed'], array_column(TableSessionStatus::cases(), 'value'));
        $this->assertSame('Aktif', TableSessionStatus::Active->label());
    }

    public function test_payment_method_and_source_frontend_values(): void
    {
        $this->assertSame('tunai', PaymentMethod::Cash->frontendValue());
        $this->assertSame('qris', PaymentMethod::Qris->frontendValue());
        $this->assertSame('Tunai', PaymentMethod::Cash->label());

        $this->assertSame('qr', OrderSource::Qr->frontendValue());
        $this->assertSame('kasir', OrderSource::Manual->frontendValue());
    }
}
