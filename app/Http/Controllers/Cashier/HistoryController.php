<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\RestaurantSetting;
use App\Support\OrderPresenter;
use App\Support\RestaurantPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Modul I — Histori & Struk.
 * Route: GET /kasir/histori?tanggal=YYYY-MM-DD
 */
class HistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $date = $request->query('tanggal', now()->toDateString());

        $orders = Order::query()
            ->whereDate('created_at', $date)
            ->with(['items', 'tableSession.diningTable', 'tableSession.orders'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Cashier/History', [
            'orders' => OrderPresenter::collection($orders),
            'restaurant' => RestaurantPresenter::toArray(RestaurantSetting::current()),
        ]);
    }
}
