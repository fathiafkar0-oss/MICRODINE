<?php

namespace App\Enums;

/**
 * Peran staf MICRODINE (AGENTS.md Bab 6).
 */
enum UserRole: string
{
    case Admin = 'admin';
    case Kasir = 'kasir';
    case Dapur = 'dapur';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Admin',
            self::Kasir => 'Kasir',
            self::Dapur => 'Dapur',
        };
    }

    /**
     * Rute beranda default setelah login.
     */
    public function homeRoute(): string
    {
        return match ($this) {
            self::Admin => 'admin.dashboard',
            self::Kasir => 'cashier.dashboard',
            self::Dapur => 'kitchen.display',
        };
    }
}
