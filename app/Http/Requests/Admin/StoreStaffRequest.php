<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreStaffRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'lowercase', 'alpha_dash', 'max:50', 'unique:users,username'],
            'role' => ['required', 'string', 'in:admin,kasir,dapur'],
            'password' => ['required', 'string', 'min:4'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama staf wajib diisi.',
            'username.required' => 'Username wajib diisi.',
            'username.unique' => 'Username sudah digunakan oleh staf lain.',
            'username.alpha_dash' => 'Username hanya boleh huruf, angka, dan garis bawah/strip.',
            'role.required' => 'Peran staf wajib dipilih.',
            'role.in' => 'Peran staf tidak valid.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 4 karakter.',
        ];
    }
}
