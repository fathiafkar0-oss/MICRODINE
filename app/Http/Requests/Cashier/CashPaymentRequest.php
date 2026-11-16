<?php

namespace App\Http\Requests\Cashier;

use Illuminate\Foundation\Http\FormRequest;

/**
 * ACT-03. `gte:total_bill` divalidasi manual di controller/action karena
 * nilainya bergantung pada pesanan yang di-resolve lewat route model binding.
 */
class CashPaymentRequest extends FormRequest
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
            'cash_received' => ['required', 'integer', 'min:0'],
        ];
    }
}
