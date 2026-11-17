<?php

namespace App\Console\Commands;

use App\Models\MenuItem;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

/**
 * Pasang foto menu secara massal tanpa mengunggah satu per satu lewat UI.
 *
 * Cara pakai:
 *   1. Taruh berkas gambar di storage/app/public/menu-photos/
 *      Nama berkas mengikuti nama menu, mis. "ayam-bakar-madu.jpg".
 *   2. Jalankan: php artisan menu:foto
 *
 * Jalur ini menulis langsung ke database, jadi tidak lewat unggahan HTTP.
 */
class ImportMenuPhotos extends Command
{
    protected $signature = 'menu:foto
                            {--list : Tampilkan nama berkas yang diharapkan untuk tiap menu}
                            {--reset : Kosongkan image_path semua menu lebih dulu}';

    protected $description = 'Pasang foto menu dari storage/app/public/menu-photos berdasarkan nama berkas';

    private const DIR = 'menu-photos';

    public function handle(): int
    {
        $menus = MenuItem::query()->orderBy('name')->get();

        if ($menus->isEmpty()) {
            $this->error('Belum ada menu di database. Jalankan "php artisan db:seed" dulu.');

            return self::FAILURE;
        }

        if ($this->option('list')) {
            $this->info('Beri nama berkas fotomu persis seperti kolom "Nama berkas" di bawah ini:');
            $this->table(
                ['Menu', 'Nama berkas (tanpa ekstensi)'],
                $menus->map(fn (MenuItem $menu) => [$menu->name, Str::slug($menu->name)])->all(),
            );
            $this->line('');
            $this->line('Ekstensi yang diterima: .jpg .jpeg .png .webp');
            $this->line('Taruh berkasnya di: storage/app/public/'.self::DIR);

            return self::SUCCESS;
        }

        $dir = storage_path('app/public/'.self::DIR);

        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        if ($this->option('reset')) {
            MenuItem::query()->update(['image_path' => null]);
            $this->warn('Semua image_path dikosongkan lebih dulu.');
        }

        $files = collect(glob($dir.DIRECTORY_SEPARATOR.'*'))
            ->filter(fn (string $path) => is_file($path)
                && in_array(strtolower(pathinfo($path, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png', 'webp'], true));

        if ($files->isEmpty()) {
            $this->error('Tidak ada gambar di '.$dir);
            $this->line('Taruh fotonya di sana, lalu jalankan lagi. Untuk melihat nama berkas yang');
            $this->line('diharapkan: php artisan menu:foto --list');

            return self::FAILURE;
        }

        // Petakan slug nama menu -> model, untuk dicocokkan dengan nama berkas.
        $bySlug = $menus->keyBy(fn (MenuItem $menu) => Str::slug($menu->name));

        $applied = [];
        $unmatched = [];

        foreach ($files as $path) {
            $filename = basename($path);
            $slug = Str::slug(pathinfo($path, PATHINFO_FILENAME));

            $menu = $bySlug->get($slug);

            // Kalau tidak persis sama, terima kecocokan sebagian asalkan hanya satu menu yang cocok.
            if ($menu === null) {
                $candidates = $bySlug->filter(
                    fn (MenuItem $item, string $itemSlug) => str_contains($itemSlug, $slug) || str_contains($slug, $itemSlug),
                );

                $menu = $candidates->count() === 1 ? $candidates->first() : null;
            }

            if ($menu === null) {
                $unmatched[] = [$filename, 'tidak ada menu yang cocok'];

                continue;
            }

            $menu->update(['image_path' => self::DIR.'/'.$filename]);
            $applied[] = [$menu->name, $filename];
        }

        if ($applied !== []) {
            $this->info(count($applied).' foto terpasang:');
            $this->table(['Menu', 'Berkas'], $applied);
        }

        if ($unmatched !== []) {
            $this->warn(count($unmatched).' berkas tidak terpasang:');
            $this->table(['Berkas', 'Alasan'], $unmatched);
            $this->line('Lihat nama berkas yang diharapkan: php artisan menu:foto --list');
        }

        $kosong = MenuItem::query()->whereNull('image_path')->orderBy('name')->pluck('name');

        if ($kosong->isNotEmpty()) {
            $this->line('');
            $this->line($kosong->count().' menu masih tanpa foto: '.$kosong->implode(', '));
        }

        $this->line('');
        $this->info('Selesai. Pastikan "php artisan storage:link" sudah pernah dijalankan agar fotonya terbaca dari browser.');

        return self::SUCCESS;
    }
}
