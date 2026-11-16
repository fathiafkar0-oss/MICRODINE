<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Atur target omzet bulanan (`TargetFormModal.jsx` hanya mengirim nominal
 * bulanan; target mingguan dibagi proporsional oleh backend).
 */
class UpdateSalesTargetRequest extends FormRequest
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
            'month' => ['required', 'date_format:Y-m'],
            'monthly_target' => ['required', 'integer', 'min:0'],
        ];
    }
}
