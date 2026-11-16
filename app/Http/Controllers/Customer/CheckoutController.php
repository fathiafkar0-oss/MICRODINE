<?php

namespace App\Http\Controllers\Customer;

use App\Actions\CreateOrderAction;
use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CheckoutRequest;
use App\Models\RestaurantSetting;
use App\Services\TableSessionService;
use App\Support\RestaurantPresenter;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Modul E/F — Checkout Pembayaran Pelanggan.
 * Route: GET/POST /meja/{table}/checkout (ACT-01)
 */
class CheckoutController extends Controller
{
    public function __construct(
        private readonly TableSessionService $sessions,
        private readonly CreateOrderAction $createOrder,
    ) {}

    public function show(string $table): Response
    {
        return Inertia::render('Customer/Checkout/Index', [
            'table' => $table,
            'restaurant' => RestaurantPresenter::toArray(RestaurantSetting::current()),
        ]);
    }

    public function store(CheckoutRequest $request, string $table): RedirectResponse
    {
        $diningTable = $this->sessions->findTableByNumber($table);

        if ($diningTable === null) {
            throw new NotFoundHttpException('Meja tidak ditemukan atau sedang tidak aktif.');
        }

        $data = $request->validated();
        $method = $data['payment_method'] === 'qris' ? PaymentMethod::Qris : PaymentMethod::Cash;

        $order = $this->createOrder->execute(
            $diningTable,
            $data['customer_name'],
            $method->value,
            array_map(fn ($item) => [
                'menu_id' => $item['menu_id'],
                'quantity' => $item['quantity'],
                'notes' => $item['notes'] ?? null,
            ], $data['items']),
        );

        return redirect()
            ->route('customer.payment', ['code' => $order->daily_queue_number])
            ->with('status', 'Pesanan berhasil dibuat. Silakan selesaikan pembayaran.');
    }
}
