<?php

namespace App\Http\Requests\Cashier;

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
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'table_number' => ['required', 'string', 'exists:dining_tables,number'],
            'customer_name' => ['required', 'string', 'max:50'],
            'payment_method' => ['required', 'in:tunai,qris'],
            'cash_received' => ['required_if:payment_method,tunai', 'integer', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_id' => ['required', 'integer', 'exists:menu_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'items.*.notes' => ['nullable', 'string', 'max:150'],
        ];
    }
}
