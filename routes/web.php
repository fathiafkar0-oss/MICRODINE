<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Routes halaman MICRODINE
|--------------------------------------------------------------------------
|
| Zona publik (pelanggan) memakai throttle untuk mencegah penyalahgunaan.
| Zona staf dilindungi `auth` + `role:<peran>` (lihat ARCHITECTURE.md Bab 7).
|
| Halaman yang belum punya controller masih memakai Route::inertia; controller
| akan menggantikannya pada modul berikutnya (C, D, E, ...).
|
*/

Route::inertia('/', 'Landing/Index')->name('home');

// ---------------------------------------------------------------- Pelanggan
// URL yang dicetak di QR meja: /meja/{nomor}, mis. /meja/07
Route::prefix('meja/{table}')->where(['table' => '[0-9]{2}'])->name('customer.')->middleware(['throttle:60,1'])->group(function () {
    Route::get('/', fn (string $table) => Inertia::render('Customer/Menu/Index', ['table' => $table]))->name('menu');
    Route::get('/keranjang', fn (string $table) => Inertia::render('Customer/Cart/Index', ['table' => $table]))->name('cart');
    Route::get('/checkout', fn (string $table) => Inertia::render('Customer/Checkout/Index', ['table' => $table]))->name('checkout');
});

Route::prefix('pesanan/{code}')->where(['code' => '[A-Z]-[0-9]{3}'])->name('customer.')->middleware(['throttle:60,1'])->group(function () {
    Route::get('/', fn (string $code) => Inertia::render('Customer/Order/Status', ['code' => $code]))->name('status');
    Route::get('/bayar', fn (string $code) => Inertia::render('Customer/Payment/Index', ['code' => $code]))->name('payment');
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
    Route::inertia('/', 'Cashier/Dashboard')->name('dashboard');
    Route::inertia('/pesanan', 'Cashier/Orders')->name('orders');
    Route::inertia('/meja', 'Cashier/Tables')->name('tables');
    Route::inertia('/histori', 'Cashier/History')->name('history');
});

// ---------------------------------------------------------------------- Dapur
Route::middleware(['auth', 'role:dapur,kasir,admin'])->prefix('dapur')->name('kitchen.')->group(function () {
    Route::inertia('/', 'Kitchen/Dashboard')->name('display');
});

// ---------------------------------------------------------------------- Admin
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::inertia('/', 'Admin/Dashboard')->name('dashboard');
    Route::inertia('/menu', 'Admin/Menus')->name('menus');
    Route::inertia('/laporan', 'Admin/Reports')->name('reports');
    Route::inertia('/target', 'Admin/Targets')->name('targets');
    Route::inertia('/pengaturan', 'Admin/Settings')->name('settings');
});
