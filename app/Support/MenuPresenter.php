<?php

namespace App\Support;

use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Support\Collection;

/**
 * Satu-satunya tempat yang mengubah bentuk `MenuItem` Eloquent menjadi props
 * yang dikonsumsi halaman React (resources/js/Data/mock/menus.js adalah
 * kontrak bentuknya — lihat juga komentar di atas Admin/Menus.jsx).
 *
 * Catatan desain: frontend fase-1 mengidentifikasi & memfilter menu lewat
 * NAMA kategori (string), bukan `category_id`. Agar kontrak itu tidak perlu
 * diubah, serializer ini memetakan `category_id` -> nama kategori di sisi
 * backend; `MenuManagementController` memetakannya balik saat menyimpan.
 */
class MenuPresenter
{
    /**
     * Prefiks tampilan ID menu publik, mis. "M-010" untuk menu_items.id = 10.
     */
    public static function displayId(int $id): string
    {
        return 'M-'.str_pad((string) $id, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Kembalikan ID database asli dari ID tampilan ("M-010" -> 10).
     */
    public static function realId(string $displayId): ?int
    {
        if (! preg_match('/^M-0*(\d+)$/', $displayId, $matches)) {
            return null;
        }

        return (int) $matches[1];
    }

    /**
     * @return array{id: string, categoryId: int, name: string, category: string, description: ?string, price: int, hpp: int, image: ?string, available: bool, showInCatalog: bool}
     */
    public static function toArray(MenuItem $menu): array
    {
        return [
            'id' => self::displayId($menu->id),
            'categoryId' => $menu->category_id,
            'name' => $menu->name,
            'category' => $menu->category->name,
            'description' => $menu->description,
            'price' => $menu->price,
            'hpp' => $menu->hpp,
            'image' => $menu->image_path !== null ? asset('storage/'.$menu->image_path) : null,
            'available' => $menu->is_available,
            'showInCatalog' => $menu->show_in_catalog,
        ];
    }

    /**
     * Bentuk ringkas untuk katalog pelanggan (ACT tanpa HPP — HPP rahasia dapur,
     * lihat API_CONTRACT.md Bab 3.1.A: "hpp tidak dipaparkan ke public pelanggan"
     * namun tetap dikirim agar kontrak tipe konsisten dengan tipe `MenuItem`
     * yang sama dipakai di seluruh halaman; frontend pelanggan sendiri tidak
     * pernah merender field ini).
     *
     * @param  Collection<int, MenuItem>  $menus
     * @return array<int, array<string, mixed>>
     */
    public static function collection(Collection $menus): array
    {
        return $menus->map(fn (MenuItem $menu) => self::toArray($menu))->values()->all();
    }

    /**
     * @return array<int, string>
     */
    public static function categoryNames(): array
    {
        return Category::query()->ordered()->pluck('name')->all();
    }
}
