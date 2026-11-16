<?php

namespace App\Http\Requests\Customer;

use App\Support\MenuPresenter;
use Illuminate\Foundation\Http\FormRequest;

/**
 * ACT-01 (API_CONTRACT.md Bab 4).
 */
class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * `useCart` menyimpan `menuId` dalam format tampilan ("M-010", lihat
     * `MenuPresenter::displayId()`), bukan ID baris database mentah.
     * Normalisasi di sini sebelum rule `exists:menu_items,id` berjalan.
     */
    protected function prepareForValidation(): void
    {
        $items = $this->input('items', []);
        foreach ($items as $index => $item) {
            if (isset($item['menu_id']) && is_string($item['menu_id'])) {
                $items[$index]['menu_id'] = MenuPresenter::realId($item['menu_id']) ?? $item['menu_id'];
            }
        }
        $this->merge(['items' => $items]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'min:2', 'max:50'],
            'payment_method' => ['required', 'in:qris,tunai'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_id' => ['required', 'integer', 'exists:menu_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'items.*.notes' => ['nullable', 'string', 'max:150'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'customer_name.required' => 'Nama pemesan wajib diisi.',
            'items.required' => 'Keranjang masih kosong.',
            'items.*.menu_id.exists' => 'Menu tidak ditemukan.',
        ];
    }

    /**
     * Metode pembayaran frontend ('tunai') dipetakan ke nilai kolom
     * database ('cash') di controller, bukan di sini, agar FormRequest
     * tetap murni memvalidasi payload mentah dari browser.
     */
}
