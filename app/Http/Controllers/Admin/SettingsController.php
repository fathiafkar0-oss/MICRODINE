<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStaffRequest;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Models\RestaurantSetting;
use App\Models\User;
use App\Support\RestaurantPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Modul J — Pengaturan Restoran & Manajemen Akun Staf.
 * Route: GET/PUT /admin/pengaturan, POST /admin/pengaturan/staf, DELETE /admin/pengaturan/staf/{user}
 */
class SettingsController extends Controller
{
    public function index(): Response
    {
        $restaurant = RestaurantSetting::current();

        $staff = User::query()->orderBy('name')->get()->map(fn (User $user) => [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'role' => $user->role->value,
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

    public function storeStaff(StoreStaffRequest $request): RedirectResponse
    {
        $data = $request->validated();

        User::query()->create([
            'name' => $data['name'],
            'username' => strtolower($data['username']),
            'role' => $data['role'],
            'password' => Hash::make($data['password']),
            'is_active' => true,
        ]);

        return back()->with('status', "Akun staf {$data['name']} (@{$data['username']}) berhasil ditambahkan.");
    }

    public function destroyStaff(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['staff' => 'Tidak bisa menghapus akun yang sedang Anda gunakan saat ini.']);
        }

        $name = $user->name;
        $user->delete();

        return back()->with('status', "Akun staf {$name} berhasil dihapus.");
    }
}
