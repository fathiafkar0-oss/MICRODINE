<?php

use App\Http\Middleware\EnsureUserRole;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        channels: __DIR__.'/../routes/channels.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Railway memutus TLS di tepi jaringannya lalu meneruskan request ke
        // container sebagai HTTP biasa. Tanpa mempercayai header X-Forwarded-*,
        // Laravel membangun URL aset dengan skema http:// sehingga diblokir
        // browser sebagai mixed content pada halaman https://.
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'role' => EnsureUserRole::class,
        ]);

        // Staf yang sudah login diarahkan ke beranda sesuai perannya,
        // bukan ke halaman publik.
        $middleware->redirectUsersTo(function (Request $request): string {
            $user = $request->user();

            return $user === null ? '/' : route($user->role->homeRoute());
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
