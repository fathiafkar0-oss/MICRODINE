<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMenuRequest;
use App\Http\Requests\Admin\UpdateMenuRequest;
use App\Models\Category;
use App\Models\MenuItem;
use App\Support\MenuPresenter;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Modul C — Master Menu Admin.
 * Route: GET/POST/PUT/DELETE /admin/menu, PATCH /admin/menu/{id}/toggle-availability
 */
class MenuManagementController extends Controller
{
    public function index(): Response
    {
        $menus = MenuItem::query()->with('category')->orderBy('name')->get();

        return Inertia::render('Admin/Menus', [
            'menus' => MenuPresenter::collection($menus),
            'categories' => MenuPresenter::categoryNames(),
        ]);
    }

    public function store(StoreMenuRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $category = Category::query()->where('name', $data['category'])->firstOrFail();

        MenuItem::query()->create([
            'category_id' => $category->id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'price' => $data['price'],
            'hpp' => $data['hpp'],
            'image_path' => $this->storeImage($request),
            'is_available' => $data['available'] ?? true,
            'show_in_catalog' => $data['show_in_catalog'] ?? true,
        ]);

        return back()->with('status', 'Menu baru berhasil ditambahkan.');
    }

    public function update(UpdateMenuRequest $request, MenuItem $menuItem): RedirectResponse
    {
        $data = $request->validated();
        $category = Category::query()->where('name', $data['category'])->firstOrFail();

        // Integritas historis (AGENTS.md invarian #2): mengubah price/hpp di sini
        // HANYA memperbarui master data. Snapshot pada order_items transaksi lama
        // tidak pernah tersentuh — lihat OrderItem::$casts & migrasi order_items.
        $menuItem->update([
            'category_id' => $category->id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'price' => $data['price'],
            'hpp' => $data['hpp'],
            'image_path' => $this->storeImage($request) ?? $menuItem->image_path,
            'is_available' => $data['available'] ?? $menuItem->is_available,
            'show_in_catalog' => $data['show_in_catalog'] ?? $menuItem->show_in_catalog,
        ]);

        return back()->with('status', 'Menu berhasil diperbarui.');
    }

    public function destroy(MenuItem $menuItem): RedirectResponse
    {
        // Soft delete: pesanan lama yang mereferensikan menu ini tetap utuh
        // lewat name_snapshot pada order_items.
        $menuItem->delete();

        return back()->with('status', 'Menu dihapus.');
    }

    public function toggleAvailability(MenuItem $menuItem): RedirectResponse
    {
        $menuItem->update(['is_available' => ! $menuItem->is_available]);

        return back();
    }

    private function storeImage(StoreMenuRequest|UpdateMenuRequest $request): ?string
    {
        if (! $request->hasFile('image')) {
            return null;
        }

        return $request->file('image')->store('menu-photos', 'public');
    }
}
