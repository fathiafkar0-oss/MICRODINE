<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Otorisasi Saluran Siaran (Modul G)
|--------------------------------------------------------------------------
|
| ARCHITECTURE.md Bab 6.1. Saluran `order.{queueNumber}` sengaja publik
| (bukan private channel) karena pelanggan belum tentu login; ia hanya
| bergantung pada pengetahuan nomor antreannya sendiri.
*/

Broadcast::channel('cashier.orders', function (User $user) {
    return in_array($user->role->value, ['kasir', 'admin'], true);
});

Broadcast::channel('cashier.tables', function (User $user) {
    return in_array($user->role->value, ['kasir', 'admin'], true);
});

Broadcast::channel('kitchen.kds', function (User $user) {
    return in_array($user->role->value, ['dapur', 'kasir', 'admin'], true);
});

Broadcast::channel('admin.dashboard', function (User $user) {
    return $user->role->value === 'admin';
});
