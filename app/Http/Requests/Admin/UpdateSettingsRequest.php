<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * [ACT-09] Pembaruan pengaturan restoran & tarif pajak (API_CONTRACT.md).
 */
class UpdateSettingsRequest extends FormRequest
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
            'restaurant_name' => ['required', 'string', 'max:100'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:30'],
            'tax_enabled' => ['required', 'boolean'],
            'tax_rate_percent' => ['required', 'integer', 'min:0', 'max:10'],
            'payment_deadline_minutes' => ['required', 'integer', 'min:5'],
        ];
    }
}
