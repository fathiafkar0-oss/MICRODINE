<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\RestaurantSetting;
use App\Services\TableSessionService;
use App\Support\MenuPresenter;
use App\Support\RestaurantPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Modul E — Katalog Menu Pelanggan.
 * Route: GET /meja/{table}
 */
class MenuController extends Controller
{
    public function __construct(private readonly TableSessionService $sessions) {}

    public function show(Request $request, string $table): Response
    {
        $diningTable = $this->sessions->findTableByNumber($table);

        if ($diningTable === null) {
            throw new NotFoundHttpException('Meja tidak ditemukan atau sedang tidak aktif.');
        }

        $active = $diningTable->activeSession;

        $menus = MenuItem::query()->with('category')->inCatalog()->orderBy('name')->get();
        $categories = Category::query()->ordered()->get(['id', 'name', 'slug']);

        return Inertia::render('Customer/Menu/Index', [
            'table' => $diningTable->number,
            'session' => [
                'joined' => $active !== null,
                'sessionId' => $active?->id,
                'guestName' => null,
            ],
            'restaurant' => RestaurantPresenter::toArray(RestaurantSetting::current()),
            'categories' => $categories->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ]),
            'menus' => MenuPresenter::collection($menus),
        ]);
    }
}
