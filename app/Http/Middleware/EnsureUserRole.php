<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * RBAC sederhana: batasi rute staf berdasarkan peran akun.
 *
 * Pemakaian di rute: ->middleware('role:kasir,admin')
 */
class EnsureUserRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if ($user === null) {
            return redirect()->guest(route('login'));
        }

        // Akun yang dinonaktifkan saat sesi masih berjalan langsung diputus.
        if (! $user->is_active) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->with('status', 'Akun Anda dinonaktifkan. Silakan hubungi admin.');
        }

        $allowed = array_map(static fn (string $role): string => trim($role), $roles);

        abort_unless(in_array($user->role->value, $allowed, true), 403);

        return $next($request);
    }
}
