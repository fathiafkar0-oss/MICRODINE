<?php

namespace App\Http\Requests\Cashier;

use Illuminate\Foundation\Http\FormRequest;

/**
 * ACT-07. `force=true` menutup sesi meski masih ada pesanan yang belum
 * `served` (dengan konfirmasi eksplisit dari kasir di sisi frontend).
 */
class CloseSessionRequest extends FormRequest
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
            'force' => ['sometimes', 'boolean'],
        ];
    }
}
