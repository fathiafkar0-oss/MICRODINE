<?php

namespace App\Http\Requests\Kitchen;

use Illuminate\Foundation\Http\FormRequest;

/**
 * ACT-04. Transisi dari 'cooking' ke 'done' dilakukan dari layar dapur.
 */
class UpdateKitchenStatusRequest extends FormRequest
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
            'status' => ['required', 'in:cooking,done'],
        ];
    }
}
