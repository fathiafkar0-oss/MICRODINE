<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\RestaurantSetting;
use App\Support\OrderPresenter;
use App\Support\RestaurantPresenter;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Modul E/F — Antrean Kanban Kasir.
 * Route: GET /kasir
 */
class DashboardController extends Controller
{
    public function dashboard(): Response
    {
        $orders = Order::query()
            ->whereDate('created_at', now()->toDateString())
            ->whereNotIn('payment_status', ['cancelled', 'expired', 'failed'])
            ->with(['items', 'tableSession.diningTable', 'tableSession.orders'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Cashier/Dashboard', [
            'orders' => OrderPresenter::collection($orders),
            'restaurant' => RestaurantPresenter::toArray(RestaurantSetting::current()),
            'stats' => [
                'doneToday' => Order::query()->whereDate('created_at', now()->toDateString())->where('kitchen_status', 'served')->count(),
                'shiftOmzet' => (int) Order::query()->paid()->whereDate('paid_at', now()->toDateString())->sum('subtotal'),
                'waitingPaymentCount' => Order::query()->whereDate('created_at', now()->toDateString())->where('payment_status', 'pending')->count(),
                'inProgressCount' => Order::query()->kitchenQueue()->count(),
            ],
        ]);
    }
}
