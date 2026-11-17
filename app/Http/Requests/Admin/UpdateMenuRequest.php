<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class UpdateMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * DIAGNOSTIK SEMENTARA - hapus setelah masalah unggah foto selesai.
     * Mencatat kode error PHP untuk berkas yang masuk, supaya ketahuan kenapa
     * validasi 'uploaded' gagal padahal berkasnya kecil.
     */
    protected function prepareForValidation(): void
    {
        $files = [];

        foreach ($_FILES as $key => $info) {
            $files[$key] = [
                'name' => $info['name'] ?? null,
                'size' => $info['size'] ?? null,
                'error' => $info['error'] ?? null,
                'tmp_name' => $info['tmp_name'] ?? null,
                'tmp_exists' => isset($info['tmp_name']) && $info['tmp_name'] !== '' && file_exists($info['tmp_name']),
            ];
        }

        Log::info('UPLOAD-DEBUG', [
            'method' => $this->getMethod(),
            'content_length' => $_SERVER['CONTENT_LENGTH'] ?? null,
            'content_type' => $_SERVER['CONTENT_TYPE'] ?? null,
            'files' => $files,
            'has_image' => $this->hasFile('image'),
            'image_input_type' => gettype($this->input('image')),
            'upload_tmp_dir' => ini_get('upload_tmp_dir'),
            'sys_temp' => sys_get_temp_dir(),
            'sys_temp_writable' => is_writable(sys_get_temp_dir()),
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'post_max_size' => ini_get('post_max_size'),
            'file_uploads' => ini_get('file_uploads'),
        ]);
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
        ];
    }
}
