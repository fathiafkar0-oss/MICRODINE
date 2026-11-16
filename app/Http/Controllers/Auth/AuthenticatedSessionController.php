<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Portal masuk staf terpusat (satu pintu untuk kasir, dapur, admin).
 * Login memakai `username`, bukan email. Lihat PRD.md Bab 4.2.
 */
class AuthenticatedSessionController extends Controller
{
    /**
     * Tampilkan halaman login (komponen frontend sudah ada).
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/Login', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Proses login dan arahkan ke beranda sesuai peran akun.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $credentials = $request->only('username', 'password');

        /** @var User|null $user */
        $user = User::query()->where('username', $credentials['username'])->first();

        if ($user !== null && ! $user->is_active) {
            throw ValidationException::withMessages([
                'username' => 'Akun ini dinonaktifkan. Hubungi admin restoran.',
            ]);
        }

        // Remember-me belum dipakai: kolom remember_token tidak ada di desain tabel users.
        if ($user === null || ! Auth::attempt($credentials, false)) {
            throw ValidationException::withMessages([
                'username' => 'Username atau password salah.',
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route($user->role->homeRoute()));
    }

    /**
     * Keluar dari sesi staf.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
