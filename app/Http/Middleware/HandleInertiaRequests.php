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
        return parent::version($request);
    }

    /**
     * Data yang dibagikan ke semua halaman.
     *
     * Fase frontend: `auth.user` masih null, sehingga halaman staf memakai
     * pengguna contoh dari resources/js/data/dummy.js. Backend cukup mengisi
     * nilai ini setelah autentikasi tersedia.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'appName' => config('app.name'),
            'auth' => [
                'user' => $request->user()?->only(['id', 'name', 'role']),
            ],
        ];
    }
}
