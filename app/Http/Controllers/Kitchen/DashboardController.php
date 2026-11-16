<?php

namespace App\Http\Controllers\Kitchen;

use App\Actions\UpdateKitchenStatusAction;
use App\Enums\KitchenStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Kitchen\UpdateKitchenStatusRequest;
use App\Models\Order;
use App\Support\OrderPresenter;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Modul E/F/G — Layar Dapur (Kitchen Display System).
 * Route: GET /dapur, PATCH /dapur/pesanan/{id}/status
 *
 * AGENTS.md invarian #1: hanya pesanan `payment_status = paid` yang terlihat
 * di sini (lihat `Order::scopeKitchenQueue()`).
 */
class DashboardController extends Controller
{
    public function __construct(private readonly UpdateKitchenStatusAction $updateKitchenStatus) {}

    public function index(): Response
    {
        $orders = Order::query()
            ->kitchenQueue()
            ->with(['items', 'tableSession.diningTable', 'tableSession.orders'])
            ->orderBy('paid_at')
            ->get();

        return Inertia::render('Kitchen/Dashboard', [
            'orders' => OrderPresenter::collection($orders),
            'doneToday' => Order::query()->whereDate('created_at', now()->toDateString())->where('kitchen_status', 'served')->count(),
        ]);
    }

    public function updateStatus(UpdateKitchenStatusRequest $request, Order $order): RedirectResponse
    {
        $this->updateKitchenStatus->execute(
            $order,
            KitchenStatus::from($request->validated('status')),
            'dapur',
            $request->user()->id,
        );

        return back();
    }
}
