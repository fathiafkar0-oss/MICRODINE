<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * Template Blade yang dimuat pada kunjungan pertama.
     *
     * @var string
     */
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        if (app()->environment('testing')) {
            return null;
        }

        return parent::version($request);
    }

    /**
     * Data yang dibagikan ke semua halaman.
     *
     * `auth.user` diisi setelah login staf; halaman frontend memakainya untuk
     * menampilkan identitas pengguna aktif.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'appName' => config('app.name'),
            'auth' => [
                'user' => $user === null ? null : [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'role' => $user->role->value,
                    'shift' => $user->role->value === 'admin' ? 'Pemilik' : 'Shift Pagi',
                ],
            ],
            'flash' => [
                'status' => $request->session()->get('status'),
                // Lihat `Cashier\TableManagementController::closeSession()` — dipakai
                // frontend untuk menampilkan tombol "tutup paksa" saat masih ada
                // pesanan belum disajikan di meja tersebut.
                'unservedCount' => $request->session()->get('unservedCount'),
            ],
        ];
    }
}
