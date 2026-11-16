<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Routes halaman MICRODINE (fase frontend)
|--------------------------------------------------------------------------
|
| Fase ini hanya merender halaman Inertia. Data masih diambil dari
| resources/js/Data/mock. Saat backend dikerjakan, ganti closure di bawah
| dengan controller yang mengirim props dengan nama yang sama (lihat komentar
| di bagian atas tiap file di resources/js/Pages).
|
| Nama komponen = path file di resources/js/Pages tanpa ".jsx".
|
*/

Route::inertia('/', 'Landing/Index')->name('home');

// ---------------------------------------------------------------- Pelanggan
// URL yang dicetak di QR meja: /meja/{nomor}, mis. /meja/07
Route::prefix('meja/{table}')->where(['table' => '[0-9]{2}'])->name('customer.')->group(function () {
    Route::get('/', fn (string $table) => Inertia::render('Customer/Menu/Index', ['table' => $table]))->name('menu');
    Route::get('/keranjang', fn (string $table) => Inertia::render('Customer/Cart/Index', ['table' => $table]))->name('cart');
    Route::get('/checkout', fn (string $table) => Inertia::render('Customer/Checkout/Index', ['table' => $table]))->name('checkout');
});

Route::prefix('pesanan/{code}')->where(['code' => '[A-Z]-[0-9]{3}'])->name('customer.')->group(function () {
    Route::get('/', fn (string $code) => Inertia::render('Customer/Order/Status', ['code' => $code]))->name('status');
    Route::get('/bayar', fn (string $code) => Inertia::render('Customer/Payment/Index', ['code' => $code]))->name('payment');
});

// --------------------------------------------------------------------- Staf
Route::inertia('/staf/masuk', 'Auth/Login')->name('login');

// Kasir (TODO backend: bungkus dengan middleware auth + role:kasir,admin)
Route::prefix('kasir')->name('cashier.')->group(function () {
    Route::inertia('/', 'Cashier/Dashboard')->name('dashboard');
    Route::inertia('/pesanan', 'Cashier/Orders')->name('orders');
    Route::inertia('/meja', 'Cashier/Tables')->name('tables');
    Route::inertia('/histori', 'Cashier/History')->name('history');
});

// Dapur (TODO backend: middleware auth + role:dapur,kasir,admin)
Route::inertia('/dapur', 'Kitchen/Dashboard')->name('kitchen');

// Admin (TODO backend: middleware auth + role:admin)
Route::prefix('admin')->name('admin.')->group(function () {
    Route::inertia('/', 'Admin/Dashboard')->name('dashboard');
    Route::inertia('/menu', 'Admin/Menus')->name('menus');
    Route::inertia('/analisis-menu', 'Admin/MenuAnalytics')->name('menu-analytics');
    Route::inertia('/meja', 'Admin/Tables')->name('tables');
    Route::inertia('/laporan', 'Admin/Reports')->name('reports');
    Route::inertia('/target', 'Admin/Targets')->name('targets');
    Route::inertia('/pengaturan', 'Admin/Settings')->name('settings');
});
