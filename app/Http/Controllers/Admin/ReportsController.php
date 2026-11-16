<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\RestaurantSetting;
use App\Support\OrderPresenter;
use App\Support\RestaurantPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Modul J — Audit Transaksi & Laporan.
 * Route: GET /admin/laporan?dari=&sampai=
 *
 * Seperti `Cashier/HistoryController`, halaman `Admin/Reports` melakukan
 * SELURUH filter (metode, status, pencarian), pagination, unduh CSV dan
 * cetak di sisi klien dari satu array `orders` penuh (lihat
 * Data/mock/orders.js). Backend hanya mengirim pesanan pada rentang
 * tanggal yang diminta (default: hari ini) + `restaurant`.
 */
class ReportsController extends Controller
{
    public function index(Request $request): Response
    {
        $from = $request->query('dari', now()->toDateString());
        $to = $request->query('sampai', $from);

        $orders = Order::query()
            ->whereBetween('created_at', [
                now()->parse($from)->startOfDay(),
                now()->parse($to)->endOfDay(),
            ])
            ->with(['items', 'tableSession.diningTable', 'tableSession.orders'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Admin/Reports', [
            'orders' => OrderPresenter::collection($orders),
            'restaurant' => RestaurantPresenter::toArray(RestaurantSetting::current()),
        ]);
    }
}
