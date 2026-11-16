<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#0A1D4B">

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        <x-inertia::head>
            <title>{{ config('app.name', 'MICRODINE') }}</title>
        </x-inertia::head>
    </head>
    <body class="bg-canvas text-ink antialiased">
        <x-inertia::app />
    </body>
</html>
