<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Nomor meja hanya bisa diisi saat menambah (lihat komentar
 * resources/js/Pages/Admin/Partials/TableFormModal.jsx): mengubah nomor
 * membuat QR yang sudah dicetak tidak berlaku lagi.
 */
class StoreTableRequest extends FormRequest
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
            'number' => ['required', 'string', 'regex:/^[0-9]{1,2}$/', 'unique:dining_tables,number'],
            'seats' => ['required', 'integer', 'min:1', 'max:20'],
            'area' => ['required', 'string', 'max:50'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'number.regex' => 'Nomor meja harus 1-2 digit (01-99).',
            'number.unique' => 'Nomor meja ini sudah dipakai.',
        ];
    }
}
