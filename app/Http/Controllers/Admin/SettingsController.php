<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Models\RestaurantSetting;
use App\Models\User;
use App\Support\RestaurantPresenter;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Modul J — Pengaturan Restoran.
 * Route: GET/PUT /admin/pengaturan
 *
 * `Admin/Settings.jsx` tombol "Simpan Perubahan" memanggil endpoint ini via
 * `router.put()`. Tombol "Tambah Akun" masih placeholder (pembuatan akun
 * staf baru belum ada di scope modul yang disetujui — lihat PLAN.md).
 */
class SettingsController extends Controller
{
    public function index(): Response
    {
        $restaurant = RestaurantSetting::current();

        $staff = User::query()->orderBy('name')->get()->map(fn (User $user) => [
            'id' => $user->id,
            'name' => $user->name,
            'role' => $user->role->value,
            // Skema 11-tabel final tidak memiliki kolom "shift" pada users;
            // dikembalikan null agar halaman tetap merender tanpa error.
            'shift' => null,
        ])->all();

        return Inertia::render('Admin/Settings', [
            'restaurant' => RestaurantPresenter::toArray($restaurant),
            'staff' => $staff,
            'payment' => [
                'provider' => 'Midtrans',
                'mode' => config('services.midtrans.driver') === 'midtrans' ? 'production' : 'sandbox',
            ],
        ]);
    }

    public function update(UpdateSettingsRequest $request): RedirectResponse
    {
        $data = $request->validated();

        RestaurantSetting::current()->update([
            'restaurant_name' => $data['restaurant_name'],
            'address' => $data['address'] ?? null,
            'phone' => $data['phone'] ?? null,
            'tax_enabled' => $data['tax_enabled'],
            'tax_rate_percent' => $data['tax_rate_percent'],
            'qris_expires_minutes' => $data['payment_deadline_minutes'],
        ]);

        return back()->with('status', 'Pengaturan restoran disimpan.');
    }
}
