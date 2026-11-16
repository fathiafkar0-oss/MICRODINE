<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\RestaurantSetting;
use App\Support\MenuPresenter;
use App\Support\RestaurantPresenter;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Modul E — Keranjang Pesanan.
 * Route: GET /meja/{table}/keranjang
 * Catatan: isi keranjang disimpan di localStorage klien (lihat
 * resources/js/Hooks/useCart.js); backend hanya memasok katalog menu
 * terkini agar harga yang ditampilkan selalu akurat.
 */
class CartController extends Controller
{
    public function index(string $table): Response
    {
        return Inertia::render('Customer/Cart/Index', [
            'table' => $table,
            'restaurant' => RestaurantPresenter::toArray(RestaurantSetting::current()),
            'menus' => MenuPresenter::collection(MenuItem::query()->with('category')->inCatalog()->get()),
        ]);
    }
}
