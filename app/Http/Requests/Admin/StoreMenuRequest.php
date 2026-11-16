<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * ACT-08 (API_CONTRACT.md Bab 4). Harga & HPP wajib integer Rupiah (>= 0).
 */
class StoreMenuRequest extends FormRequest
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
            'category' => ['required', 'string', Rule::exists('categories', 'name')],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'integer', 'min:0'],
            'hpp' => ['required', 'integer', 'min:0'],
            'available' => ['sometimes', 'boolean'],
            'show_in_catalog' => ['sometimes', 'boolean'],
            'image' => ['nullable', 'image', 'max:2048'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category.exists' => 'Kategori tidak ditemukan.',
            'name.required' => 'Nama menu wajib diisi.',
            'price.min' => 'Harga jual tidak boleh negatif.',
            'hpp.min' => 'HPP tidak boleh negatif.',
            'image.max' => 'Ukuran foto maksimal 2 MB.',
        ];
    }
}
