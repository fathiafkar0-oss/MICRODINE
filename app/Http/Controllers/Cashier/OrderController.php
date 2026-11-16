<?php

namespace App\Http\Controllers\Cashier;

use App\Actions\CancelOrderAction;
use App\Actions\CashPaymentAction;
use App\Actions\ManualOrderAction;
use App\Actions\UpdateKitchenStatusAction;
use App\Enums\KitchenStatus;
use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cashier\CancelOrderRequest;
use App\Http\Requests\Cashier\CashPaymentRequest;
use App\Http\Requests\Cashier\ManualOrderRequest;
use App\Models\DiningTable;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\RestaurantSetting;
use App\Support\MenuPresenter;
use App\Support\RestaurantPresenter;
use App\Support\TablePresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Modul E/F/H — Pesanan Manual Kasir & aksi mutasi pesanan.
 * Route: GET /kasir/pesanan, POST .../pay-cash, .../serve, .../cancel, .../manual
 */
class OrderController extends Controller
{
    public function __construct(
        private readonly ManualOrderAction $manualOrder,
        private readonly CashPaymentAction $cashPayment,
        private readonly CancelOrderAction $cancelOrder,
        private readonly UpdateKitchenStatusAction $updateKitchenStatus,
    ) {}

    public function index(): Response
    {
        return Inertia::render('Cashier/Orders', [
            'menus' => MenuPresenter::collection(MenuItem::query()->with('category')->available()->get()),
            'categories' => MenuPresenter::categoryNames(),
            'tables' => TablePresenter::collection(DiningTable::query()->active()->orderBy('number')->get()),
            'restaurant' => RestaurantPresenter::toArray(RestaurantSetting::current()),
        ]);
    }

    public function storeManualOrder(ManualOrderRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $table = DiningTable::query()->where('number', $data['table_number'])->where('is_active', true)->first();

        if ($table === null) {
            throw new NotFoundHttpException('Meja tidak ditemukan.');
        }

        $method = $data['payment_method'] === 'qris' ? PaymentMethod::Qris : PaymentMethod::Cash;

        $result = $this->manualOrder->execute(
            $table,
            $data['customer_name'],
            $method,
            array_map(fn ($item) => [
                'menu_id' => $item['menu_id'],
                'quantity' => $item['quantity'],
                'notes' => $item['notes'] ?? null,
            ], $data['items']),
            $request->user()->id,
            $data['cash_received'] ?? null,
        );

        return back()->with('status', "Pesanan {$result['order']->daily_queue_number} dibuat. Kembalian: Rp".number_format($result['change_due'], 0, ',', '.'));
    }

    public function payCash(CashPaymentRequest $request, Order $order): JsonResponse
    {
        try {
            $result = $this->cashPayment->execute($order, (int) $request->validated('cash_received'), $request->user()->id);
        } catch (ValidationException $e) {
            throw $e;
        }

        return response()->json([
            'success' => true,
            'order_code' => $result['order']->daily_queue_number,
            'total_bill' => $result['order']->total,
            'cash_received' => (int) $request->validated('cash_received'),
            'change_due' => $result['change_due'],
            'paid_at' => $result['order']->paid_at?->toIso8601String(),
        ]);
    }

    public function markServed(Order $order): RedirectResponse
    {
        $this->updateKitchenStatus->execute($order, KitchenStatus::Served, 'kasir', auth()->id());

        return back();
    }

    public function cancel(CancelOrderRequest $request, Order $order): RedirectResponse
    {
        $this->cancelOrder->execute($order, (string) $request->validated('reason', 'Dibatalkan oleh kasir.'), $request->user()->id);

        return back()->with('status', 'Pesanan dibatalkan.');
    }
}
