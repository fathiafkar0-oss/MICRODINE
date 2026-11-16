<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\MenuAnalyticsController;
use App\Http\Controllers\Admin\MenuManagementController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\TableManagementController as AdminTableManagementController;
use App\Http\Controllers\Admin\TargetsController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Cashier\DashboardController as CashierDashboardController;
use App\Http\Controllers\Cashier\HistoryController;
use App\Http\Controllers\Cashier\OrderController as CashierOrderController;
use App\Http\Controllers\Cashier\TableManagementController as CashierTableManagementController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\CheckoutController;
use App\Http\Controllers\Customer\MenuController as CustomerMenuController;
use App\Http\Controllers\Customer\OrderStatusController;
use App\Http\Controllers\Kitchen\DashboardController as KitchenDashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes halaman MICRODINE
|--------------------------------------------------------------------------
|
| Zona publik (pelanggan) memakai throttle untuk mencegah penyalahgunaan.
| Zona staf dilindungi `auth` + `role:<peran>` (lihat ARCHITECTURE.md Bab 7).
|
| Modul C-J (menu admin, meja & sesi, pemesanan pelanggan, pay-first,
| real-time, histori, laporan & admin+) memakai controller sungguhan.
|
*/

Route::inertia('/', 'Landing/Index')->name('home');

// ---------------------------------------------------------------- Pelanggan
// URL yang dicetak di QR meja: /meja/{nomor}, mis. /meja/07
Route::prefix('meja/{table}')->where(['table' => '[0-9]{2}'])->name('customer.')->middleware(['throttle:60,1'])->group(function () {
    Route::get('/', [CustomerMenuController::class, 'show'])->name('menu');
    Route::get('/keranjang', [CartController::class, 'index'])->name('cart');
    Route::get('/checkout', [CheckoutController::class, 'show'])->name('checkout');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('order.store');
});

Route::prefix('pesanan/{code}')->where(['code' => '[A-Z]-[0-9]{3}'])->name('customer.')->middleware(['throttle:60,1'])->group(function () {
    Route::get('/', [OrderStatusController::class, 'show'])->name('status');
    Route::get('/bayar', [OrderStatusController::class, 'paymentView'])->name('payment');
});

// ---------------------------------------------------------------- Autentikasi staf
Route::get('/staf/masuk', [AuthenticatedSessionController::class, 'create'])
    ->middleware('guest')
    ->name('login');

Route::post('/staf/masuk', [AuthenticatedSessionController::class, 'store'])
    ->middleware('throttle:5,1');

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

// ---------------------------------------------------------------------- Kasir
Route::middleware(['auth', 'role:kasir,admin'])->prefix('kasir')->name('cashier.')->group(function () {
    Route::get('/', [CashierDashboardController::class, 'dashboard'])->name('dashboard');

    Route::get('/pesanan', [CashierOrderController::class, 'index'])->name('orders');
    Route::post('/pesanan/manual', [CashierOrderController::class, 'storeManualOrder'])->name('orders.manual');
    Route::post('/pesanan/{order}/pay-cash', [CashierOrderController::class, 'payCash'])->name('orders.pay-cash');
    Route::post('/pesanan/{order}/serve', [CashierOrderController::class, 'markServed'])->name('orders.serve');
    Route::post('/pesanan/{order}/cancel', [CashierOrderController::class, 'cancel'])->name('orders.cancel');

    Route::get('/meja', [CashierTableManagementController::class, 'index'])->name('tables');
    Route::post('/meja/{session}/close', [CashierTableManagementController::class, 'closeSession'])->name('tables.close');

    Route::get('/histori', [HistoryController::class, 'index'])->name('history');
});

// ---------------------------------------------------------------------- Dapur
Route::middleware(['auth', 'role:dapur,kasir,admin'])->prefix('dapur')->name('kitchen.')->group(function () {
    Route::get('/', [KitchenDashboardController::class, 'index'])->name('display');
    Route::patch('/pesanan/{order}/status', [KitchenDashboardController::class, 'updateStatus'])->name('orders.update-status');
});

// ---------------------------------------------------------------------- Admin
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Modul C — Master Menu Admin.
    Route::get('/menu', [MenuManagementController::class, 'index'])->name('menus');
    Route::post('/menu', [MenuManagementController::class, 'store'])->name('menus.store');
    Route::put('/menu/{menuItem}', [MenuManagementController::class, 'update'])->name('menus.update');
    Route::delete('/menu/{menuItem}', [MenuManagementController::class, 'destroy'])->name('menus.destroy');
    Route::patch('/menu/{menuItem}/toggle-availability', [MenuManagementController::class, 'toggleAvailability'])->name('menus.toggle');

    Route::get('/analisis-menu', [MenuAnalyticsController::class, 'index'])->name('menu-analytics');

    // Modul D — Meja & QR (sisi admin).
    Route::get('/meja', [AdminTableManagementController::class, 'index'])->name('tables');
    Route::post('/meja', [AdminTableManagementController::class, 'store'])->name('tables.store');
    Route::put('/meja/{table}', [AdminTableManagementController::class, 'update'])->name('tables.update');
    Route::patch('/meja/{table}/status', [AdminTableManagementController::class, 'toggleStatus'])->name('tables.toggle');
    Route::post('/meja/{table}/qr-ulang', [AdminTableManagementController::class, 'regenerateQr'])->name('tables.regenerate-qr');

    // Modul J — Laporan & admin+.
    Route::get('/laporan', [ReportsController::class, 'index'])->name('reports');
    Route::get('/target', [TargetsController::class, 'index'])->name('targets');
    Route::put('/target', [TargetsController::class, 'update'])->name('targets.update');
    Route::get('/pengaturan', [SettingsController::class, 'index'])->name('settings');
    Route::put('/pengaturan', [SettingsController::class, 'update'])->name('settings.update');
});
