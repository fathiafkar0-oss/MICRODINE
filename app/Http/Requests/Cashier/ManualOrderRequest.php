<?php

namespace App\Http\Requests\Cashier;

use App\Support\MenuPresenter;
use Illuminate\Foundation\Http\FormRequest;

/**
 * ACT-02 (API_CONTRACT.md Bab 4).
 */
class ManualOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Lihat catatan yang sama di `CheckoutRequest::prepareForValidation()`.
     * Nama pemesan opsional di UI kasir (`Cashier/Orders.jsx`: "Opsional"),
     * jadi default ke "Pelanggan" saat kosong.
     */
    protected function prepareForValidation(): void
    {
        $items = $this->input('items', []);
        foreach ($items as $index => $item) {
            if (isset($item['menu_id']) && is_string($item['menu_id'])) {
                $items[$index]['menu_id'] = MenuPresenter::realId($item['menu_id']) ?? $item['menu_id'];
            }
        }
        $this->merge([
            'items' => $items,
            'customer_name' => trim((string) $this->input('customer_name')) !== '' ? $this->input('customer_name') : 'Pelanggan',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'table_number' => ['required', 'string', 'exists:dining_tables,number'],
            'customer_name' => ['required', 'string', 'max:50'],
            'payment_method' => ['required', 'in:tunai,qris'],
            // `Cashier/Orders.jsx` tidak punya input uang diterima terpisah (beda
            // dengan `CashPaymentModal` di papan Kanban) — nullable, lalu
            // `ManualOrderAction::execute()` default ke nilai pas (`$order->total`,
            // kembalian 0) saat tidak dikirim.
            'cash_received' => ['nullable', 'integer', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_id' => ['required', 'integer', 'exists:menu_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'items.*.notes' => ['nullable', 'string', 'max:150'],
        ];
    }
}
